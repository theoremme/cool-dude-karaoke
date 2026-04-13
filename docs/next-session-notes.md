## Next Session Notes (updated 2026-04-10)

### What was completed this session
- Closeout page CSS polish: tron grid visible, proper spacing, centered titles (Amped)
- Loading overlay between songs in docked player with fun messages and fade in/out
- Popout player disabled — second screen use case handled by web app instead
- UNPLUGGED subtitle scales proportionally to logo in room and mobile views
- Mobile host header: Lobby/Bail above logo, neon line, room name removed
- Non-embeddable videos hidden in Vibe "Show Versions" (unplugged mode)
- Playlist sync now tags items with embeddable status (grey out + "Amped Only" badge)
- Vibe API: added 3 retries + 60s timeout to fix intermittent failures
- Room-closed event now reaches Amped after socket reconnect (re-join fix)
- Mobile warning shows once in lobby only, persisted via sessionStorage
- Amped download banner temporarily hidden on Unplugged
- Logo subtitle rotation changed to -6deg
- Released v1.7, v1.8, v1.9

### Known issues to investigate
1. YouTube playlist sync ordering — sort fix added but still unverified with a real playlist
2. Reconnection from Unplugged back to Amped can require a play/pause toggle to start video
3. YouTube OAuth publishing in Electron uses "Open in Browser" workaround
4. v1.9 needs testing on Mac (Windows confirmed working)

### Decisions made
- Popout player disabled (button hidden), code kept for potential future use, full removal in Phase 4
- Amped download banner temporarily hidden — re-enable by changing display:none to display:flex in web App.css
- Considered Gemini for Vibe instead of Anthropic — deferred, retry fix should handle intermittent errors
- Phase 2 (yt-dlp) still deferred — risk to YouTube API quota review

### Suggested priorities for next session
1. Test v1.9 on Mac
2. End-to-end test on production Railway (create room Unplugged, join Amped, playlist sync, close room)
3. Smooth out Amped reconnection (video auto-start after mode transition)
4. Phase 4 polish: consolidate YouTube cleanup CSS (3 places), remove dead webview-preload code, remove popout player code
5. Add "Backend URL" field to Electron Settings panel
6. Re-enable Amped download banner when ready
7. Consider cooldudekaraoke.com landing page with download links

### Phase 4 cleanup list
- Remove popout player code (main.js IPC handlers, POPOUT_CSS, polling; VideoPlayer.js popout state; preload.js listeners)
- Remove dead webview-preload.js IPC events
- Consolidate YouTube cleanup CSS (main.js, VideoPlayer.js, webview-preload.js)
- Tighten CSP (unsafe-eval in webview-preload)
- Fix YouTube quota counter (reset at midnight)
- React 18 → 19 upgrade
- Configure custom Resend domain (add DNS records, set FROM_EMAIL env var on Railway to noreply@cooldudekaraoke.com)

### Services status
- Electron (Amped) — running at session end
- Web client (Vite) — not confirmed running
- Backend (nodemon) — not confirmed running
- Docker (karaoke-postgres) — not confirmed running
