# Next Session Notes

## Uncommitted Work
The vibe playlist feature and styling updates are uncommitted. First action should be:
```
git add . && git commit && git push
```

## Incomplete Tasks
1. **Auto-detect and skip Content ID restricted videos** (Task #17)
   - Poll for blur filters on video element, auto-advance when detected
   - Applies to both docked webview and popout BrowserWindow

## Known Issues
- **Player CSS flash on Mac** — YouTube page briefly shows default layout before cleanup CSS kicks in. The `waitForVideoPlaying` approach helps but isn't perfect on slower machines.
- **Popout slow on cold cache** — First popout takes 5-10s on Mac. Subsequent ones are faster (YouTube is cached).
- **`webview-preload.js` is unused** — Can be deleted. Was replaced by `insertCSS` + `executeJavaScript` approach.
- **Code signing** — Windows exe triggers SmartScreen warning, Mac dmg needs right-click > Open. Proper fix requires certificates ($200-400/yr Windows, $99/yr Apple).

## Pending Decisions
- **Web app conversion** — Plan saved in `docs/WEBAPP-CONVERSION-PLAN.md`. User wants to incorporate the vibe feature first. Key trade-off: YouTube IFrame API can't bypass embedding restrictions like the webview approach.
- **Vibe model selection** — Currently hardcoded to `claude-sonnet-4-20250514`. Could make configurable or upgrade to a newer model.

## Suggested Priorities for Next Session
1. Commit and push vibe feature
2. Test vibe on Mac build (trigger CI)
3. Auto-skip Content ID restricted videos
4. Clean up `webview-preload.js` (delete unused file)
5. Consider keyboard shortcuts (Space = play/pause, N = next)
6. Web app conversion if ready

## Testing Needed
- Vibe generation with various themes (genre accuracy)
- Show Versions → Back to Results flow
- Show More (unique results, no duplicates)
- Add All progress tracking
- Custom vibe prompt save/load/reset
- Anthropic key save/clear in Settings
- Mac build with vibe feature
