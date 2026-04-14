# Session Changelog — 2026-04-13

## Summary
Auth overhaul: password reset via Resend, beta whitelist with admin page, Space Grotesk font, lobby redesign, dynamic AMPED/UNPLUGGED logo switching, guest mode fixes, Amped disconnect countdown, Backend URL in Settings.

## Commits (Electron repo — cool-dude-karaoke)
1. **2c0dd71** — Add forgot password, beta whitelist, admin page, openExternal IPC
2. **0cce43c** — Add whitelist rejection screen, forgot password styling for Electron
3. **e2ef830** — Sync CSS with Unplugged: Space Grotesk, lobby layout, logo positioning
4. **4d9664f** — Bump version to v2.0
5. **6b6bb4f** — Fix forgot password: use cooldudekaraoke.com, Bowie casing, cyan email
6. **cc9c60c** — Add Backend URL to Settings, use cooldudekaraoke.com as default
7. **17e5169** — Bump version to v2.1
8. **b70390d** — Fix CSP: allow connections to www.cooldudekaraoke.com
9. **ad7cb67** — Bump version to v2.2
10. **25d3057** — Bump version to v2.3

## Commits (Web repo — cool-dude-karaoke-web)
1. **8f2831e** — Add password reset, beta whitelist, admin page
2. **03bc0ce** — UI polish: Space Grotesk font, whitelist rejection screen, lobby layout
3. **e935d53** — Lobby polish: random greetings, hide section h2s, spacing tweaks
4. **c48183a** — Update logo asset
5. **15b7835** — Revert nav buttons to default font, hide active rooms h2
6. **8d3ef23** — Add /forgot-password route, fix reset-password redirect
7. **1f21024** — Unlock full library in amped mode, fix duplicate You in posse, disable mobile player
8. **d3e0961** — Add mode badge on mobile, show playlist loading on mode switch
9. **ac66898** — Fix guest posse, mode sync, full library in amped mode
10. **42804f1** — Add mode badge to desktop Unplugged, disconnect countdown on mobile+desktop
11. **6695f8e** — Logo switches between AMPED/UNPLUGGED based on mode, remove video placeholder

## New Files Created (Web repo)
- `client/src/components/AdminPage.jsx` — Admin page: whitelist management + registered users list
- `client/src/components/ResetPasswordPage.jsx` — Password reset form (token from URL)
- `server/src/routes/admin.js` — Admin API routes (GET/POST/DELETE whitelist, GET users)
- `server/src/services/emailService.js` — Resend email service for password reset
- `server/prisma/migrations/20260412171925_add_beta_whitelist_admin_password_reset/migration.sql`

## New Files Created (Electron repo)
- `docs/tech-stack.md` — Full tech stack reference with service access info

## Files Modified (Electron)
- `main.js` — Added `shell` import, `open-external` IPC handler
- `preload.js` — Added `openExternal` context bridge method
- `src/components/AuthPage.js` — Forgot password (opens browser), whitelist rejection screen, "You had me at hello", Bowie message
- `src/components/RoomLobby.js` — Random greetings, logout footer, hidden h2s
- `src/components/Settings.js` — Backend URL field at top of settings panel
- `src/services/ApiKeyManager.js` — Default production URL changed to www.cooldudekaraoke.com
- `src/index.html` — Space Grotesk font import, CSP updated for cooldudekaraoke.com
- `src/styles/App.css` — Space Grotesk font, lobby greeting, auth-forgot, whitelist-message, fadeIn animation, logo spacing, nav button styling
- `docs/next-session-notes.md` — Added Resend domain to Phase 4 list

## Files Modified (Web repo)
- `client/src/App.jsx` — Added routes: /forgot-password, /reset-password/:token, /admin
- `client/src/components/AuthPage.jsx` — Forgot password flow, whitelist rejection screen ("Even Bowie waited backstage..."), startForgot prop
- `client/src/components/HostDashboard.jsx` — Dynamic AMPED/UNPLUGGED logo, disconnect countdown (mobile+desktop), Backstage button, posse consolidation by userId, playlist loading on mode switch, disabled mobile tap-to-watch
- `client/src/components/RoomLobby.jsx` — Random greetings, Backstage button (admin only), logout footer, hidden h2s
- `client/src/components/SearchResults.jsx` — Show all videos in amped mode
- `client/src/components/VibeSuggestions.jsx` — Prefer any video in amped mode (not just embeddable)
- `client/src/components/VideoPlayer.jsx` — Removed "Add songs and hit play" placeholder
- `client/src/components/GuestView.jsx` — Listen for mode-changed, sync playbackMode to context, pass playbackMode to PlaylistQueue
- `client/src/hooks/useSocket.jsx` — Added `guest` option to skip auth token
- `client/src/services/api.jsx` — Added forgotPassword, resetPassword, getWhitelist, addToWhitelist, removeFromWhitelist, getUsers
- `client/src/styles/App.css` — Space Grotesk font, admin page styles, success-message, whitelist-message, lobby-greeting, lobby-footer, btn-backstage, btn-logout, mode-badge, logo-amped responsive styles, fadeIn animation
- `server/server.js` — Added admin routes
- `server/prisma/schema.prisma` — Added BetaWhitelist model, isAdmin/resetToken/resetTokenExpiry on User
- `server/src/controllers/authController.js` — Whitelist check on register, forgotPassword, resetPassword, isAdmin in responses
- `server/src/middleware/auth.js` — Added requireAdmin middleware
- `server/src/routes/auth.js` — Added forgot-password and reset-password routes
- `server/src/services/socketService.js` — Countdown shortened to 10 seconds
- `server/package.json` — Added resend dependency

## Dependencies Added
- `resend` (server) — Transactional email for password reset

## Database Migration
- `20260412171925_add_beta_whitelist_admin_password_reset` — Added `beta_whitelist` table, `is_admin`, `reset_token`, `reset_token_expiry` to users table

## Bug Fixes
- Guest socket was sending host's auth token (same browser), causing duplicate "You" in posse — fixed with `guest: true` socket option
- Guest view not listening for `mode-changed` events — search showed embeddable-only even in amped mode
- Guest playbackMode not synced to PlaylistContext — SearchResults couldn't filter properly
- CSP blocking connections to www.cooldudekaraoke.com from Electron
- Forgot password in Electron opening wrong URL (localhost instead of production)
- Posse consolidation merging guests with host when userId was falsy

## Releases
- v2.0 — Auth overhaul, Space Grotesk, lobby redesign
- v2.1 — Backend URL in Settings, cooldudekaraoke.com default
- v2.2 — CSP fix for cooldudekaraoke.com
- v2.3 — Guest fixes, mode sync, full library unlock

## Decisions Made
- Resend for transactional email (password reset)
- Database table for beta whitelist (not env var) — manageable via admin page
- Space Grotesk as secondary font — Orbitron reserved for logo subtitle and closeout title
- Logo dynamically switches between AMPED/UNPLUGGED based on playbackMode (replaces static badges)
- Guest socket connects without auth to prevent userId collision
- Amped disconnect countdown shortened to 10 seconds
- cooldudekaraoke.com as default production backend URL
- OAuth deferred to later phase

## Late-Session Changes (after initial changelog)

### Additional Commits (Electron)
11. **ef3009c** — Add Settings to login/lobby, check room active on reconnect
12. **a847941** — Bump version to v2.4

### Additional Changes (Electron)
- Settings gear icon added to login page and lobby footer (accessible without joining a room)
- On socket reconnect, Amped verifies room is still active via REST API — goes to closeout if room was closed while disconnected (e.g. computer sleep)
- `src/App.js` — Settings state at App level, reconnect room check, Settings passed to AuthPage and lobby
- `src/components/AuthPage.js` — Added `onOpenSettings` prop, gear button at bottom of card
- `src/components/RoomLobby.js` — Added `onOpenSettings` prop, gear button in lobby footer
- `src/styles/App.css` — `.btn-lobby-settings` and `.auth-settings` styles

### Additional Commits (Web repo)
12. **6695f8e** — Logo switches between AMPED/UNPLUGGED based on mode, remove video placeholder

### Bug Fixes
- Room staying active in Amped after server closed it during computer sleep (socket missed room-closed event) — fixed with reconnect room check

### Releases
- v2.4 — Settings on login/lobby, reconnect room check

## External Services Configured
- Resend account created, API key set on Railway and local .env
- cooldudekaraoke.com domain verified in Resend for sending email
- cooldudekaraoke.com DNS configured: SPF, DKIM, MX records in Namecheap
- APP_URL set on Railway for password reset email links
- RESEND_API_KEY set on Railway
