# Session Changelog — 2026-04-09

## Summary
Phase 1 convergence: Connected the Electron desktop app (Amped) to the Railway backend. Full auth, room management, real-time playlist sync, Amped/Unplugged mode switching, closeout page with PDF, and deployment pipeline.

## Commits (Electron repo — cool-dude-karaoke)
1. **3cf9b8c** — Connect Electron to Railway backend — Phase 1 client-side (v1.3)
2. **f6d6dea** — Phase 1 polish: closeout page, bail confirmation, embeddable checks, .env cleanup (v1.4)
3. **c0f899f** — Set production Railway URL as default backend, update CI for GitHub Releases
4. **c7b2d3f** — Add /release-amped slash command for version tagging
5. **v1.5 tag** — First release build triggered on GitHub Actions

## Commits (Web repo — cool-dude-karaoke-web)
1. **c7a64bd** — Add socket auth, playback_mode, and Amped socket events (Phase 1 server)
2. **912f432** — Add amped mode support to web client + CORS + playback-command routing
3. **fbfd857** — Phase 1 polish: amped disconnect UX, embeddable dimming, lobby refresh, branding
4. **054c531** — Add Amped download banner to host dashboard and lobby
5. **8c7e804** — Polish Amped download banner — centered layout with Orbitron title

## New Files Created (Electron)
- `src/components/AuthPage.js` — Login/register form
- `src/components/RoomLobby.js` — Create/join/rejoin rooms
- `src/components/RoomPanel.js` — QR code + posse display with 3D flip
- `src/components/Closeout.js` — Session end page with PDF generation
- `src/hooks/useAuth.js` — AuthProvider + useAuth hook (JWT via electron-store)
- `src/hooks/useSocket.js` — SocketProvider + useSocket hook (socket.io-client)
- `src/services/authService.js` — REST calls to Railway (login, register, rooms)
- `src/assets/Orbitron-Bold.ttf` — Font for PDF generation
- `src/assets/cool-dude-karaoke-logo-v2-nobg.png` — Transparent background logo
- `.claude/commands/release-amped.md` — Slash command for version releases

## Files Modified (Electron)
- `main.js` — IPC handlers for auth token, backend URL, session persistence; window sizing
- `preload.js` — Context bridge for auth/session/backend APIs
- `src/App.js` — State-based routing (auth → lobby → dashboard → closeout), socket wiring, bail modal
- `src/contexts/PlaylistContext.js` — Socket-aware playlist ops, playback-command handler, playback-sync emit
- `src/index.html` — CSP updated for Railway + Google Fonts; Orbitron font loaded
- `src/styles/App.css` — Auth page, lobby, QR panel, closeout, bail modal, header, logo subtitle styles
- `src/services/ApiKeyManager.js` — Backend URL, auth token, session persistence methods
- `src/services/YouTubeService.js` — Added `status` part to API calls for embeddable flag
- `src/services/PlaylistSyncService.js` — Sort by YouTube position; filter unavailable videos
- `src/config/youtube.config.js` — Removed hardcoded .env dependency
- `package.json` — Added socket.io-client, electron-store, qrcode.react, jspdf; removed .env from builder
- `webpack.config.js` — Added TTF/font asset rule
- `.github/workflows/build.yml` — GitHub Releases on version tags, removed .env creation

## Files Modified (Web repo)
- `server/server.js` — Added CORS middleware + socket.io CORS config
- `server/src/services/socketService.js` — Socket JWT auth middleware, host-only guards, Amped events, embeddable refresh, playback state persistence, duplicate member fix
- `server/src/services/youtubeService.js` — Added `checkEmbeddable()` batch function
- `server/prisma/schema.prisma` — Added `playbackMode` column to Room
- `client/src/components/HostDashboard.jsx` — Amped mode awareness, disconnect countdown, embeddable dimming, Amped download banner
- `client/src/components/VideoPlayer.jsx` — Amped mode remote control UI, disconnect countdown, auto-skip non-embeddable
- `client/src/components/PlaylistQueue.jsx` — Non-embeddable dimming with "Amped Only" badge, auto-scroll to current song
- `client/src/components/RoomLobby.jsx` — Auto-refresh, Amped download banner, UNPLUGGED logo subtitle
- `client/src/components/AuthPage.jsx` — UNPLUGGED logo subtitle
- `client/src/contexts/PlaylistContext.jsx` — Amped mode routing (playback commands via socket), suppress playback-sync in amped mode, skip non-embeddable in unplugged
- `client/src/hooks/useSocket.jsx` — JWT token in socket auth handshake
- `client/src/styles/App.css` — Logo subtitle, Amped download banner, queue-item-disabled, amped-only badge styles

## Dependencies Added (Electron)
- `socket.io-client` — Real-time connection to Railway
- `electron-store` — Persistent key-value storage (unused directly, JWT stored via ApiKeyManager)
- `qrcode.react` — QR code generation for invite panel
- `jspdf` — PDF generation for closeout setlist

## Database Migration
- `20260409000933_add_playback_mode_to_room` — Added `playback_mode VARCHAR(20) DEFAULT 'unplugged'` to rooms table

## Housekeeping Completed
- Deleted `extractor/` directory from web repo (dead code)
- Deleted 4 stale `*-player-script.js` files from web repo server/
- Removed `.env` from electron-builder files config (security fix)

## Bug Fixes
- CSP blocking network requests from Electron to localhost (added connect-src)
- Missing React import in useSocket.js causing blank page
- Duplicate host members in posse (server now reuses member records for same userId)
- Playlist not loading on room join (PlaylistContext now listens for room-updated)
- Web client and Electron fighting over playback-sync (web defers in amped mode)
- Non-embeddable songs not detected (YouTube search now fetches status part)
- Stale playback state after web refresh (server persists in room settings JSON)

## Unresolved / Known Issues
- YouTube playlist sync occasionally returns items out of order (sort fix added, needs verification)
- YouTube OAuth publishing not wired up in Electron (placeholder "Open in Browser" button)
- Reconnection from Unplugged back to Amped can be slightly rocky (playback may need a toggle)
- Mac builds are unsigned — users will get Gatekeeper warning
