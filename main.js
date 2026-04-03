const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

require('dotenv').config();

const { youtubeService } = require('./src/services/YouTubeService');
const { playlistSyncService } = require('./src/services/PlaylistSyncService');

let mainWindow;
let localServer;

// Serve dist/ over HTTP so YouTube IFrame API works (rejects file:// origins)
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
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
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
  });

  mainWindow.loadURL(`http://127.0.0.1:${port}`);

  // Temporary: DevTools for debugging
  mainWindow.webContents.openDevTools();

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
    mainWindow = null;
  });
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
