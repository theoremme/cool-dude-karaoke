import React, { useEffect, useRef, useCallback, useState } from 'react';
import { usePlaylist } from '../contexts/PlaylistContext';

const YOUTUBE_CLEANUP_CSS = `
  /* Hide everything by default, then show only the player */
  body > * { visibility: hidden !important; }

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
  ytd-popup-container, .ytd-popup-container
  { display: none !important; }

  body { overflow: hidden !important; background: #000 !important; margin: 0 !important; }
  html { overflow: hidden !important; background: #000 !important; }
  ytd-app { background: #000 !important; }

  /* Show only the video player, fullscreen */
  #movie_player, #movie_player *, #content, ytd-app, ytd-page-manager,
  ytd-watch-flexy, #player, #player-container-outer, #player-container-inner,
  #player-container {
    visibility: visible !important;
  }

  #movie_player, #movie_player .html5-video-container, #movie_player video {
    position: fixed !important; top: 0 !important; left: 0 !important;
    width: 100vw !important; height: 100vh !important; z-index: 9999 !important;
  }
  #movie_player video { object-fit: contain !important; }
  .ytp-chrome-bottom { z-index: 10000 !important; }
`;

const VideoPlayer = () => {
  const { currentItem, isPlaying, playNext, setPlaying, items } = usePlaylist();
  const webviewRef = useRef(null);
  const currentVideoIdRef = useRef(null);
  const pollRef = useRef(null);
  const lastStateRef = useRef(null);

  const playNextRef = useRef(playNext);
  playNextRef.current = playNext;
  const setPlayingRef = useRef(setPlaying);
  setPlayingRef.current = setPlaying;

  // Track whether webview is ready
  const webviewReady = useRef(false);
  const pendingUrl = useRef(null);
  const [webviewVisible, setWebviewVisible] = useState(false);

  // Set up dom-ready handler and polling
  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const handleDomReady = () => {
      webviewReady.current = true;
      webview.insertCSS(YOUTUBE_CLEANUP_CSS).then(() => {
        // Small delay to let CSS take effect before revealing
        setTimeout(() => setWebviewVisible(true), 150);
      });
      startPolling();

      if (pendingUrl.current) {
        webview.loadURL(pendingUrl.current);
        pendingUrl.current = null;
      }
    };

    webview.addEventListener('dom-ready', handleDomReady);
    return () => {
      webview.removeEventListener('dom-ready', handleDomReady);
      stopPolling();
    };
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      const webview = webviewRef.current;
      if (!webview) return;

      try {
        const state = await webview.executeJavaScript(`
          (() => {
            const v = document.querySelector('video');
            if (!v) return null;
            return { ended: v.ended, paused: v.paused, currentTime: v.currentTime, duration: v.duration };
          })()
        `);

        if (!state) return;

        const prev = lastStateRef.current;

        // Detect video ended
        if (state.ended && (!prev || !prev.ended)) {
          playNextRef.current();
        }

        // Detect pause/play changes (only from user interaction in the webview)
        if (prev && !state.ended) {
          if (state.paused && !prev.paused) {
            setPlayingRef.current(false);
          } else if (!state.paused && prev.paused) {
            setPlayingRef.current(true);
          }
        }

        lastStateRef.current = state;
      } catch (e) {
        // Webview navigating or not ready
      }
    }, 500);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Navigate to new video when currentItem changes
  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    if (currentItem && currentItem.videoId !== currentVideoIdRef.current) {
      currentVideoIdRef.current = currentItem.videoId;
      lastStateRef.current = null;
      setWebviewVisible(false);
      const url = `https://www.youtube.com/watch?v=${currentItem.videoId}&autoplay=1`;

      if (webviewReady.current) {
        webview.loadURL(url);
      } else {
        pendingUrl.current = url;
      }
    } else if (!currentItem && webviewReady.current) {
      currentVideoIdRef.current = null;
      lastStateRef.current = null;
      webview.loadURL('about:blank');
    }
  }, [currentItem]);

  // Handle play/pause from external controls
  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview || !currentItem || !webviewReady.current) return;

    try {
      if (isPlaying) {
        webview.executeJavaScript('document.querySelector("video")?.play()');
      } else {
        webview.executeJavaScript('document.querySelector("video")?.pause()');
      }
    } catch (e) {
      // Webview not ready
    }
  }, [isPlaying, currentItem]);

  // Notify main process of playback state for adaptive sync polling
  useEffect(() => {
    if (window.api && window.api.syncSetPlayback) {
      window.api.syncSetPlayback(isPlaying);
    }
  }, [isPlaying]);

  const hasVideo = !!currentItem;

  return (
    <div className="video-player">
      <div
        className="player-wrapper"
        style={{ display: hasVideo ? 'block' : 'none' }}
      >
        <div className="player-container">
          <webview
            ref={webviewRef}
            src="about:blank"
            style={{
              width: '100%',
              height: '100%',
              visibility: webviewVisible ? 'visible' : 'hidden',
            }}
          />
        </div>
        {currentItem && (
          <div className="player-info">
            <span className="now-playing-label">NOW PLAYING</span>
            <h3 className="now-playing-title">{currentItem.title}</h3>
            <p className="now-playing-channel">{currentItem.channelName}</p>
          </div>
        )}
      </div>

      {!hasVideo && (
        <div className="player-placeholder">
          <div className="placeholder-content">
            <div className="placeholder-icon">&#9654;</div>
            <p>
              {items.length > 0
                ? 'Press play or select a song to start'
                : 'Search and add songs to get started'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
