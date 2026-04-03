/**
 * Playlist Sync Service
 *
 * Handles polling a YouTube playlist for new additions.
 * Adaptive polling: 5s when playing, 30s when paused, stops when idle >5min.
 */

const { youtubeService } = require('./YouTubeService');
const { YOUTUBE_CONFIG } = require('../config/youtube.config');

class PlaylistSyncService {
  constructor() {
    this.connectedPlaylistId = null;
    this.pollingTimer = null;
    this.lastKnownVideoIds = new Set();
    this.isPlaying = false;
    this.lastActivityTime = Date.now();
    this.lastSyncTime = null;
    this.onNewItems = null;      // callback: (items) => void
    this.onSyncStatus = null;    // callback: (status) => void
    this.onError = null;         // callback: (error) => void
  }

  /**
   * Extract playlist ID from URL or raw ID.
   */
  parsePlaylistId(input) {
    const trimmed = input.trim();
    // URL format: https://www.youtube.com/playlist?list=PLxxxxx
    const urlMatch = trimmed.match(/[?&]list=([^&]+)/);
    if (urlMatch) return urlMatch[1];
    // Assume raw playlist ID
    return trimmed;
  }

  /**
   * Connect to a YouTube playlist and start syncing.
   */
  async connect(playlistIdOrUrl) {
    const playlistId = this.parsePlaylistId(playlistIdOrUrl);

    // YouTube Mix/Radio playlists (RD prefix) are dynamically generated
    // and not accessible via the YouTube Data API
    if (playlistId.startsWith('RD')) {
      throw new Error(
        'YouTube Mix/Radio playlists are not supported — they are dynamically generated and not accessible via the API. Use a regular playlist (create one and add songs to it).'
      );
    }

    this.connectedPlaylistId = playlistId;
    this.lastActivityTime = Date.now();

    // Get initial items and enrich with duration info
    const items = await youtubeService.getPlaylistItems(playlistId);
    this.lastKnownVideoIds = new Set(items.map((item) => item.videoId));
    this.lastSyncTime = Date.now();

    // Get video details (duration) for all items
    let enrichedItems = items;
    if (items.length > 0) {
      const videoIds = items.map((item) => item.videoId);
      const details = await youtubeService.getVideoDetails(videoIds);
      enrichedItems = items.map((item) => {
        const detail = details.find((d) => d.videoId === item.videoId);
        return {
          ...item,
          duration: detail?.duration || '0:00',
          durationSeconds: detail?.durationSeconds || 0,
          channelName: detail?.channelName || item.channelName,
        };
      });
    }

    this._emitStatus();
    this.startPolling();

    return { playlistId, items: enrichedItems };
  }

  /**
   * Disconnect from the playlist and stop polling.
   */
  disconnect() {
    this.stopPolling();
    this.connectedPlaylistId = null;
    this.lastKnownVideoIds.clear();
    this.lastSyncTime = null;
    this._emitStatus();
  }

  /**
   * Start the polling loop.
   */
  startPolling() {
    this.stopPolling();
    const interval = this._getCurrentInterval();
    if (interval <= 0) return;

    this.pollingTimer = setInterval(() => this._poll(), interval);
  }

  /**
   * Stop the polling loop.
   */
  stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  /**
   * Manual sync trigger.
   */
  async syncNow() {
    this.lastActivityTime = Date.now();
    await this._poll();
  }

  /**
   * Update playback state to adjust polling rate.
   */
  setPlaybackState(isPlaying) {
    this.isPlaying = isPlaying;
    this.lastActivityTime = Date.now();
    if (this.connectedPlaylistId) {
      this.startPolling(); // restart with new interval
    }
  }

  /**
   * Record user activity to prevent idle timeout.
   */
  recordActivity() {
    this.lastActivityTime = Date.now();
    // Resume polling if it was stopped due to idle
    if (this.connectedPlaylistId && !this.pollingTimer) {
      this.startPolling();
    }
  }

  /**
   * Get current sync status.
   */
  getStatus() {
    return {
      connected: !!this.connectedPlaylistId,
      playlistId: this.connectedPlaylistId,
      lastSyncTime: this.lastSyncTime,
      secondsSinceSync: this.lastSyncTime
        ? Math.floor((Date.now() - this.lastSyncTime) / 1000)
        : null,
      isPolling: !!this.pollingTimer,
      pollingInterval: this._getCurrentInterval(),
      quota: youtubeService.getQuotaInfo(),
    };
  }

  // --- Private methods ---

  async _poll() {
    if (!this.connectedPlaylistId) return;

    // Check idle timeout
    const idleMs = Date.now() - this.lastActivityTime;
    if (idleMs > YOUTUBE_CONFIG.IDLE_TIMEOUT) {
      this.stopPolling();
      this._emitStatus();
      return;
    }

    // Check quota
    const quota = youtubeService.getQuotaInfo();
    if (quota.isPaused) {
      this.stopPolling();
      if (this.onError) this.onError('Quota limit reached — polling paused.');
      this._emitStatus();
      return;
    }

    // If critical, slow down polling
    if (quota.isCritical && this._getCurrentInterval() < YOUTUBE_CONFIG.POLLING_INTERVAL_PAUSED) {
      this.isPlaying = false; // force slow polling
      this.startPolling();
    }

    try {
      const currentItems = await youtubeService.getPlaylistItems(this.connectedPlaylistId);
      this.lastSyncTime = Date.now();

      const newItems = currentItems.filter(
        (item) => !this.lastKnownVideoIds.has(item.videoId)
      );

      if (newItems.length > 0) {
        // Get full video details (duration) for new items
        const videoIds = newItems.map((item) => item.videoId);
        const details = await youtubeService.getVideoDetails(videoIds);

        // Merge detail info into new items
        const enrichedItems = newItems.map((item) => {
          const detail = details.find((d) => d.videoId === item.videoId);
          return {
            ...item,
            duration: detail?.duration || '0:00',
            durationSeconds: detail?.durationSeconds || 0,
            channelName: detail?.channelName || item.channelName,
          };
        });

        if (this.onNewItems) this.onNewItems(enrichedItems);

        // Update known set
        for (const item of currentItems) {
          this.lastKnownVideoIds.add(item.videoId);
        }
      }

      this._emitStatus();
    } catch (error) {
      console.error('Playlist sync error:', error.message);
      // Only surface quota errors to the user; transient API errors are logged silently
      if (error.message && error.message.toLowerCase().includes('quota')) {
        if (this.onError) this.onError(error.message);
      }
    }
  }

  _getCurrentInterval() {
    if (this.isPlaying) return YOUTUBE_CONFIG.POLLING_INTERVAL_ACTIVE;
    return YOUTUBE_CONFIG.POLLING_INTERVAL_PAUSED;
  }

  _emitStatus() {
    if (this.onSyncStatus) this.onSyncStatus(this.getStatus());
  }
}

const playlistSyncService = new PlaylistSyncService();
module.exports = { playlistSyncService };
