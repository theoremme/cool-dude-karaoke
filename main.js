const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const { youtubeService } = require('./src/services/YouTubeService');
const { playlistSyncService } = require('./src/services/PlaylistSyncService');
const { apiKeyManager } = require('./src/services/ApiKeyManager');
const { vibeService } = require('./src/services/VibeService');

let mainWindow;
let popoutWindow;
let popoutPollTimer;
let localServer;

// YouTube cleanup CSS for popout window
const POPOUT_CSS = `
  ytd-masthead, #masthead-container, #related, #comments,
  #meta, #below, #secondary, #chat, #panels,
  ytd-watch-metadata, #info-contents, #description,
  tp-yt-app-drawer, #guide, #guide-button, #back-button,
  .ytp-chrome-top-buttons .ytp-watch-later-button,
  ytd-compact-video-renderer, ytd-watch-next-secondary-results-renderer,
  #actions, #menu, #subscribe-button, #sponsor-button,
  ytd-merch-shelf-renderer, ytd-engagement-panel-section-list-renderer,
  #contents.ytd-rich-grid-renderer, ytd-mini-guide-renderer,
  #bottom-row, #top-row.ytd-watch-metadata,
  .ytp-paid-content-overlay, .ytp-ce-element,
  ytd-popup-container, .ytd-popup-container,
  tp-yt-paper-dialog, ytd-consent-bump-v2-lightbox,
  .ytd-enforcement-message-view-model, .ytp-consent-overlay,
  ytd-modal-with-title-and-button-renderer,
  .ytd-popup-container, .yt-playability-error-supported-renderers,
  ytd-background-promo-renderer, #consent-bump,
  .ytp-error, .ytp-error-content-wrap
  { display: none !important; }

  [class*="blur"], [style*="blur"] { filter: none !important; }
  .html5-video-container { filter: none !important; }

  body > * { visibility: hidden !important; }
  body { overflow: hidden !important; background: #000 !important; margin: 0 !important; }
  html { overflow: hidden !important; background: #000 !important; }
  ytd-app { background: #000 !important; }

  #movie_player, #movie_player *, #content, ytd-app, ytd-page-manager,
  ytd-watch-flexy, #player, #player-container-outer, #player-container-inner,
  #player-container { visibility: visible !important; }

  #movie_player, #movie_player .html5-video-container, #movie_player video {
    position: fixed !important; top: 0 !important; left: 0 !important;
    width: 100vw !important; height: 100vh !important; z-index: 9999 !important;
  }
  #movie_player video { object-fit: contain !important; }
  .ytp-chrome-bottom { z-index: 10000 !important; }
`;

// Serve dist/ over HTTP
function startLocalServer() {
  return new Promise((resolve) => {
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
    };

    localServer = http.createServer((req, res) => {
      const urlPath = req.url.split('?')[0];
      const filePath = path.join(
        __dirname,
        'dist',
        urlPath === '/' ? 'index.html' : urlPath
      );

      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    });

    localServer.listen(0, '127.0.0.1', () => {
      resolve(localServer.address().port);
    });
  });
}

async function createWindow() {
  const port = await startLocalServer();

  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1100,
    minHeight: 750,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      sandbox: false,
    },
    title: 'Cool Dude Karaoke',
    icon: path.join(__dirname, 'src', 'assets', 'cool-dude-karaoke-logo-v2.png'),
    backgroundColor: '#000000',
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(`http://127.0.0.1:${port}`);

  // Fill screen height but keep width comfortable
  const { screen } = require('electron');
  const { height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow.setBounds({ width: 1600, height, y: 0 });
  mainWindow.center();

  // Wire up sync service push events to renderer
  playlistSyncService.onNewItems = (items) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('sync-new-items', items);
    }
  };

  playlistSyncService.onSyncStatus = (status) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('sync-status', status);
    }
  };

  playlistSyncService.onError = (error) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('sync-error', error);
    }
  };

  mainWindow.on('closed', () => {
    playlistSyncService.disconnect();
    if (popoutWindow && !popoutWindow.isDestroyed()) {
      popoutWindow.close();
    }
    mainWindow = null;
  });
}

// --- Popout Player ---

function injectPopoutCSS() {
  if (popoutWindow && !popoutWindow.isDestroyed()) {
    popoutWindow.webContents.insertCSS(POPOUT_CSS).catch(() => {});
  }
}

function waitForPopoutVideo() {
  if (!popoutWindow || popoutWindow.isDestroyed()) return;

  const check = setInterval(async () => {
    if (!popoutWindow || popoutWindow.isDestroyed()) {
      clearInterval(check);
      return;
    }
    try {
      const playing = await popoutWindow.webContents.executeJavaScript(`
        (() => {
          const v = document.querySelector('video');
          return v && v.readyState >= 3 && !v.paused;
        })()
      `);
      if (playing) {
        clearInterval(check);
        if (popoutWindow && !popoutWindow.isDestroyed()) {
          popoutWindow.show();
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('popout-ready');
          }
        }
      }
    } catch (e) {
      clearInterval(check);
    }
  }, 200);

  // Safety: show anyway after 8 seconds
  setTimeout(() => {
    clearInterval(check);
    if (popoutWindow && !popoutWindow.isDestroyed() && !popoutWindow.isVisible()) {
      popoutWindow.show();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('popout-ready');
      }
    }
  }, 8000);
}

function startPopoutPolling() {
  stopPopoutPolling();
  let lastEnded = false;

  popoutPollTimer = setInterval(async () => {
    if (!popoutWindow || popoutWindow.isDestroyed()) return;

    try {
      const state = await popoutWindow.webContents.executeJavaScript(`
        (() => {
          const v = document.querySelector('video');
          if (!v) return null;
          return { ended: v.ended, paused: v.paused, currentTime: v.currentTime };
        })()
      `);

      if (state && state.ended && !lastEnded) {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('popout-video-ended');
        }
      }

      if (state) {
        lastEnded = state.ended;
      }
    } catch (e) {
      // Window navigating
    }
  }, 500);
}

function stopPopoutPolling() {
  if (popoutPollTimer) {
    clearInterval(popoutPollTimer);
    popoutPollTimer = null;
  }
}

// --- IPC Handlers ---

// YouTube search
ipcMain.handle('youtube-search', async (event, query) => {
  try {
    const results = await youtubeService.searchVideos(query);
    return { success: true, data: results };
  } catch (error) {
    console.error('YouTube search error:', error.message);
    return { success: false, error: error.message };
  }
});

// Get playlist info (name, etc.)
ipcMain.handle('youtube-playlist-info', async (event, playlistId) => {
  try {
    const info = await youtubeService.getPlaylistInfo(playlistId);
    return { success: true, data: info };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get video details (for duration on synced items)
ipcMain.handle('youtube-video-details', async (event, videoIds) => {
  try {
    const details = await youtubeService.getVideoDetails(videoIds);
    return { success: true, data: details };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// --- API Key Management ---

ipcMain.handle('apikey-get-status', async () => {
  return apiKeyManager.getKeyStatus();
});

ipcMain.handle('apikey-set', async (event, apiKey) => {
  try {
    await apiKeyManager.setUserProvidedKey(apiKey);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('apikey-clear', async () => {
  apiKeyManager.clearUserProvidedKey();
  return { success: true };
});

ipcMain.handle('apikey-validate', async (event, apiKey) => {
  return apiKeyManager.validateKey(apiKey);
});

// --- Anthropic API Key ---

ipcMain.handle('anthropic-key-set', async (event, apiKey) => {
  apiKeyManager.setAnthropicKey(apiKey);
  return { success: true };
});

ipcMain.handle('anthropic-key-clear', async () => {
  apiKeyManager.clearAnthropicKey();
  return { success: true };
});

// --- Custom Vibe Prompt ---

ipcMain.handle('vibe-prompt-get', async () => {
  return { prompt: apiKeyManager.getVibePrompt() };
});

ipcMain.handle('vibe-prompt-set', async (event, prompt) => {
  apiKeyManager.setVibePrompt(prompt);
  return { success: true };
});

ipcMain.handle('vibe-prompt-clear', async () => {
  apiKeyManager.clearVibePrompt();
  return { success: true };
});

// --- Backend URL ---

ipcMain.handle('backend-url-get', async () => {
  return apiKeyManager.getBackendUrl();
});

ipcMain.handle('backend-url-set', async (event, url) => {
  apiKeyManager.setBackendUrl(url);
  return { success: true };
});

// --- Open External URL ---

ipcMain.handle('open-external', async (event, url) => {
  if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
    await shell.openExternal(url);
  }
});

// --- Auth Token ---

ipcMain.handle('auth-token-get', async () => {
  return apiKeyManager.getAuthToken();
});

ipcMain.handle('auth-token-set', async (event, token) => {
  apiKeyManager.setAuthToken(token);
  return { success: true };
});

ipcMain.handle('auth-token-clear', async () => {
  apiKeyManager.clearAuthToken();
  return { success: true };
});

// --- Session persistence ---

ipcMain.handle('session-get', async () => {
  return apiKeyManager.getSession();
});

ipcMain.handle('session-set', async (event, session) => {
  apiKeyManager.setSession(session);
  return { success: true };
});

ipcMain.handle('session-clear', async () => {
  apiKeyManager.clearSession();
  return { success: true };
});

// --- Vibe Playlist Generation ---

ipcMain.handle('vibe-generate', async (event, theme) => {
  try {
    const anthropicKey = apiKeyManager.getAnthropicKey();
    if (!anthropicKey) {
      return { success: false, error: 'Anthropic API key not set. Add it in Settings.' };
    }
    const suggestions = await vibeService.generateSuggestions(theme, anthropicKey);
    return { success: true, data: suggestions };
  } catch (error) {
    console.error('Vibe generation error:', error.message);
    return { success: false, error: error.message };
  }
});

// Connect to a YouTube playlist
ipcMain.handle('sync-connect', async (event, playlistIdOrUrl) => {
  try {
    const result = await playlistSyncService.connect(playlistIdOrUrl);
    return { success: true, data: result };
  } catch (error) {
    console.error('Sync connect error:', error.message);
    return { success: false, error: error.message };
  }
});

// Disconnect from YouTube playlist
ipcMain.handle('sync-disconnect', async () => {
  playlistSyncService.disconnect();
  return { success: true };
});

// Manual sync
ipcMain.handle('sync-now', async () => {
  try {
    await playlistSyncService.syncNow();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Update playback state for adaptive polling
ipcMain.handle('sync-set-playback', async (event, isPlaying) => {
  playlistSyncService.setPlaybackState(isPlaying);
  return { success: true };
});

// Get sync status
ipcMain.handle('sync-get-status', async () => {
  return playlistSyncService.getStatus();
});

// Get quota info
ipcMain.handle('get-quota-info', async () => {
  return youtubeService.getQuotaInfo();
});

// --- Popout IPC ---

ipcMain.handle('popout-open', async (event, { videoId, currentTime, title }) => {
  if (popoutWindow && !popoutWindow.isDestroyed()) {
    popoutWindow.focus();
    return { success: false, error: 'Already popped out' };
  }

  popoutWindow = new BrowserWindow({
    width: 960,
    height: 540,
    minWidth: 480,
    minHeight: 270,
    show: false,
    title: `Cool Dude Karaoke — ${title || 'Now Playing'}`,
    icon: path.join(__dirname, 'src', 'assets', 'cool-dude-karaoke-logo-v2.png'),
    backgroundColor: '#000000',
    autoHideMenuBar: true,
  });

  const t = Math.floor(currentTime || 0);
  const url = `https://www.youtube.com/watch?v=${videoId}&autoplay=1${t > 0 ? `&t=${t}` : ''}`;
  popoutWindow.loadURL(url);

  let popoutCssInjectedForUrl = null;

  popoutWindow.webContents.on('dom-ready', () => {
    const currentUrl = popoutWindow.webContents.getURL();
    if (popoutCssInjectedForUrl !== currentUrl) {
      popoutCssInjectedForUrl = currentUrl;
      injectPopoutCSS();
    }
    // Wait for video to actually play before showing window
    waitForPopoutVideo();
  });
  popoutWindow.webContents.on('did-navigate-in-page', () => {
    popoutCssInjectedForUrl = null; // Reset for SPA navigation
    injectPopoutCSS();
  });

  startPopoutPolling();

  // Grab timestamp before window closes, then notify main window
  popoutWindow.on('close', async () => {
    let currentTime = 0;
    try {
      currentTime = await popoutWindow.webContents.executeJavaScript(
        'document.querySelector("video")?.currentTime || 0'
      );
    } catch (e) {}
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('popout-closed', currentTime);
    }
  });

  popoutWindow.on('closed', () => {
    stopPopoutPolling();
    popoutWindow = null;
  });

  return { success: true };
});

ipcMain.handle('popout-close', async () => {
  if (!popoutWindow || popoutWindow.isDestroyed()) {
    return { success: true, currentTime: 0 };
  }

  let currentTime = 0;
  try {
    currentTime = await popoutWindow.webContents.executeJavaScript(
      'document.querySelector("video")?.currentTime || 0'
    );
  } catch (e) {}

  popoutWindow.close();
  return { success: true, currentTime };
});

ipcMain.handle('popout-load-video', async (event, { videoId, title }) => {
  if (!popoutWindow || popoutWindow.isDestroyed()) {
    return { success: false };
  }

  popoutWindow.setTitle(`Cool Dude Karaoke — ${title || 'Now Playing'}`);
  const url = `https://www.youtube.com/watch?v=${videoId}&autoplay=1`;
  popoutWindow.loadURL(url);
  return { success: true };
});

ipcMain.handle('popout-play', async () => {
  if (!popoutWindow || popoutWindow.isDestroyed()) return;
  try {
    await popoutWindow.webContents.executeJavaScript(
      'document.querySelector("video")?.play()'
    );
  } catch (e) {}
});

ipcMain.handle('popout-pause', async () => {
  if (!popoutWindow || popoutWindow.isDestroyed()) return;
  try {
    await popoutWindow.webContents.executeJavaScript(
      'document.querySelector("video")?.pause()'
    );
  } catch (e) {}
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (localServer) localServer.close();
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
