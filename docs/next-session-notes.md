## Next Session Notes (updated 2026-04-09)

### What was completed
- Phase 1 convergence complete — auth, rooms, socket sync, playlist sync, Amped/Unplugged mode switching
- Phase 3 features built early — QR invite panel, posse display, closeout page with PDF, non-embeddable dimming, Amped disconnect countdown
- GitHub Actions CI builds Windows + Mac, creates GitHub Release on version tags
- v1.6 release build triggered (v1.5 may have stale localhost default)
- Amped download banner on Unplugged host pages
- Dynamic backend URL (localhost for dev, Railway for packaged builds)
- .env secrets removed from packaged builds
- Posse shows "You" for current user, no duplicate host entries
- UI polish: outlined header buttons, Orbitron headings, popup banner removed, mobile warning on lobby

### Known issues to investigate
1. YouTube playlist sync ordering — sort fix added but needs verification with a real playlist
2. Reconnection from Unplugged back to Amped can require a play/pause toggle to start video
3. YouTube OAuth publishing in Electron uses "Open in Browser" workaround

### Decisions made
- Phase 2 (yt-dlp) deferred — risk to YouTube API quota review
- Mac builds unsigned (Apple Developer $99/year needed)
- Backend URL auto-detects: dev=localhost, packaged=Railway

### Suggested priorities for next session
1. Verify v1.6 GitHub Release built successfully — test downloaded .exe and .dmg
2. Test full end-to-end on production Railway (create room from Unplugged, join from Amped, etc.)
3. Smooth out Amped reconnection (video auto-start after mode transition)
4. Phase 4 polish: consolidate CSS, remove dead webview-preload code, keyboard shortcuts
5. Add "Backend URL" field to Electron Settings panel for easier dev/prod switching
6. Consider adding cooldudekaraoke.com landing page with download links

### Services status
- Electron (Amped) — was running at session end
- Web client (Vite) — running on localhost:5174
- Backend (nodemon) — running on localhost:3000
- Docker (karaoke-postgres) — running
