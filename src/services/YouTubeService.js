/**
 * YouTube API Service
 *
 * All YouTube API calls go through this service.
 * Uses ApiKeyManager for key retrieval - no hardcoded keys.
 */

const axios = require('axios');
const { apiKeyManager } = require('./ApiKeyManager');
const { YOUTUBE_CONFIG } = require('../config/youtube.config');

class YouTubeService {
  constructor() {
    this.baseUrl = YOUTUBE_CONFIG.API_BASE;
    this.quotaUsedToday = 0;
  }

  parseDuration(iso) {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    return (
      parseInt(match[1] || 0, 10) * 3600 +
      parseInt(match[2] || 0, 10) * 60 +
      parseInt(match[3] || 0, 10)
    );
  }

  formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  async searchVideos(query, maxResults = 20) {
    const apiKey = await apiKeyManager.getKey();

    const searchResponse = await axios.get(`${this.baseUrl}/search`, {
      params: {
        part: 'snippet',
        q: query.toLowerCase().includes('karaoke') ? query : `${query} karaoke`,
        type: 'video',
        maxResults,
        key: apiKey,
      },
    });

    const videoIds = searchResponse.data.items
      .map((item) => item.id.videoId)
      .join(',');

    if (!videoIds) return [];

    const detailsResponse = await axios.get(`${this.baseUrl}/videos`, {
      params: {
        part: 'contentDetails,snippet,status',
        id: videoIds,
        key: apiKey,
      },
    });

    this.quotaUsedToday += YOUTUBE_CONFIG.QUOTA_COST_SEARCH + YOUTUBE_CONFIG.QUOTA_COST_LIST;

    return detailsResponse.data.items.map((video) => {
      const durationSeconds = this.parseDuration(video.contentDetails.duration);
      return {
        videoId: video.id,
        title: video.snippet.title,
        channelName: video.snippet.channelTitle,
        thumbnail:
          video.snippet.thumbnails.medium?.url ||
          video.snippet.thumbnails.default?.url,
        durationSeconds,
        duration: this.formatDuration(durationSeconds),
        embeddable: video.status?.embeddable !== false,
      };
    });
  }

  async getVideoDetails(videoIds) {
    const apiKey = await apiKeyManager.getKey();

    const response = await axios.get(`${this.baseUrl}/videos`, {
      params: {
        part: 'contentDetails,snippet,status',
        id: Array.isArray(videoIds) ? videoIds.join(',') : videoIds,
        key: apiKey,
      },
    });

    this.quotaUsedToday += YOUTUBE_CONFIG.QUOTA_COST_LIST;

    return response.data.items.map((video) => {
      const durationSeconds = this.parseDuration(video.contentDetails.duration);
      return {
        videoId: video.id,
        title: video.snippet.title,
        channelName: video.snippet.channelTitle,
        thumbnail:
          video.snippet.thumbnails.medium?.url ||
          video.snippet.thumbnails.default?.url,
        durationSeconds,
        duration: this.formatDuration(durationSeconds),
        embeddable: video.status?.embeddable !== false,
      };
    });
  }

  async getPlaylistItems(playlistId) {
    const apiKey = await apiKeyManager.getKey();
    let allItems = [];
    let pageToken = null;

    do {
      const params = {
        part: 'snippet,contentDetails',
        playlistId,
        maxResults: 50,
        key: apiKey,
      };
      if (pageToken) params.pageToken = pageToken;

      const response = await axios.get(`${this.baseUrl}/playlistItems`, { params });
      this.quotaUsedToday += YOUTUBE_CONFIG.QUOTA_COST_LIST;

      const items = response.data.items
        .filter((item) => {
          // Skip private, deleted, and unavailable videos
          const title = item.snippet.title || '';
          if (
            title === 'Private video' ||
            title === 'Deleted video' ||
            title === 'Unavailable video' ||
            title.startsWith('[Private') ||
            title.startsWith('[Deleted') ||
            title.startsWith('[Unavailable') ||
            !item.snippet.thumbnails ||
            !item.contentDetails?.videoId
          ) return false;
          return true;
        })
        .map((item) => ({
          videoId: item.contentDetails.videoId,
          title: item.snippet.title,
          thumbnail:
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.default?.url || '',
          channelName: item.snippet.videoOwnerChannelTitle || '',
          position: item.snippet.position,
        }));

      allItems = allItems.concat(items);
      pageToken = response.data.nextPageToken;
    } while (pageToken);

    return allItems;
  }

  async getPlaylistInfo(playlistId) {
    const apiKey = await apiKeyManager.getKey();
    const response = await axios.get(`${this.baseUrl}/playlists`, {
      params: {
        part: 'snippet',
        id: playlistId,
        key: apiKey,
      },
    });
    this.quotaUsedToday += YOUTUBE_CONFIG.QUOTA_COST_LIST;

    const playlist = response.data.items[0];
    if (!playlist) return null;
    return {
      id: playlist.id,
      title: playlist.snippet.title,
      channelTitle: playlist.snippet.channelTitle,
    };
  }

  getQuotaInfo() {
    const used = this.quotaUsedToday;
    const limit = YOUTUBE_CONFIG.DAILY_QUOTA_LIMIT;
    const percentage = limit > 0 ? used / limit : 0;

    return {
      used,
      limit,
      percentage,
      remaining: limit - used,
      isWarning: percentage >= YOUTUBE_CONFIG.QUOTA_WARNING_THRESHOLD,
      isCritical: percentage >= YOUTUBE_CONFIG.QUOTA_CRITICAL_THRESHOLD,
      isPaused: percentage >= YOUTUBE_CONFIG.QUOTA_PAUSE_THRESHOLD,
    };
  }
}

const youtubeService = new YouTubeService();
module.exports = { youtubeService };
