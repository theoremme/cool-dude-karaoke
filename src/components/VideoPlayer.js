import React, { useEffect, useRef, useCallback, useState } from 'react';
import { usePlaylist } from '../contexts/PlaylistContext';

const YOUTUBE_CLEANUP_CSS = `
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
  ytd-popup-container, .ytd-popup-container,
  tp-yt-paper-dialog, ytd-consent-bump-v2-lightbox,
  .ytd-enforcement-message-view-model, .ytp-consent-overlay,
  ytd-modal-with-title-and-button-renderer,
  .ytd-popup-container, .yt-playability-error-supported-renderers,
  ytd-background-promo-renderer, #consent-bump,
  .ytp-error, .ytp-error-content-wrap
  { display: none !important; }

  /* Remove blur from age-gated videos */
  .ytp-premium-ypc-module-overlay,
  [class*="blur"], [style*="blur"] { filter: none !important; }
  .html5-video-container { filter: none !important; }

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

const VideoPlayer = () => {
  const { currentItem, isPlaying, playNext, setPlaying, items } = usePlaylist();
  const webviewRef = useRef(null);
  const currentVideoIdRef = useRef(null);
  const pollRef = useRef(null);
  const lastStateRef = useRef(null);
  const [isPopout, setIsPopout] = useState(false);

  const playNextRef = useRef(playNext);
  playNextRef.current = playNext;
  const setPlayingRef = useRef(setPlaying);
  setPlayingRef.current = setPlaying;

  // Track whether webview is ready
  const webviewReady = useRef(false);
  const pendingUrl = useRef(null);
  const [webviewVisible, setWebviewVisible] = useState(false);

  // --- Webview setup (for docked mode) ---
  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const handleDomReady = () => {
      webviewReady.current = true;
      webview.insertCSS(YOUTUBE_CLEANUP_CSS).then(() => {
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

        if (state.ended && (!prev || !prev.ended)) {
          playNextRef.current();
        }

        if (prev && !state.ended) {
          if (state.paused && !prev.paused) setPlayingRef.current(false);
          else if (!state.paused && prev.paused) setPlayingRef.current(true);
        }

        lastStateRef.current = state;
      } catch (e) {}
    }, 500);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // --- Popout event listeners ---
  useEffect(() => {
    window.api.onPopoutClosed(() => {
      setIsPopout(false);
      // Resume in webview — reload current video
      if (currentVideoIdRef.current && webviewRef.current && webviewReady.current) {
        const url = `https://www.youtube.com/watch?v=${currentVideoIdRef.current}&autoplay=1`;
        setWebviewVisible(false);
        webviewRef.current.loadURL(url);
      }
    });

    window.api.onPopoutVideoEnded(() => {
      playNextRef.current();
    });

    return () => {
      window.api.removePopoutListeners();
    };
  }, []);

  // --- Navigate to new video ---
  useEffect(() => {
    if (!currentItem) {
      currentVideoIdRef.current = null;
      lastStateRef.current = null;
      if (!isPopout && webviewRef.current && webviewReady.current) {
        webviewRef.current.loadURL('about:blank');
      }
      return;
    }

    if (currentItem.videoId === currentVideoIdRef.current) return;
    currentVideoIdRef.current = currentItem.videoId;
    lastStateRef.current = null;

    if (isPopout) {
      // Load in popout window
      window.api.popoutLoadVideo(currentItem.videoId, currentItem.title);
    } else {
      // Load in webview
      setWebviewVisible(false);
      const url = `https://www.youtube.com/watch?v=${currentItem.videoId}&autoplay=1`;
      if (webviewReady.current) {
        webviewRef.current.loadURL(url);
      } else {
        pendingUrl.current = url;
      }
    }
  }, [currentItem, isPopout]);

  // --- Play/pause control ---
  useEffect(() => {
    if (!currentItem) return;

    if (isPopout) {
      if (isPlaying) window.api.popoutPlay();
      else window.api.popoutPause();
    } else {
      const webview = webviewRef.current;
      if (!webview || !webviewReady.current) return;
      try {
        if (isPlaying) webview.executeJavaScript('document.querySelector("video")?.play()');
        else webview.executeJavaScript('document.querySelector("video")?.pause()');
      } catch (e) {}
    }
  }, [isPlaying, currentItem, isPopout]);

  // Notify main process of playback state for adaptive sync polling
  useEffect(() => {
    if (window.api && window.api.syncSetPlayback) {
      window.api.syncSetPlayback(isPlaying);
    }
  }, [isPlaying]);

  // --- Pop out / Dock ---
  const handlePopout = useCallback(async () => {
    const webview = webviewRef.current;
    let currentTime = 0;

    if (webview && webviewReady.current) {
      try {
        currentTime = await webview.executeJavaScript(
          'document.querySelector("video")?.currentTime || 0'
        );
        webview.loadURL('about:blank');
      } catch (e) {}
    }

    stopPolling();
    setIsPopout(true);
    setWebviewVisible(false);

    await window.api.popoutOpen(
      currentItem.videoId,
      currentTime,
      currentItem.title
    );
  }, [currentItem, stopPolling]);

  const handleDock = useCallback(async () => {
    const result = await window.api.popoutClose();
    // popout-closed event handler will resume in webview
  }, []);

  const hasVideo = !!currentItem;

  return (
    <div className="video-player">
      {/* Docked player */}
      <div
        className="player-wrapper"
        style={{ display: hasVideo && !isPopout ? 'block' : 'none' }}
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
            <div className="player-info-row">
              <p className="now-playing-channel">{currentItem.channelName}</p>
              <button className="btn-popout" onClick={handlePopout} title="Pop out video">
                ⧉ Pop Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Popped-out placeholder */}
      {hasVideo && isPopout && (
        <div className="player-popout-placeholder">
          <div className="popout-placeholder-content">
            <div className="popout-icon">⧉</div>
            <p className="popout-label">Video is playing in a separate window</p>
            <p className="popout-title">{currentItem.title}</p>
            <button className="btn-neon" onClick={handleDock}>
              ⧉ Dock Video
            </button>
          </div>
        </div>
      )}

      {/* No video placeholder */}
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
