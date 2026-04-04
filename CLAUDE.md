# Cool Dude Karaoke - Project Instructions

## Documentation

Read all files in `docs/` for project conventions before starting work.

- [Debug Folder Convention](docs/DEBUG.md) - All debug/diagnostic output goes to `debug/`
- [Web App Conversion Plan](docs/WEBAPP-CONVERSION-PLAN.md) - Plan for converting to a web app
- [Next Session Notes](docs/next-session-notes.md) - Pending tasks and priorities
- [Session Changelogs](docs/code-changelog/) - History of all changes

## App Lifecycle

- **You handle restarts.** After rebuilding, kill any running Electron process and relaunch with `npm start`. Do not ask the user to restart manually.
- **Build command**: `taskkill //F //IM electron.exe 2>/dev/null; npx webpack --mode development 2>&1 && npx electron . 2>&1`
- **Production build**: `npm run dist`

## Architecture

- **Main process** (`main.js`): Electron window management, IPC handlers, local HTTP server, popout player, YouTube API calls via services
- **Services** (`src/services/`): YouTubeService, PlaylistSyncService, ApiKeyManager, VibeService — all run in main process (Node.js/CommonJS)
- **Config** (`src/config/`): YouTube API config with key from .env
- **React frontend** (`src/`): Components communicate with main process via `window.api.*` (preload bridge)
- **Video player**: Uses Electron `<webview>` tag loading full YouTube pages with injected CSS cleanup (not YouTube IFrame API)
- **Popout player**: Separate `BrowserWindow` loading YouTube directly with CSS injection
- **API keys**: Stored in `api-settings.json` in Electron's userData directory via `ApiKeyManager`

## Key Patterns

- All YouTube API calls go through `ApiKeyManager.getKey()` — never hardcode keys
- The webview needs `dom-ready` before calling `loadURL` or `executeJavaScript`
- Hide webview during navigation, reveal only when video is playing (`readyState >= 3`)
- Vibe generation: Claude returns song list → lazy YouTube search per song (saves quota)
