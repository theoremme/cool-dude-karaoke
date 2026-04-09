# Cool Dude Karaoke — Electron App (Amped)
**Claude Code Project Instructions**  
**Last updated:** 2026-04-08

---

## What This Project Is

Cool Dude Karaoke is a collaborative karaoke platform. A host creates a room, friends join from their phones via QR code, everyone adds songs to a shared queue, and the host's screen plays the videos.

This repo is the **Electron desktop app** — codenamed **Amped**. It is the premium host experience.

The web app (codenamed **Unplugged**) lives at `c:\ai\cool-dude-karaoke-web` and is deployed on Railway. It handles the guest experience on phones and the fallback host experience in a browser. **The two apps share the same Railway backend.**

---

## The Two Modes

| Mode | What It Means |
|------|--------------|
| **Amped** | Host is running this Electron app. yt-dlp plays all YouTube videos natively. Web clients become remotes. |
| **Unplugged** | Host is using the web app in a browser. Embeddable YouTube only. Full player in the browser. |

**Electron always owns playback when connected.** If the Electron app is running and joined to a room, it controls the player. Web clients (including the host's own browser) become remote controls — their play/pause/skip sends socket commands to Electron rather than launching a browser video.

Guests on phones **always use the web app**. They are never affected by which mode the host is using.

---

## Current State of This Repo

This app was originally a **standalone personal jukebox** — no rooms, no guests, no backend connection. It is now being **converged** with the Railway backend to become the Amped host client.

### What already works
- YouTube search (direct from main process, separate API quota from web app)
- AI Vibe playlist generation (Claude `claude-sonnet-4-20250514`)
- Playlist management (add/remove/reorder/clear) — local only, in-memory
- Video playback via Electron `<webview>` loading full YouTube pages
- Popout player window (second `BrowserWindow`)
- YouTube playlist sync with adaptive polling (working, unlike the web app version)
- Settings panel (YouTube API key, Anthropic API key, custom vibe prompt)

### What is being built (see convergence spec)
- Auth (login/register connecting to Railway)
- Room lobby (create room, list active rooms, rejoin)
- Socket.io connection to Railway backend
- Playlist sync to server (replacing local-only state)
- Playback state broadcasting to guests
- yt-dlp native video player (replacing webview)
- QR code display, posse list, closeout page, PDF export

**Full spec:** `docs/CDK-CONVERGENCE-SPEC.md`

---

## Architecture

### Two-Process Model
Electron has two layers that communicate via IPC:

- **Main process** (`main.js`): Node.js. Handles YouTube API calls, yt-dlp, file system, window management, IPC handlers. Exposes methods to renderer via `preload.js` → `window.api.*`
- **Renderer process** (React app in `src/`): The UI. Calls `window.api.*` for anything requiring Node.js. 

### Socket.io Lives in the Renderer
Socket.io (`socket.io-client`) connects to Railway **directly from the renderer**, not through the main process. This is intentional. The renderer owns playback state decisions — when a socket event arrives, the renderer decides what to do and calls `window.api.*` only if a main-process action is needed.

### No React Router
This is a desktop app with no URL bar. Navigation is **state-based** — `App.js` renders different views based on a `currentView` state variable. Views: `login`, `lobby`, `dashboard`, `closeout`.

### Key Files
```
main.js                          # Main process — IPC handlers, window management, services
preload.js                       # Context bridge — exposes window.api.* to renderer
webview-preload.js               # Runs inside YouTube webview (partially dead code — see known issues)
src/
  App.js                         # Root layout + state-based routing
  contexts/PlaylistContext.js    # Central playlist state (useReducer) — being extended with socket sync
  hooks/useAuth.js               # (TO BE CREATED) Auth context + hook
  hooks/useSocket.js             # (TO BE CREATED) Socket.io connection hook
  components/
    AuthPage.js                  # (TO BE CREATED) Login/register form
    RoomLobby.js                 # (TO BE CREATED) Create/rejoin rooms
    VideoPlayer.js               # Webview-based player — will be replaced by NativeVideoPlayer
    PlaylistQueue.js             # Playlist display with drag-reorder
    VibeSuggestions.js           # AI suggestion list
    SearchBar.js                 # Search + Vibe input
    SearchResults.js             # Search result grid
    Settings.js                  # API key management modal
    PlaylistSync.js              # YouTube playlist import
  services/
    authService.js               # (TO BE CREATED) REST calls to Railway auth endpoints
    YtDlpService.js              # (TO BE CREATED) yt-dlp URL extraction
    durationParser.js            # (TO BE CREATED) ISO 8601 → seconds + display string
    ApiKeyManager.js             # Persists API keys to userData JSON
    PlaylistSyncService.js       # YouTube playlist polling
    VibeService.js               # Claude API integration
    YouTubeService.js            # YouTube Data API v3 client
```

---

## Railway Backend

**Web app repo:** `c:\ai\cool-dude-karaoke-web`  
**Railway URL:** `cool-dude-karaoke-web-production.up.railway.app`  
**Backend is Express + Socket.io + PostgreSQL via Prisma**

### How Electron connects
- REST calls via axios (auth, rooms) — same endpoints the web app uses
- Socket.io via `socket.io-client` in the renderer — same Railway socket server
- JWT token stored in `electron-store`, sent as `Authorization: Bearer` on REST calls and in `socket.handshake.auth.token`

### Key REST endpoints (already exist on Railway)
```
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
POST /api/rooms
GET  /api/rooms/mine
GET  /api/rooms/:inviteCode
```

### Key socket events (already exist)
```
Client → Server: join-room, rejoin-room, add-song, remove-song, reorder-song,
                 clear-playlist, close-room, playback-sync, activity-ping

Server → Client: room-updated, playlist-updated, user-joined, user-left,
                 playback-sync, inactivity-warning, inactivity-cleared, room-closed
```

### New socket events (to be added to Railway server during Phase 1)
```
Client → Server: amped-connect, amped-disconnect, playback-command, amped-handoff
Server → Client: mode-changed, amped-disconnected, amped-reconnected
```

---

## YouTube API

**Electron uses its own YouTube API key** — separate from the web app's key. This is intentional. They have independent 10,000 unit/day quotas. Do not route Electron YouTube searches through Railway.

The key is stored in `api-settings.json` in `app.getPath('userData')` via `ApiKeyManager.js`, with a fallback to `.env`.

---

## Known Issues / Technical Debt

- `webview-preload.js` sends IPC events (`video-ended`, `video-paused` etc.) that `VideoPlayer.js` never listens to — it polls independently instead. The preload events are dead code.
- YouTube cleanup CSS is defined in three separate places (`main.js`, `VideoPlayer.js`, `webview-preload.js`). Should be consolidated.
- Playlist state is entirely in-memory — lost on app restart. Being fixed by electron-store persistence in Phase 1.
- YouTube quota counter resets on restart and doesn't reset at midnight.
- React 18.3.1 here vs 19.2.4 in the web app. Upgrade deferred to Phase 4.
- `.env` contains real API keys and is included in the electron-builder package — keys can be extracted from the ASAR. Fix: remove from builder files config once Railway auth is in place.
- `webview-preload.js` uses `unsafe-eval` in CSP. Tighten in Phase 4.
- Several stale dev docs in root: `PHASE-1-PROMPT.md`, `PHASE-2-PROMPT.md`, `api-key-architecture.md`, `karaoke-app-prompt.md`, `karaoke-app-development-plan.md` — ignore these, they describe the old standalone app.

---

## What NOT to Do

- **Do not** route Socket.io through the main process. It lives in the renderer.
- **Do not** route YouTube search through Railway. Electron calls YouTube directly.
- **Do not** add CDG file library support. Out of scope.
- **Do not** add KaraFun integration. Out of scope.
- **Do not** add Spotify. Out of scope.
- **Do not** use React Router. Navigation is state-based in `App.js`.
- **Do not** modify guest-facing features in the web app. Guests always use the web app unchanged.
- **Do not** remove the webview fallback when building the yt-dlp player. Some videos won't extract — webview is the fallback.

---

## Session Startup Checklist

Before starting any session:
1. Check `docs/next-session-notes.md` for carry-over context from the last session
2. Check `docs/CDK-CONVERGENCE-SPEC.md` for the full build plan and phase status
3. Confirm which phase is currently in progress
4. Note that the Railway web app repo is at `c:\ai\cool-dude-karaoke-web` — some tasks require changes there too

After each session:
1. Update `docs/next-session-notes.md` with what was completed, what's in progress, and any decisions made
2. Add a changelog entry to `docs/code-changelog/`

---

## Convergence Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Connect Electron to Railway (auth, rooms, socket, playlist sync) | ✅ Complete |
| Phase 2 | yt-dlp native video player | ⏸️ Deferred (YouTube quota review risk) |
| Phase 3 | Port missing web features (QR, posse, closeout, PDF) | 🟡 Mostly complete (OAuth publishing remaining) |
| Phase 4 | Polish and cleanup | 🔲 Not started |

Update this table as phases complete.
