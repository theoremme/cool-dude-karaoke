import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export function SocketProvider({ children, backendUrl, token }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [roomData, setRoomData] = useState(null); // { room, playlist, members }
  const listenersRef = useRef(new Map());

  // Connect socket on mount (when we have a URL and token)
  useEffect(() => {
    if (!backendUrl || !token) return;

    const socket = io(backendUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      setConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [backendUrl, token]);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const on = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  const off = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  }, []);

  // Join a room and set up all event listeners
  const joinRoom = useCallback(async (room, userId, memberId) => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      console.warn('[Socket] Not connected, cannot join room');
      return;
    }

    // Check for saved session to rejoin
    const savedSession = await window.api.sessionGet();
    if (memberId || (savedSession && savedSession.roomId === room.id)) {
      const mid = memberId || savedSession.memberId;
      socket.emit('rejoin-room', {
        roomId: room.id,
        memberId: mid,
        userId,
      });
    } else {
      socket.emit('join-room', {
        roomId: room.id,
        userId,
      });
    }

    // Emit amped-connect — this Electron host is taking over playback
    socket.emit('amped-connect', { roomId: room.id });
  }, []);

  const leaveRoom = useCallback((roomId) => {
    emit('leave-room', { roomId });
    // Also tell server we're leaving amped mode
    emit('amped-disconnect', { roomId });
    setRoomData(null);
  }, [emit]);

  const value = {
    socket: socketRef.current,
    connected,
    roomData,
    setRoomData,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
