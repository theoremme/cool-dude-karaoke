import React, { useState, useEffect, useCallback } from 'react';
import { usePlaylist } from '../contexts/PlaylistContext';

const PlaylistSync = () => {
  const { addItems } = usePlaylist();
  const [playlistInput, setPlaylistInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [playlistId, setPlaylistId] = useState(null);
  const [playlistName, setPlaylistName] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(false);

  // Listen for push events from main process
  useEffect(() => {
    window.api.onSyncNewItems((items) => {
      addItems(items);
    });

    window.api.onSyncStatus((status) => {
      setSyncStatus(status);
    });

    window.api.onSyncError((err) => {
      setError(err);
    });

    return () => {
      window.api.removeSyncListeners();
    };
  }, [addItems]);

  // Poll for status updates while connected
  useEffect(() => {
    if (!connected) return;
    const interval = setInterval(async () => {
      const status = await window.api.syncGetStatus();
      setSyncStatus(status);
    }, 2000);
    return () => clearInterval(interval);
  }, [connected]);

  const handleConnect = useCallback(async () => {
    if (!playlistInput.trim()) return;
    setConnecting(true);
    setError(null);

    try {
      const result = await window.api.syncConnect(playlistInput.trim());
      if (result.success) {
        setConnected(true);
        setPlaylistId(result.data.playlistId);
        // Add existing playlist items to the queue
        if (result.data.items && result.data.items.length > 0) {
          addItems(result.data.items);
        }
        // Fetch playlist name (non-blocking)
        window.api.getPlaylistInfo(result.data.playlistId).then((infoResult) => {
          if (infoResult && infoResult.success && infoResult.data) {
            setPlaylistName(infoResult.data.title);
          }
        }).catch(() => {});
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to connect to playlist');
    } finally {
      setConnecting(false);
    }
  }, [playlistInput]);

  const handleDisconnect = useCallback(async () => {
    await window.api.syncDisconnect();
    setConnected(false);
    setPlaylistId(null);
    setPlaylistName(null);
    setSyncStatus(null);
  }, []);

  const handleSyncNow = useCallback(async () => {
    setError(null);
    const result = await window.api.syncNow();
    if (!result.success) {
      setError(result.error);
    }
  }, []);

  const formatSyncTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '—';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  const quota = syncStatus?.quota;

  return (
    <div className="playlist-sync">
      <h3 className="sync-title">YouTube Playlist Sync</h3>

      {!connected ? (
        <div className="sync-connect">
          <input
            type="text"
            className="sync-input"
            placeholder="Paste YouTube playlist URL or ID..."
            value={playlistInput}
            onChange={(e) => setPlaylistInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
            disabled={connecting}
          />
          <button
            className="btn-neon btn-small"
            onClick={handleConnect}
            disabled={connecting || !playlistInput.trim()}
          >
            {connecting ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      ) : (
        <div className="sync-connected">
          {playlistName && (
            <p className="sync-playlist-name" title={playlistName}>{playlistName}</p>
          )}
          <div className="sync-status-row">
            <span className="sync-dot sync-dot-active" />
            <span className="sync-label">Connected</span>
            <button className="btn-neon btn-small" onClick={handleSyncNow}>
              Sync Now
            </button>
            <button
              className="btn-neon btn-small btn-danger"
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          </div>

          {syncStatus && (
            <div className="sync-details">
              <span>
                Last sync:{' '}
                {formatSyncTime(syncStatus.secondsSinceSync)}
              </span>
              <span>
                Polling: {syncStatus.isPolling
                  ? `every ${syncStatus.pollingInterval / 1000}s`
                  : 'paused'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quota meter */}
      {quota && (
        <div className="quota-meter">
          <div className="quota-bar">
            <div
              className={`quota-fill ${quota.isWarning ? 'quota-warning' : ''} ${quota.isCritical ? 'quota-critical' : ''}`}
              style={{ width: `${Math.min(quota.percentage * 100, 100)}%` }}
            />
          </div>
          <span className="quota-text">
            API: {quota.used} / {quota.limit} ({Math.round(quota.percentage * 100)}%)
          </span>
        </div>
      )}

      {error && <div className="sync-error">{error}</div>}
    </div>
  );
};

export default PlaylistSync;
