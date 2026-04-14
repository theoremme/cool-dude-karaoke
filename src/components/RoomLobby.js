import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as authService from '../services/authService';
import logo from '../assets/cool-dude-karaoke-logo-v2-nobg.png';

const GREETINGS = [
  { text: "What's good,", end: "?" },
  { text: "'Sup,", end: "?" },
  { text: "What's poppin',", end: "?" },
  { text: "Yo, what up", end: "?" },
  { text: "Oh snap, it's", end: "!" },
];

const RoomLobby = ({ onJoinRoom, onOpenSettings }) => {
  const { user, logout } = useAuth();
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [activeRooms, setActiveRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const greeting = useMemo(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)], []);

  useEffect(() => {
    authService.getMyRooms()
      .then((data) => setActiveRooms(data.rooms || []))
      .catch(() => {})
      .finally(() => setRoomsLoading(false));

    // Auto-refresh room list every 10 seconds
    const interval = setInterval(() => {
      authService.getMyRooms()
        .then((data) => setActiveRooms(data.rooms || []))
        .catch(() => {});
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    setCreating(true);
    setError(null);

    try {
      const data = await authService.createRoom(roomName.trim());
      onJoinRoom(data.room);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setError(null);

    try {
      const data = await authService.getRoomByInviteCode(joinCode.trim().toUpperCase());
      onJoinRoom(data.room);
    } catch (err) {
      setError(err.response?.data?.error || 'Room not found');
    }
  };

  return (
    <div className="room-lobby">
      <div className="lobby-card">
        <div className="logo-wrap">
          <img src={logo} alt="Cool Dude Karaoke" className="auth-logo" />
          <span className="logo-subtitle">AMPED</span>
        </div>

        <div className="lobby-greeting">
          {greeting.text} {user?.name || user?.email}{greeting.end}
        </div>

        {roomsLoading ? (
          <div className="active-rooms">
            <h2>Your Active Rooms</h2>
            <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
              <div className="lobby-spinner" />
            </div>
          </div>
        ) : activeRooms.length > 0 ? (
          <div className="active-rooms">
            <h2>Your Active Rooms</h2>
            <div className="active-rooms-list">
              {activeRooms.map((room) => (
                <div key={room.id} className="active-room-item" onClick={() => onJoinRoom(room)}>
                  <div className="active-room-info">
                    <span className="active-room-name">{room.name}</span>
                    <span className="active-room-meta">
                      {room._count?.playlist || 0} song{room._count?.playlist !== 1 ? 's' : ''}
                      {' · '}{room._count?.members || 0} guest{room._count?.members !== 1 ? 's' : ''}
                      {' · '}{room.inviteCode}
                    </span>
                  </div>
                  <span className="active-room-rejoin">Rejoin</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {error && <div className="error-message">{error}</div>}

        <h2>Create a Room</h2>
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room name (e.g., Friday Night Karaoke)"
              maxLength={100}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={!roomName.trim() || creating}>
            {creating ? 'Creating...' : 'Create Room'}
          </button>
        </form>

        <div style={{
          borderTop: '1px solid rgba(0,200,255,0.1)',
          marginTop: 24,
          paddingTop: 24,
        }}>
          <h2>Join a Room</h2>
          <form onSubmit={handleJoin}>
            <div className="form-group">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter invite code (e.g., ABC123)"
                maxLength={6}
                style={{ textTransform: 'uppercase', letterSpacing: 3 }}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={!joinCode.trim()}>
              Join Room
            </button>
          </form>
        </div>

        <div className="lobby-footer">
          <button onClick={onOpenSettings} className="btn-lobby-settings">⚙</button>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomLobby;
