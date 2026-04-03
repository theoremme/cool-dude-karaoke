/**
 * Preload script for the YouTube webview.
 * Runs inside the YouTube page — monitors the <video> element
 * and sends playback events back to the host via IPC.
 */
const { ipcRenderer } = require('electron');

let videoSetUp = false;

function monitorVideo() {
  const video = document.querySelector('video');
  if (!video) {
    setTimeout(monitorVideo, 500);
    return;
  }

  if (videoSetUp) return;
  videoSetUp = true;

  video.addEventListener('ended', () => ipcRenderer.sendToHost('video-ended'));
  video.addEventListener('pause', () => ipcRenderer.sendToHost('video-paused'));
  video.addEventListener('playing', () => ipcRenderer.sendToHost('video-playing'));
  video.addEventListener('error', () => ipcRenderer.sendToHost('video-error'));

  // Re-monitor if YouTube navigates via SPA (new video loads without full page reload)
  const observer = new MutationObserver(() => {
    const newVideo = document.querySelector('video');
    if (newVideo && newVideo !== video) {
      videoSetUp = false;
      monitorVideo();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// Hide YouTube UI, keep only the video player
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Hide non-video UI */
    ytd-masthead, #masthead-container, #related, #comments,
    #meta, #below, #secondary, #chat, #panels,
    ytd-watch-metadata, #info-contents, #description,
    tp-yt-app-drawer, #guide, #guide-button, #back-button,
    .ytp-chrome-top-buttons .ytp-watch-later-button,
    ytd-compact-video-renderer, ytd-watch-next-secondary-results-renderer,
    #actions, #menu, #subscribe-button, #sponsor-button,
    ytd-merch-shelf-renderer, ytd-engagement-panel-section-list-renderer,
    #contents.ytd-rich-grid-renderer, ytd-mini-guide-renderer,
    .ytd-page-manager[page-subtype="home"],
    #bottom-row, #top-row.ytd-watch-metadata,
    .ytp-paid-content-overlay, .ytp-ce-element,
    ytd-popup-container
    { display: none !important; }

    body { overflow: hidden !important; background: #000 !important; margin: 0 !important; }
    html { overflow: hidden !important; background: #000 !important; }
    ytd-app { background: #000 !important; }

    #movie_player,
    #movie_player .html5-video-container,
    #movie_player video {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 9999 !important;
    }

    #movie_player video {
      object-fit: contain !important;
    }

    /* Keep the player controls visible */
    .ytp-chrome-bottom {
      z-index: 10000 !important;
    }
  `;
  if (document.head) {
    document.head.appendChild(style);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.head.appendChild(style);
    });
  }
}

injectStyles();
monitorVideo();
