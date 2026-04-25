# Session Changelog — 2026-04-24

## Summary
YouTube 403 fix for deployed builds, responsive dynamic scaling across both apps, fullscreen persistence between songs, QR/posse panel cleanup, Settings UI improvements.

## Commits (Electron repo — cool-dude-karaoke)
1. **7da4bcc** — Fix YouTube 403 on packaged builds, inject API keys via CI
2. **393b3de** — Responsive scaling, fullscreen persistence, QR/posse cleanup, Settings UI
3. **4464438** — Bump version to v2.7

## Commits (Web repo — cool-dude-karaoke-web)
1. **4811fd7** — Responsive scaling, QR/posse cleanup, fullscreen persistence

## Critical Bug Fix
- **YouTube 403 on deployed builds**: `.env` was not in the electron-builder `files` list, so `process.env.YOUTUBE_API_KEY` was `undefined` in packaged builds. Fixed by: adding `.env` to builder files list and creating `.env` from GitHub Actions secrets during CI. API key was briefly hardcoded in source (leaked to public repo) — force-pushed to scrub history, key should be rotated.

## Files Modified (Electron)
- `main.js` — Added `globalShortcut` for Escape in fullscreen, `set-fullscreen`/`is-fullscreen` IPC handlers, `keepFullscreen` flag
- `preload.js` — Added `setFullscreen`, `isFullscreen`, `onExitFullscreen`, `removeFullscreenListeners` context bridge methods
- `src/App.js` — Added `useLogoScale` hook (sets `--logo-scale` CSS variable from viewport height)
- `src/components/AuthPage.js` — Gear icon button fixed top-right (replaced footer gear), magenta color
- `src/components/PlaylistQueue.js` — Skip icon changed from `⏭` to `►❚` (matches Unplugged)
- `src/components/RoomLobby.js` — Gear icon button fixed top-right (replaced footer gear), removed Download QR reference
- `src/components/RoomPanel.js` — Removed Download QR button, added ResizeObserver for posse display modes (full/compact/count-only), multi-word names show initials with hover tooltip, QR URL changed to cooldudekaraoke.com, removed min-width on toggle button
- `src/components/VideoPlayer.js` — Fullscreen persistence via intercepted Fullscreen API (FULLSCREEN_OVERRIDE_JS), `playerFullscreen` state + CSS class, `console-message` listener for enter/exit fullscreen markers, removed placeholder panel
- `src/styles/App.css` — Extensive responsive scaling: CSS zoom on lobby cards and header logo-wrap, `--logo-scale` variable, dynamic QR/posse panel with `aspect-ratio: 1`, scaled playlist buttons, settings panel scrollable with `max-height: 90vh`, magenta settings button, player-fullscreen CSS
- `package.json` — Added `.env` to electron-builder files list, version bumped to 2.7.0
- `.github/workflows/build.yml` — Added "Create .env from secrets" step for both Windows and Mac builds

## Files Modified (Web repo)
- `client/src/App.jsx` — Added `useLogoScale` hook at app level
- `client/src/components/HostDashboard.jsx` — Removed inline logo height styles, removed duplicate `useLogoScale` hook
- `client/src/components/QRCodeDisplay.jsx` — Removed Download QR button, added ResizeObserver for posse display modes, multi-word name initials with hover, removed min-width on toggle button
- `client/src/components/VideoPlayer.jsx` — Removed `key={currentItem.videoId}` from YouTubeEmbed (preserves iframe across songs for fullscreen persistence)
- `client/src/styles/App.css` — CSS zoom on lobby cards and logo-wrap, `--logo-scale` variable, responsive QR/posse panel, dynamic logo scaling, separate `.logo-unplugged`/`.logo-amped` rules scoped to `.host-dashboard`, removed conflicting media query overrides

## New Approach: Logo Scaling System
Both apps now use a unified scaling approach:
1. JS hook (`useLogoScale`) computes `--logo-scale` from viewport height and sets it on `:root`
2. CSS `zoom: var(--logo-scale)` on containers (lobby cards, header logo-wrap) scales all content proportionally
3. Fixed design-size values inside — no calc/clamp drift
4. `.logo-unplugged` and `.logo-amped` have separate position/size values, scoped to room context
5. Lobby cards zoom the entire card; room headers zoom just the logo-wrap

## Fullscreen Persistence (Electron)
- YouTube's Fullscreen API is intercepted inside the webview via injected JS
- `requestFullscreen()` is overridden to not actually enter browser fullscreen
- Instead, a `console.log` marker triggers Electron's `setFullScreen(true)` via IPC
- `globalShortcut('Escape')` registered when fullscreen is active, unregistered on exit
- YouTube sees fake `fullscreenElement` so its UI stays correct
- Song transitions don't exit fullscreen since YouTube never entered real fullscreen

## Fullscreen Persistence (Web/Unplugged)
- Removed `key={currentItem.videoId}` from `<YouTubeEmbed>` component
- Without the key, React reuses the same component instance across songs
- `loadVideoById()` loads new videos without destroying the iframe
- Browser fullscreen state persists since the iframe element is never remounted

## Bug Fixes
- YouTube search returning 403 on all deployed builds (missing .env in packaged app)
- Fullscreen exiting on song transition in both Amped and Unplugged
- QR code pointing to Railway URL instead of cooldudekaraoke.com
- Settings panel overflowing on small screens
- Playlist queue unscrollable when covered by YouTube Playlist Sync section
- Logo/subtitle drifting when window resized
- Posse panel names truncated while join times fully visible
- QR code white border wider than tall at small viewport heights

## Releases
- v2.7 — Responsive scaling, fullscreen persistence, QR/posse cleanup, Settings UI

## Security Note
- YouTube API key was briefly exposed in git history (commit 153621c, force-pushed to remove)
- Google Cloud alert triggered — key should be rotated
- Build now uses GitHub Actions secrets (`YOUTUBE_API_KEY`, `ANTHROPIC_API_KEY`) to inject `.env` at build time
