## Next Session Notes (updated 2026-04-24)

### What was completed this session
- YouTube 403 fix for deployed builds (API keys injected via GitHub Actions secrets)
- Responsive dynamic scaling for both Amped and Unplugged (logo, subtitle, QR/posse panel, playlist buttons, settings panel)
- Fullscreen persistence between songs (Amped: intercepted Fullscreen API + Electron window fullscreen; Unplugged: preserved iframe via removed key prop)
- QR/posse panel cleanup (removed Download QR, ResizeObserver-based display modes, initials for multi-word names)
- QR URL changed from Railway to cooldudekaraoke.com
- Settings button: magenta gear icon, fixed top-right on all views
- Skip icon matched to Unplugged (►❚)
- Removed "Add songs and hit play" placeholder from Amped
- Settings panel: scrollable body, max-height 90vh
- Unified logo scaling system: CSS zoom + --logo-scale JS variable
- Released v2.7

### Known issues to investigate
1. YouTube API key was briefly exposed in git history — **rotate the key** in Google Cloud Console, update GitHub secret
2. YouTube playlist sync ordering — still unverified with a real playlist
3. Reconnection from Unplugged back to Amped can require a play/pause toggle to start video
4. YouTube OAuth publishing in Electron uses "Open in Browser" workaround
5. Persisted backend URL in electron-store can override defaults — users upgrading from old builds may have stale Railway URL saved
6. Mac builds need testing (Windows confirmed working)
7. Fullscreen persistence in Amped: brief flash possible when Electron enters fullscreen (YouTube's own fullscreen is intercepted but timing may vary)
8. Web app Unplugged changes need deployment to Railway (committed and pushed but not deployed)

### Decisions made
- CSS zoom for proportional scaling (instead of transform: scale which doesn't affect layout)
- Logo subtitle positioned with fixed design values inside zoomed containers (no calc/clamp drift)
- Separate .logo-unplugged and .logo-amped CSS rules, scoped to .host-dashboard
- YouTube Fullscreen API intercepted in Amped webview (fake fullscreenElement, console.log markers)
- Unplugged fullscreen fixed by removing React key prop from YouTubeEmbed (preserves iframe)
- GitHub Actions secrets for API keys (never in source code)
- Download QR button removed from both apps
- Posse panel: ResizeObserver for adaptive display (full → compact → count-only)

### Suggested priorities for next session
1. **Rotate YouTube API key** — leaked key may be compromised
2. Deploy web app changes to Railway (responsive scaling, fullscreen fix, QR cleanup)
3. End-to-end production test (create room, join, verify fullscreen persistence, QR code URL, scaling)
4. Test on Mac
5. Phase 4 polish: remove popout player code, dead webview-preload IPC events, consolidate YouTube cleanup CSS
6. Set FROM_EMAIL on Railway to noreply@cooldudekaraoke.com
7. Re-enable Amped download banner when ready
8. Consider cooldudekaraoke.com landing page with download links

### Phase 4 cleanup list
- Remove popout player code (main.js IPC handlers, POPOUT_CSS, polling; VideoPlayer.js popout state; preload.js listeners)
- Remove dead webview-preload.js IPC events
- Consolidate YouTube cleanup CSS (main.js, VideoPlayer.js, webview-preload.js)
- Tighten CSP (unsafe-eval in webview-preload)
- Fix YouTube quota counter (reset at midnight)
- React 18 → 19 upgrade
- Set FROM_EMAIL env var on Railway to noreply@cooldudekaraoke.com

### Services status
- Backend (nodemon) — running on port 3000
- Web client (Vite) — running on port 5173
- Docker (karaoke-postgres) — running
- Electron (Amped) — closed at session end
