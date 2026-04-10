import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SocketProvider, useSocket } from './hooks/useSocket';
import { PlaylistProvider } from './contexts/PlaylistContext';
import AuthPage from './components/AuthPage';
import RoomLobby from './components/RoomLobby';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import VibeSuggestions from './components/VibeSuggestions';
import VideoPlayer from './components/VideoPlayer';
import PlaylistQueue from './components/PlaylistQueue';
import PlaylistSync from './components/PlaylistSync';
import RoomPanel from './components/RoomPanel';
import Closeout from './components/Closeout';
import Settings from './components/Settings';
import logo from './assets/cool-dude-karaoke-logo-v2-nobg.png';
import './styles/App.css';

// The main host dashboard (existing UI)
const Dashboard = ({ room, onLeaveRoom, onCloseRoom }) => {
  const { socket, connected, on, off, joinRoom, leaveRoom } = useSocket();
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [vibeSuggestions, setVibeSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vibeLoading, setVibeLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vibeTheme, setVibeTheme] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showBailModal, setShowBailModal] = useState(false);
  const [members, setMembers] = useState([]);
  const joinedRef = useRef(false);

  // Join room via socket on mount and on reconnect
  useEffect(() => {
    if (!connected || !room) return;
    joinedRef.current = true;
    joinRoom(room, user?.id);
  }, [connected, room, user, joinRoom]);

  // Listen for room-level socket events
  useEffect(() => {
    if (!socket) return;

    const handleRoomUpdated = ({ room: updatedRoom, playlist, members: roomMembers }) => {
      setMembers(roomMembers || []);
      // Save session for crash recovery
      window.api.sessionSet({
        roomId: updatedRoom.id,
        inviteCode: updatedRoom.inviteCode || updatedRoom.invite_code,
        roomName: updatedRoom.name,
      });
    };

    const handleUserJoined = (member) => {
      setMembers((prev) => [...prev, member]);
    };

    const handleUserLeft = ({ id }) => {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    };

    const handleRoomClosed = ({ room: closedRoom, playlist: finalPlaylist }) => {
      if (onCloseRoom) {
        onCloseRoom(closedRoom || room, finalPlaylist || []);
      } else {
        onLeaveRoom();
      }
    };

    const handleInactivityWarning = ({ remainingSeconds }) => {
      // Respond immediately — we're the active host
      socket.emit('activity-ping', { roomId: room.id });
    };

    const handleModeChanged = ({ mode, triggeredBy }) => {
      console.log(`[Mode] Room switched to ${mode} by ${triggeredBy}`);
    };

    const handleRejoined = async ({ memberId }) => {
      const saved = await window.api.sessionGet();
      if (saved) {
        await window.api.sessionSet({ ...saved, memberId });
      }
    };

    on('room-updated', handleRoomUpdated);
    on('user-joined', handleUserJoined);
    on('user-left', handleUserLeft);
    on('room-closed', handleRoomClosed);
    on('inactivity-warning', handleInactivityWarning);
    on('inactivity-cleared', () => {});
    on('mode-changed', handleModeChanged);
    on('rejoined', handleRejoined);

    return () => {
      off('room-updated', handleRoomUpdated);
      off('user-joined', handleUserJoined);
      off('user-left', handleUserLeft);
      off('room-closed', handleRoomClosed);
      off('inactivity-warning', handleInactivityWarning);
      off('mode-changed', handleModeChanged);
      off('rejoined', handleRejoined);
    };
  }, [socket, room, on, off, onLeaveRoom]);

  const handleLobby = () => {
    if (room) leaveRoom(room.id);
    onLeaveRoom();
  };

  const handleBail = () => {
    setShowBailModal(true);
  };

  const confirmBail = () => {
    setShowBailModal(false);
    if (room && socket) {
      socket.emit('close-room', { roomId: room.id });
    }
  };

  const handleSearch = async (query) => {
    setLoading(true);
    setError(null);
    setResults([]);
    setVibeSuggestions([]);
    setVibeTheme(null);

    try {
      const response = await window.api.searchYouTube(query);
      if (response.success) {
        setResults(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to search YouTube. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVibe = async (theme) => {
    setVibeLoading(true);
    setError(null);
    setResults([]);
    setVibeSuggestions([]);
    setVibeTheme(theme);

    try {
      const response = await window.api.vibeGenerate(theme);
      if (response.success) {
        setVibeSuggestions(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to generate playlist. Check your Anthropic API key in Settings.');
    } finally {
      setVibeLoading(false);
    }
  };

  const [loadingMore, setLoadingMore] = useState(false);

  const handleRequestMore = async () => {
    if (!vibeTheme) return;
    setLoadingMore(true);
    setError(null);

    try {
      const existingTitles = vibeSuggestions.map(
        (s) => `${s.title} by ${s.artist}`
      );
      const moreTheme = `${vibeTheme}\n\nDo NOT include any of these songs (already suggested):\n${existingTitles.join('\n')}`;

      const response = await window.api.vibeGenerate(moreTheme);
      if (response.success) {
        const existing = new Set(
          vibeSuggestions.map((s) => `${s.title}|||${s.artist}`.toLowerCase())
        );
        const unique = response.data.filter(
          (s) => !existing.has(`${s.title}|||${s.artist}`.toLowerCase())
        );
        setVibeSuggestions((prev) => [...prev, ...unique]);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to generate more suggestions.');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <PlaylistProvider socket={socket} roomId={room?.id}>
      <div className="app">
        <header className="app-header">
          <div className="logo-wrap">
            <img src={logo} alt="Cool Dude Karaoke" className="app-logo" />
            <span className="logo-subtitle">AMPED</span>
          </div>
          <div className="header-left">
            <button className="btn-header-btn" onClick={handleLobby}>Lobby</button>
            {!connected && <span className="header-disconnected">Reconnecting...</span>}
          </div>
          <div className="header-actions">
            {room && (
              <button
                className="btn-header-btn btn-header-bail"
                onClick={handleBail}
              >
                Bail
              </button>
            )}
            <button
              className="btn-settings"
              onClick={() => setSettingsOpen(true)}
              title="Settings"
            >
              &#9881;
            </button>
          </div>
        </header>

        <div className="app-body">
          <div className="panel-left">
            <VideoPlayer />
            <div className="search-section">
              <SearchBar
                onSearch={handleSearch}
                onVibe={handleVibe}
                loading={loading}
                vibeLoading={vibeLoading}
              />
              {error && <div className="error-message">{error}</div>}
              {loading && <div className="loading">Searching...</div>}
              {vibeLoading && (
                <div className="loading">
                  ✦ Generating "{vibeTheme}" playlist...
                </div>
              )}
              {vibeSuggestions.length > 0 && (
                <VibeSuggestions
                  theme={vibeTheme}
                  suggestions={vibeSuggestions}
                  onRequestMore={handleRequestMore}
                  loadingMore={loadingMore}
                />
              )}
              <SearchResults results={results} />
            </div>
          </div>

          <div className="panel-right">
            <RoomPanel room={room} members={members} currentUserId={user?.id} />
            <PlaylistQueue />
            <PlaylistSync />
          </div>
        </div>

        <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

        {showBailModal && (
          <div className="bail-overlay" onClick={() => setShowBailModal(false)}>
            <div className="bail-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Callin' it quits?</h2>
              <p>This will end the room for everyone. Guests will be kicked out and the session will close.</p>
              <div className="bail-actions">
                <button className="btn-neon" onClick={confirmBail}>End Session</button>
                <button className="btn-neon btn-bail-keep" onClick={() => setShowBailModal(false)}>Keep Going</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PlaylistProvider>
  );
};

// View router: login -> lobby -> dashboard
const AppRouter = () => {
  const { user, loading } = useAuth();
  const [currentRoom, setCurrentRoom] = useState(null);
  const [closeoutData, setCloseoutData] = useState(null); // { room, playlist }
  const [backendUrl, setBackendUrl] = useState(null);
  const [token, setToken] = useState(null);

  // Load backend URL and token for socket
  useEffect(() => {
    (async () => {
      const url = await window.api.backendUrlGet();
      setBackendUrl(url);
      const t = await window.api.authTokenGet();
      setToken(t);
    })();
  }, [user]); // Re-fetch when user changes (login/logout)

  const handleJoinRoom = useCallback(async (room) => {
    setCurrentRoom(room);
    await window.api.sessionSet({
      roomId: room.id,
      inviteCode: room.inviteCode,
      roomName: room.name,
    });
  }, []);

  const handleLeaveRoom = useCallback(async () => {
    setCurrentRoom(null);
    await window.api.sessionClear();
  }, []);

  const handleCloseRoom = useCallback(async (room, playlist) => {
    setCloseoutData({ room, playlist });
    setCurrentRoom(null);
    await window.api.sessionClear();
  }, []);

  const handleBackToLobby = useCallback(() => {
    setCloseoutData(null);
  }, []);

  if (loading) {
    return (
      <div className="auth-page">
        <div className="logo-wrap">
          <img src={logo} alt="Cool Dude Karaoke" className="auth-logo" />
          <span className="logo-subtitle">AMPED</span>
        </div>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (closeoutData) {
    return <Closeout room={closeoutData.room} playlist={closeoutData.playlist} onBackToLobby={handleBackToLobby} />;
  }

  if (!currentRoom) {
    return <RoomLobby onJoinRoom={handleJoinRoom} />;
  }

  return (
    <SocketProvider backendUrl={backendUrl} token={token}>
      <Dashboard room={currentRoom} onLeaveRoom={handleLeaveRoom} onCloseRoom={handleCloseRoom} />
    </SocketProvider>
  );
};

const App = () => (
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);

export default App;
