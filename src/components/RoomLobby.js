import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as authService from '../services/authService';
import logo from '../assets/cool-dude-karaoke-logo-v2.png';

const RoomLobby = ({ onJoinRoom }) => {
  const { user, logout } = useAuth();
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [activeRooms, setActiveRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  useEffect(() => {
    authService.getMyRooms()
      .then((data) => setActiveRooms(data.rooms || []))
      .catch(() => {})
      .finally(() => setRoomsLoading(false));
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
        <img src={logo} alt="Cool Dude Karaoke" className="auth-logo" />
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ color: '#888', fontSize: 13 }}>
            Welcome, {user?.name || user?.email}
          </span>
          <button
            onClick={logout}
            style={{
              marginLeft: 12,
              background: 'none',
              border: 'none',
              color: '#ff4466',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Logout
          </button>
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
      </div>
    </div>
  );
};

export default RoomLobby;
