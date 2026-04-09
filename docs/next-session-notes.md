## Next Session Notes (updated 2026-04-09)

### What was completed
- Phase 1 convergence is essentially complete
- Auth, rooms, socket sync, playlist sync, Amped/Unplugged mode switching all working
- QR invite panel, posse display, closeout page with PDF (Phase 3 items done early)
- Non-embeddable song dimming + auto-skip in Unplugged mode
- Amped disconnect countdown with fallback to Unplugged
- GitHub Actions CI builds Windows + Mac, creates GitHub Release on version tags
- v1.5 release build triggered
- Amped download banner added to Unplugged host pages
- .env secrets removed from packaged builds

### Known issues to investigate
- YouTube playlist sync ordering — sort fix added but needs verification with a real playlist
- Reconnection from Unplugged back to Amped can require a play/pause toggle to start video
- YouTube OAuth publishing in Electron uses "Open in Browser" workaround — full native OAuth is Phase 3

### Decisions made
- Phase 2 (yt-dlp) is deferred — risk to YouTube API quota review. Webview player stays for now.
- Default backend URL is Railway production. Users can override to localhost via Settings for dev.
- Mac builds are unsigned (Apple Developer $99/year needed for code signing)

### Suggested priorities for next session
1. Verify v1.5 GitHub Release built successfully and test the downloaded .exe/.dmg
2. Test full end-to-end flow on production Railway (not localhost)
3. Smooth out Amped reconnection (video auto-start after Unplugged → Amped transition)
4. Phase 3 remaining: inactivity countdown modal, session persistence improvements
5. Phase 4 polish: consolidate CSS, remove dead webview-preload code, keyboard shortcuts
6. Consider adding a "Backend URL" field to the Electron Settings panel for easier dev/prod switching
