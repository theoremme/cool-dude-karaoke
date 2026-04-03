const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {

  // YouTube search
  searchYouTube: (query) => ipcRenderer.invoke('youtube-search', query),

  // Video details
  getVideoDetails: (videoIds) => ipcRenderer.invoke('youtube-video-details', videoIds),

  // Playlist info
  getPlaylistInfo: (playlistId) => ipcRenderer.invoke('youtube-playlist-info', playlistId),

  // Playlist sync
  syncConnect: (playlistIdOrUrl) => ipcRenderer.invoke('sync-connect', playlistIdOrUrl),
  syncDisconnect: () => ipcRenderer.invoke('sync-disconnect'),
  syncNow: () => ipcRenderer.invoke('sync-now'),
  syncSetPlayback: (isPlaying) => ipcRenderer.invoke('sync-set-playback', isPlaying),
  syncGetStatus: () => ipcRenderer.invoke('sync-get-status'),

  // Quota
  getQuotaInfo: () => ipcRenderer.invoke('get-quota-info'),

  // Push events from main process
  onSyncNewItems: (callback) => {
    ipcRenderer.on('sync-new-items', (_event, items) => callback(items));
  },
  onSyncStatus: (callback) => {
    ipcRenderer.on('sync-status', (_event, status) => callback(status));
  },
  onSyncError: (callback) => {
    ipcRenderer.on('sync-error', (_event, error) => callback(error));
  },
  removeSyncListeners: () => {
    ipcRenderer.removeAllListeners('sync-new-items');
    ipcRenderer.removeAllListeners('sync-status');
    ipcRenderer.removeAllListeners('sync-error');
  },
});
