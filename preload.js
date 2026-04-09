const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // API Key management
  apikeyGetStatus: () => ipcRenderer.invoke('apikey-get-status'),
  apikeySet: (apiKey) => ipcRenderer.invoke('apikey-set', apiKey),
  apikeyClear: () => ipcRenderer.invoke('apikey-clear'),
  apikeyValidate: (apiKey) => ipcRenderer.invoke('apikey-validate', apiKey),

  // Anthropic API key
  anthropicKeySet: (apiKey) => ipcRenderer.invoke('anthropic-key-set', apiKey),
  anthropicKeyClear: () => ipcRenderer.invoke('anthropic-key-clear'),

  // Vibe playlist generation
  vibeGenerate: (theme) => ipcRenderer.invoke('vibe-generate', theme),
  vibePromptGet: () => ipcRenderer.invoke('vibe-prompt-get'),
  vibePromptSet: (prompt) => ipcRenderer.invoke('vibe-prompt-set', prompt),
  vibePromptClear: () => ipcRenderer.invoke('vibe-prompt-clear'),

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

  // Backend URL
  backendUrlGet: () => ipcRenderer.invoke('backend-url-get'),
  backendUrlSet: (url) => ipcRenderer.invoke('backend-url-set', url),

  // Auth token (persisted in userData)
  authTokenGet: () => ipcRenderer.invoke('auth-token-get'),
  authTokenSet: (token) => ipcRenderer.invoke('auth-token-set', token),
  authTokenClear: () => ipcRenderer.invoke('auth-token-clear'),

  // Session persistence (roomId, memberId for crash recovery)
  sessionGet: () => ipcRenderer.invoke('session-get'),
  sessionSet: (session) => ipcRenderer.invoke('session-set', session),
  sessionClear: () => ipcRenderer.invoke('session-clear'),

  // Popout player
  popoutOpen: (videoId, currentTime, title) =>
    ipcRenderer.invoke('popout-open', { videoId, currentTime, title }),
  popoutClose: () => ipcRenderer.invoke('popout-close'),
  popoutLoadVideo: (videoId, title) =>
    ipcRenderer.invoke('popout-load-video', { videoId, title }),
  popoutPlay: () => ipcRenderer.invoke('popout-play'),
  popoutPause: () => ipcRenderer.invoke('popout-pause'),
  onPopoutClosed: (callback) => {
    ipcRenderer.on('popout-closed', (_event, currentTime) => callback(currentTime));
  },
  onPopoutVideoEnded: (callback) => {
    ipcRenderer.on('popout-video-ended', () => callback());
  },
  removePopoutListeners: () => {
    ipcRenderer.removeAllListeners('popout-closed');
    ipcRenderer.removeAllListeners('popout-video-ended');
  },
});
