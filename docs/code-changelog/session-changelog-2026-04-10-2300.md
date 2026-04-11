# Session Changelog — 2026-04-10

## Summary
CSS polish for Amped closeout page, loading overlay between songs, popout player disabled, mobile host UI improvements in Unplugged, embeddable check for playlist sync, vibe API reliability fix, room-closed socket fix.

## Commits (Electron repo — cool-dude-karaoke)
1. **0fe1694** — Closeout page polish: tron grid, spacing, centered card titles
2. **ba21393** — Bump version to v1.7
3. **91be2d0** — Add loading overlay between songs, disable popout button, cleanup popout overlay code
4. **97cf945** — Bump version to v1.8
5. **9067460** — Fix room-closed not reaching Amped after socket reconnect
6. **1752612** — Bump version to v1.9

## Commits (Web repo — cool-dude-karaoke-web)
1. **67b90df** — Temporarily hide Amped download banner
2. **b0bfd39** — Mobile host UI: UNPLUGGED subtitle, neon line, buttons above logo; hide non-embeddable vibe versions in unplugged mode
3. **1f6f8f1** — Add embeddable check to playlist sync; add retries/timeout to vibe API
4. **a0b2d5f** — Mobile warning: show once in lobby only, remove from room

## Files Modified (Electron)
- `CLAUDE.md` — Added popout cleanup to known issues/tech debt list
- `main.js` — Removed popout loading overlay code, removed devtools from popout, reverted body>* CSS selector
- `preload.js` — Removed `onPopoutReady` listener
- `src/App.js` — Fixed socket reconnect room re-join (removed `joinedRef` guard)
- `src/components/VideoPlayer.js` — Added loading overlay between songs (docked), disabled popout button, added loading messages array, removed popout overlay state
- `src/styles/App.css` — Closeout page: tron grid visible (removed z-index), logo spacing, centered card titles, narrower action cards, loading overlay CSS with fade in/out

## Files Modified (Web repo)
- `client/src/components/HostDashboard.jsx` — Mobile header: buttons above logo, logo-wrap with UNPLUGGED subtitle, neon line div, removed room name h2; removed mobile warning from room
- `client/src/components/VibeSuggestions.jsx` — Filter non-embeddable versions in unplugged mode
- `client/src/components/RoomLobby.jsx` — Mobile warning: persist dismissal to sessionStorage, show only once per session
- `client/src/contexts/PlaylistContext.jsx` — Added `playbackMode` as reactive state (alongside ref), exposed in context value
- `client/src/styles/App.css` — Logo subtitle rotation (-7deg to -6deg), scaled subtitle for room (27px) and mobile (20px), mobile host-logo sizing, mobile-header-line neon gradient, hidden Amped download banner (display:none)
- `server/src/routes/sync.js` — Added `checkEmbeddable` call for playlist sync items
- `server/src/services/vibeService.js` — Added `maxRetries: 3, timeout: 60000` to Anthropic client

## New Files Created
- `docs/code-changelog/session-changelog-2026-04-10-2300.md` (this file)

## Files Deleted
- `popout-preload.js` — Created and deleted during popout overlay experimentation

## Bug Fixes
- Closeout page tron grid not visible in Amped (had position:relative; z-index:1 blocking body pseudo-elements)
- Closeout page content spacing too wide in Amped (width:100% instead of auto margins + centered flex)
- UNPLUGGED subtitle not scaling with logo in room view (fixed font-size and position didn't match larger logo)
- UNPLUGGED subtitle missing on mobile host view (mobile used different header structure without logo-wrap)
- Non-embeddable videos showing in Vibe "Show Versions" in unplugged mode (added playbackMode filter)
- Playlist sync items missing embeddable flag (server wasn't calling checkEmbeddable)
- Vibe API intermittent failures (added retries and timeout to Anthropic client)
- Room-closed event not reaching Amped after socket reconnect (joinedRef guard prevented re-join)
- Mobile "hits different" warning showing in both lobby and room (removed from room, persisted dismissal)

## Decisions Made
- Popout player disabled — second screen handled by web app joining the room instead
- Popout code kept but button hidden; full removal deferred to Phase 4 cleanup
- Amped download banner temporarily hidden on Unplugged (display:none with TODO comment)
- Considered switching vibe from Anthropic to Gemini — deferred, retry fix addresses the intermittent failures

## Releases
- v1.7 — Closeout CSS polish
- v1.8 — Loading overlay, popout disabled
- v1.9 — Socket reconnect fix
