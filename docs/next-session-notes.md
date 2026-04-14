## Next Session Notes (updated 2026-04-14)

### What was completed this session
- Password reset flow via Resend (both Amped and Unplugged)
- Beta whitelist with admin page (/admin, "Backstage" button on lobby)
- Space Grotesk font added as secondary font across both apps
- Lobby redesign: random greetings, hidden h2s, logout footer
- Dynamic AMPED/UNPLUGGED logo switching based on playbackMode
- Backend URL field added to Electron Settings panel
- Default production URL changed to www.cooldudekaraoke.com
- Settings accessible from login page and lobby (gear icon)
- Amped checks if room is still active on socket reconnect (fixes stale room after sleep)
- CSP updated for cooldudekaraoke.com
- Guest socket fixed (no auth token) to prevent duplicate posse entries
- Guest view now listens for mode-changed events (full library unlocked in amped mode)
- Amped disconnect countdown shown on mobile and desktop Unplugged
- Countdown shortened from 30s to 10s
- "Add songs and hit play" video placeholder removed
- Mobile tap-to-watch disabled
- Resend domain configured (cooldudekaraoke.com verified, DNS records in Namecheap)
- Tech stack reference doc created (docs/tech-stack.md)
- Released v2.0, v2.1, v2.2, v2.3, v2.4

### Known issues to investigate
1. YouTube playlist sync ordering — sort fix added but still unverified with a real playlist
2. Reconnection from Unplugged back to Amped can require a play/pause toggle to start video
3. YouTube OAuth publishing in Electron uses "Open in Browser" workaround
4. Amped disconnect countdown not confirmed working on production (tested locally only)
5. Persisted backend URL in electron-store can override defaults — users upgrading from old builds may have stale Railway URL saved
6. Mac builds need testing (Windows confirmed working)

### Decisions made
- Resend for transactional email, cooldudekaraoke.com verified as sending domain
- Database table for beta whitelist (not env var), managed via /admin page
- Space Grotesk as secondary font, Orbitron only for logo subtitle + closeout title
- Logo dynamically switches AMPED/UNPLUGGED instead of separate badges
- Guest socket connects without auth token to prevent userId collision with host
- OAuth for login deferred to later phase
- Amped disconnect countdown shortened to 10 seconds
- www.cooldudekaraoke.com as default production backend URL

### Suggested priorities for next session
1. End-to-end test on production (create room Unplugged, join Amped, verify logo switch, close Amped, verify countdown + fallback)
2. Test password reset on production (forgot password → email → reset → login)
3. Test beta whitelist on production (try registering with non-whitelisted email)
4. Verify guest posse fix on production (guest shows as separate person)
5. Set FROM_EMAIL on Railway to noreply@cooldudekaraoke.com (currently uses onboarding@resend.dev default)
6. Phase 4 polish: consolidate YouTube cleanup CSS, remove dead webview-preload code, remove popout player code
7. Re-enable Amped download banner when ready
8. Consider cooldudekaraoke.com landing page with download links
9. Test on Mac

### Phase 4 cleanup list
- Remove popout player code (main.js IPC handlers, POPOUT_CSS, polling; VideoPlayer.js popout state; preload.js listeners)
- Remove dead webview-preload.js IPC events
- Consolidate YouTube cleanup CSS (main.js, VideoPlayer.js, webview-preload.js)
- Tighten CSP (unsafe-eval in webview-preload)
- Fix YouTube quota counter (reset at midnight)
- React 18 → 19 upgrade
- Set FROM_EMAIL env var on Railway to noreply@cooldudekaraoke.com

### Services status
- Electron (Amped) — running at session end (local, connected to localhost:3000)
- Web client (Vite) — running on port 5174
- Backend (nodemon) — running on port 3000
- Docker (karaoke-postgres) — running
