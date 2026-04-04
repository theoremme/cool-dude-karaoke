# Web App Conversion Plan

## Overview
Convert the Electron desktop app to a web application that runs in any browser.

## Architecture Change
- Electron main process → Express backend server
- IPC bridge (preload.js) → HTTP API calls (fetch)
- Webview YouTube player → YouTube IFrame API
- BrowserWindow popout → window.open() + postMessage()
- fs-based storage → server-side file storage (same) + optional localStorage

## Phases

### Phase 1: Backend API Server (Medium)
Create Express server with routes mirroring current IPC handlers:
- `GET /api/youtube/search?q=...`
- `GET /api/youtube/videos?ids=...`
- `GET /api/youtube/playlist-items?playlistId=...`
- `GET /api/youtube/playlist-info?playlistId=...`
- `GET /api/youtube/quota`
- `POST /api/sync/connect`, `/disconnect`, `/now`, `/set-playback`
- `GET /api/sync/status`, `/poll`
- `GET /api/apikey/status`
- `POST /api/apikey/set`, `/clear`, `/validate`

Move services to `server/`:
- `server/services/YouTubeService.js`
- `server/services/PlaylistSyncService.js`
- `server/services/ApiKeyManager.js` (replace `app.getPath()` with configurable path)
- `server/config/youtube.config.js`

### Phase 2: Frontend API Client Layer (Small)
Create `src/services/ApiClient.js` — same method signatures as `window.api.*` but using fetch().
Set `window.api = api` in index.js so all existing component code works unchanged.

### Phase 3: YouTube Player Rewrite (Large — highest risk)
Replace `<webview>` with YouTube IFrame API (`new YT.Player()`):
- Direct event callbacks (onStateChange, onError) instead of 500ms polling
- `player.loadVideoById()`, `playVideo()`, `pauseVideo()`, `getCurrentTime()`
- No CSS injection needed — IFrame API renders a clean player

Popout player:
- `window.open('/popout.html?v=VIDEO_ID&t=TIME')`
- Communication via `window.postMessage()` / `BroadcastChannel`
- Popout page has its own YT.Player instance

**Trade-off**: Videos with embedding disabled will fail (error 150/101). Mitigation: auto-skip + "Open in YouTube" link.

### Phase 4: Sync Event Polling (Small)
Replace IPC push events with client polling `/api/sync/poll` every 2s.
Server accumulates new items in a buffer; client drains it.
Can be built into the ApiClient shim so component code stays unchanged.

### Phase 5: Storage Migration (Trivial)
Server keeps file-based storage for API key (same as now).
Optional: add localStorage persistence for playlist state across refreshes.

### Phase 6: Build System & Deployment (Medium)
- Remove electron, electron-builder deps
- Add express, cors, concurrently, webpack-dev-server
- Dev: `concurrently "node server/index.js" "webpack serve"`
- Prod: `node server/index.js` serves static dist/ + API
- Deployment: single Node.js process, Docker, or split (Vercel + Railway)

### Phase 7: Cleanup (Small)
- Delete main.js, preload.js, webview-preload.js
- Refactor window.api shim to direct imports
- Update CSP for web
- Test across browsers
- Optional: PWA manifest for installability

## Files Summary

### Create
- `server/index.js`, `server/routes/youtube.js`, `server/routes/apikey.js`, `server/routes/sync.js`
- `server/services/YouTubeService.js`, `server/services/PlaylistSyncService.js`, `server/services/ApiKeyManager.js`
- `server/config/youtube.config.js`
- `src/services/ApiClient.js`
- `src/popout.html`, `src/popout.js`

### Heavily Modify
- `src/components/VideoPlayer.js` (full rewrite)
- `src/index.html` (add YT IFrame API, update CSP)
- `src/index.js` (set window.api shim)
- `webpack.config.js` (dev server, popout entry)
- `package.json` (deps, scripts)

### Unchanged
- All other React components, PlaylistContext, CSS, assets

### Delete
- `main.js`, `preload.js`, `webview-preload.js`
- `.github/workflows/build.yml` (replace with web deploy workflow)

## Risks
1. **Embed restrictions (HIGH)**: Some videos won't play in IFrame API. Most karaoke videos are fine.
2. **Popout communication (MEDIUM)**: postMessage across windows needs same-origin.
3. **API key security (LOW)**: Backend proxy keeps key server-side.
4. **State loss on refresh (LOW)**: Same as Electron; fixable with localStorage.
