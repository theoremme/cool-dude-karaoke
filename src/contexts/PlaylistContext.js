import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';

const PlaylistContext = createContext();

const initialState = {
  items: [],
  currentIndex: -1,
  isPlaying: false,
};

// Convert server PlaylistItem to local format
function normalizeServerItem(item) {
  return {
    id: item.id,
    videoId: item.videoId || item.video_id,
    title: item.title,
    thumbnail: item.thumbnailUrl || item.thumbnail_url || item.thumbnail,
    duration: item.duration,
    embeddable: item.embeddable !== false,
    channelName: item.channelName || item.channel_name,
    addedByName: item.addedByName || item.added_by_name,
    addedAt: item.addedAt || item.added_at || Date.now(),
    position: item.position,
  };
}

let nextId = 1;

function playlistReducer(state, action) {
  switch (action.type) {
    // Server sends full playlist — replace local state
    case 'SET_PLAYLIST': {
      return { ...state, items: action.payload };
    }

    case 'ADD_ITEM': {
      const item = {
        ...action.payload,
        id: action.payload.id || `pl-${nextId++}`,
        addedAt: Date.now(),
      };
      return { ...state, items: [...state.items, item] };
    }

    case 'ADD_ITEMS': {
      const newItems = action.payload.map((video) => ({
        ...video,
        id: video.id || `pl-${nextId++}`,
        addedAt: Date.now(),
      }));
      return { ...state, items: [...state.items, ...newItems] };
    }

    case 'REMOVE_ITEM': {
      const idx = action.payload;
      const newItems = state.items.filter((_, i) => i !== idx);
      let newIndex = state.currentIndex;
      if (idx < state.currentIndex) {
        newIndex--;
      } else if (idx === state.currentIndex) {
        if (newIndex >= newItems.length) {
          newIndex = newItems.length - 1;
        }
        if (newItems.length === 0) {
          return { items: newItems, currentIndex: -1, isPlaying: false };
        }
      }
      return { ...state, items: newItems, currentIndex: newIndex };
    }

    case 'PLAY_INDEX':
      return {
        ...state,
        currentIndex: action.payload,
        isPlaying: true,
      };

    case 'PLAY_NEXT': {
      const next = state.currentIndex + 1;
      if (next < state.items.length) {
        return { ...state, currentIndex: next, isPlaying: true };
      }
      return { ...state, isPlaying: false };
    }

    case 'TOGGLE_PLAY':
      if (state.items.length === 0) return state;
      if (state.currentIndex === -1) {
        return { ...state, currentIndex: 0, isPlaying: true };
      }
      return { ...state, isPlaying: !state.isPlaying };

    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };

    case 'SET_PLAYBACK':
      return {
        ...state,
        currentIndex: action.payload.currentIndex ?? state.currentIndex,
        isPlaying: action.payload.isPlaying ?? state.isPlaying,
      };

    case 'MOVE_ITEM': {
      const { from, to } = action.payload;
      if (from === to) return state;
      const moved = [...state.items];
      const [item] = moved.splice(from, 1);
      moved.splice(to, 0, item);

      let newIndex = state.currentIndex;
      if (state.currentIndex === from) {
        newIndex = to;
      } else if (from < state.currentIndex && to >= state.currentIndex) {
        newIndex--;
      } else if (from > state.currentIndex && to <= state.currentIndex) {
        newIndex++;
      }
      return { ...state, items: moved, currentIndex: newIndex };
    }

    case 'CLEAR_PLAYLIST':
      return { ...initialState };

    default:
      return state;
  }
}

export function PlaylistProvider({ children, socket, roomId }) {
  const [state, dispatch] = useReducer(playlistReducer, initialState);
  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  // Track previous playback state to emit sync only on changes
  const prevPlaybackRef = useRef({ currentIndex: -1, isPlaying: false });

  // Listen for server playlist updates
  useEffect(() => {
    if (!socket) return;

    const handlePlaylistUpdated = (playlist) => {
      const items = playlist.map(normalizeServerItem);
      dispatch({ type: 'SET_PLAYLIST', payload: items });
    };

    const handleRoomUpdated = ({ playlist, playback }) => {
      if (playlist) {
        const items = playlist.map(normalizeServerItem);
        dispatch({ type: 'SET_PLAYLIST', payload: items });
      }
      // Restore playback state (e.g. after reconnection)
      if (playback && typeof playback.currentIndex === 'number') {
        dispatch({ type: 'SET_PLAYBACK', payload: {
          currentIndex: playback.currentIndex,
          isPlaying: playback.isPlaying ?? false,
        }});
      }
    };

    const handlePlaybackSync = ({ currentIndex, isPlaying }) => {
      dispatch({ type: 'SET_PLAYBACK', payload: { currentIndex, isPlaying } });
    };

    // When a new user joins, re-broadcast current playback state so they sync
    const handleUserJoined = () => {
      if (roomIdRef.current) {
        socket.emit('playback-sync', {
          roomId: roomIdRef.current,
          currentIndex: state.currentIndex,
          isPlaying: state.isPlaying,
          mode: 'amped',
        });
      }
    };

    // Handle playback commands from web remotes (play/pause/skip/play-index)
    const handlePlaybackCommand = ({ command, index }) => {
      switch (command) {
        case 'play':
          dispatch({ type: 'SET_PLAYING', payload: true });
          break;
        case 'pause':
          dispatch({ type: 'SET_PLAYING', payload: false });
          break;
        case 'skip':
          dispatch({ type: 'PLAY_NEXT' });
          break;
        case 'toggle':
          dispatch({ type: 'TOGGLE_PLAY' });
          break;
        case 'play-index':
          if (typeof index === 'number') {
            dispatch({ type: 'PLAY_INDEX', payload: index });
          }
          break;
      }
    };

    socket.on('playlist-updated', handlePlaylistUpdated);
    socket.on('room-updated', handleRoomUpdated);
    socket.on('playback-sync', handlePlaybackSync);
    socket.on('playback-command', handlePlaybackCommand);
    socket.on('user-joined', handleUserJoined);

    return () => {
      socket.off('playlist-updated', handlePlaylistUpdated);
      socket.off('room-updated', handleRoomUpdated);
      socket.off('playback-sync', handlePlaybackSync);
      socket.off('playback-command', handlePlaybackCommand);
      socket.off('user-joined', handleUserJoined);
    };
  }, [socket]);

  // Emit playback-sync when currentIndex or isPlaying changes
  useEffect(() => {
    if (!socket || !roomIdRef.current) return;
    const prev = prevPlaybackRef.current;
    if (prev.currentIndex !== state.currentIndex || prev.isPlaying !== state.isPlaying) {
      prevPlaybackRef.current = { currentIndex: state.currentIndex, isPlaying: state.isPlaying };
      socket.emit('playback-sync', {
        roomId: roomIdRef.current,
        currentIndex: state.currentIndex,
        isPlaying: state.isPlaying,
        mode: 'amped',
      });
    }
  }, [socket, state.currentIndex, state.isPlaying]);

  // --- Actions that emit socket events ---

  const addItem = useCallback((video) => {
    if (socket && roomIdRef.current) {
      socket.emit('add-song', {
        roomId: roomIdRef.current,
        videoId: video.videoId,
        title: video.title,
        thumbnail: video.thumbnail,
        duration: video.duration,
        embeddable: video.embeddable,
        channelName: video.channelName,
        addedByName: video.addedByName || 'Host',
      });
    } else {
      dispatch({ type: 'ADD_ITEM', payload: video });
    }
  }, [socket]);

  const addItems = useCallback((videos) => {
    if (socket && roomIdRef.current) {
      videos.forEach((video) => {
        socket.emit('add-song', {
          roomId: roomIdRef.current,
          videoId: video.videoId,
          title: video.title,
          thumbnail: video.thumbnail,
          duration: video.duration,
          embeddable: video.embeddable,
          channelName: video.channelName,
          addedByName: video.addedByName || 'Host',
        });
      });
    } else {
      dispatch({ type: 'ADD_ITEMS', payload: videos });
    }
  }, [socket]);

  const removeItem = useCallback((index) => {
    if (socket && roomIdRef.current) {
      const item = state.items[index];
      if (item) {
        socket.emit('remove-song', { roomId: roomIdRef.current, itemId: item.id });
      }
    } else {
      dispatch({ type: 'REMOVE_ITEM', payload: index });
    }
  }, [socket, state.items]);

  const moveItem = useCallback((from, to) => {
    if (socket && roomIdRef.current) {
      const item = state.items[from];
      if (item) {
        socket.emit('reorder-song', { roomId: roomIdRef.current, itemId: item.id, newPosition: to });
      }
    } else {
      dispatch({ type: 'MOVE_ITEM', payload: { from, to } });
    }
  }, [socket, state.items]);

  const clearPlaylist = useCallback(() => {
    if (socket && roomIdRef.current) {
      socket.emit('clear-playlist', { roomId: roomIdRef.current });
    } else {
      dispatch({ type: 'CLEAR_PLAYLIST' });
    }
  }, [socket]);

  // Local-only actions (playback is host-controlled)
  const playIndex = useCallback((index) => {
    dispatch({ type: 'PLAY_INDEX', payload: index });
  }, []);

  const playNext = useCallback(() => {
    dispatch({ type: 'PLAY_NEXT' });
  }, []);

  const togglePlay = useCallback(() => {
    dispatch({ type: 'TOGGLE_PLAY' });
  }, []);

  const setPlaying = useCallback((val) => {
    dispatch({ type: 'SET_PLAYING', payload: val });
  }, []);

  const currentItem =
    state.currentIndex >= 0 && state.currentIndex < state.items.length
      ? state.items[state.currentIndex]
      : null;

  const value = {
    ...state,
    currentItem,
    addItem,
    addItems,
    removeItem,
    playIndex,
    playNext,
    togglePlay,
    setPlaying,
    moveItem,
    clearPlaylist,
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
}
