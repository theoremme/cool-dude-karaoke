# Session Changelog — 2026-04-03

## Summary
Built the entire Cool Dude Karaoke app from scratch: Phase 1 (search), Phase 2 (playlist, playback, sync), pop-out player, production builds, API key settings, and AI-powered vibe playlist generation.

## Commits Pushed

1. **`0654ac7`** — Phase 1 & 2: YouTube search, playlist management, and video playback
2. **`95f68e0`** — Pop-out video player and YouTube overlay removal
3. **`4541373`** — Production build config, auto-hide menu bar, fix .env path
4. **`9386693`** — GitHub Actions workflow for Windows and Mac builds
5. **`5796fac`** — Inject YouTube API key from GitHub secret during CI build
6. **`85d2049`** — Fix CI: disable auto-publish to prevent GH_TOKEN error
7. **`a573035`** — Polish player UX: smooth transitions, overlay popout, time preservation
8. **`85483dc`** — User-provided YouTube API key support (v1.1)

## Uncommitted Changes (need commit + push)
- Vibe playlist generation (Claude AI integration)
- Custom vibe prompt in Settings
- Anthropic API key management in Settings
- Neon yellow "Added" state styling
- Brighter Tron grid background
- Web app conversion plan document

## New Files Created

### Source
- `src/services/VibeService.js` — Claude API integration for themed song suggestions
- `src/components/VibeSuggestions.js` — Vibe results list with Show Versions, Add, Add All, Show More
- `src/config/youtube.config.js` — YouTube API configuration constants
- `src/services/ApiKeyManager.js` — API key abstraction layer (YouTube + Anthropic)
- `src/services/YouTubeService.js` — All YouTube Data API v3 calls
- `src/services/PlaylistSyncService.js` — YouTube playlist polling with adaptive rates
- `src/contexts/PlaylistContext.js` — React context for playlist state management
- `src/components/PlaylistQueue.js` — Playlist queue with drag-and-drop reorder
- `src/components/PlaylistSync.js` — YouTube playlist sync UI
- `src/components/VideoPlayer.js` — Webview-based YouTube player with popout support
- `src/components/Settings.js` — Settings panel (YouTube key, Anthropic key, vibe prompt)
- `src/components/SearchBar.js` — Search + Vibe buttons
- `src/components/SearchResults.js` — Search result cards with Add to Playlist

### Config & Build
- `main.js` — Electron main process, IPC handlers, local HTTP server, popout window
- `preload.js` — IPC bridge (YouTube, sync, popout, API keys, vibe)
- `webview-preload.js` — YouTube page cleanup preload (unused, replaced by insertCSS approach)
- `webpack.config.js` — Webpack config with image support
- `.github/workflows/build.yml` — CI for Windows + Mac builds
- `CLAUDE.md` — Project instructions for Claude sessions

### Documentation
- `docs/DEBUG.md` — Debug folder convention
- `docs/WEBAPP-CONVERSION-PLAN.md` — Detailed plan for web app conversion

### Assets
- `src/assets/cool-dude-karaoke-logo-v1.png` — Original logo
- `src/assets/cool-dude-karaoke-logo-v2.png` — Logo v2 with black edges

## Files Modified (this session)
- `main.js` — Added vibe IPC, Anthropic key IPC, custom vibe prompt IPC
- `preload.js` — Added vibe, Anthropic key, and vibe prompt channels
- `package.json` — Added `@anthropic-ai/sdk` dependency
- `src/App.js` — Added vibe flow, VibeSuggestions component, Show More handler
- `src/components/SearchBar.js` — Added Vibe button
- `src/components/SearchResults.js` — Added vibe suggestion tag
- `src/components/Settings.js` — Added Anthropic key section, custom vibe prompt textarea
- `src/services/ApiKeyManager.js` — Added Anthropic key and vibe prompt storage
- `src/styles/App.css` — Vibe styles, neon yellow added state, brighter Tron grid, hover highlights

## Dependencies Added
- `axios` — HTTP client for YouTube API
- `dotenv` — Environment variable loading
- `react`, `react-dom` — UI framework
- `electron` — Desktop framework
- `electron-builder` — Production packaging
- `@anthropic-ai/sdk` — Claude API for vibe generation
- `webpack`, `webpack-cli`, `html-webpack-plugin` — Build tooling
- `babel-loader`, `@babel/core`, `@babel/preset-env`, `@babel/preset-react` — JSX compilation
- `css-loader`, `style-loader` — CSS bundling

## Dependencies Removed
- `electron-store` — Replaced with plain `fs` (ESM-only incompatible with CommonJS)

## Bug Fixes
1. **Blank white screen on launch** — CSP missing `'unsafe-eval'` for webpack dev mode
2. **YouTube Error 150** — `file://` origin rejected by YouTube; added local HTTP server
3. **Video unavailable** — Switched from YouTube IFrame API to webview loading full YouTube pages
4. **Preload crash (module not found: path)** — Sandboxed preload can't use `require('path')`; set `sandbox: false`
5. **Webview loadURL before dom-ready** — Added ready state tracking with pending URL queue
6. **Player size hiccup on song change** — Hide webview until video is actually playing (`readyState >= 3`)
7. **Black screen after opacity transition** — `did-start-navigation` fires for sub-frames; removed opacity approach
8. **Production .env not found** — `dotenv` used cwd instead of `__dirname`; fixed path
9. **YouTube Mix playlists 404** — Added validation for `RD` prefix playlists
10. **Polling 404 errors showing in UI** — Limited error reporting to quota errors only
11. **`electron-store` ESM error** — Replaced with `fs.readFileSync`/`writeFileSync` to `app.getPath('userData')`
12. **Muted neon colors in right panel** — `panel-right` had `rgba(0,0,0,0.6)` background causing Tron grid bleed-through; bumped to 0.9

## Unresolved Issues / TODOs
- **Task #17**: Auto-detect and skip Content ID restricted videos
- Player CSS injection race (brief flash on some machines, especially Mac)
- Popout window slow to appear on cold cache (~5-10s on Mac)
- Code signing needed for proper Windows/Mac distribution
- `webview-preload.js` file exists but is unused (replaced by insertCSS approach)

## Configuration Changes
- `.env` — Added `ANTHROPIC_API_KEY` field
- `.gitignore` — Added `release/`, `debug/`
- GitHub secret `YOUTUBE_API_KEY` — Required for CI builds
- `api-settings.json` in user data dir — Stores user YouTube key, Anthropic key, custom vibe prompt
