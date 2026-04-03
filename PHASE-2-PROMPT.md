# PHASE 2 PROMPT - Playlist Queue, Playback & YouTube Sync

## What to Do

1. **Open a NEW Claude chat** (don't continue from Phase 1)
2. **Attach these files**:
   - `karaoke-app-prompt.md`
   - `api-key-architecture.md`
   - Your entire project folder as a ZIP file
3. **Copy and paste the prompt below**

---

## 📋 PROMPT TO PASTE:

I'm continuing development on the karaoke playlist application (specification attached). I've completed Phase 1 - the app runs and YouTube search works.

Now I need Phase 2: Playlist Queue, Playback & YouTube Playlist Sync

Please help me add:

**Core Features:**
1. PlaylistQueue component that displays added videos in a list
2. "Add to Playlist" button on each search result
3. Playlist state management (use React Context or simple state)
4. YouTube IFrame Player integration to play videos
5. The player should show the current video from the playlist
6. Basic play/pause functionality
7. Auto-advance: When a video ends, automatically play the next video in the queue

**YouTube Playlist Sync:**
8. YouTube OAuth 2.0 authentication
9. Input field to connect to a YouTube playlist (URL or ID)
10. Background polling service that:
    - Polls the YouTube playlist every 5 seconds when playing
    - Polls every 30 seconds when paused
    - Stops polling when idle for >5 minutes
    - Detects new videos added to the YouTube playlist
    - Automatically adds them to the local queue
11. Display connection status and "last synced" time
12. Manual "Sync Now" button
13. Quota tracking and warnings (display usage, warn at 80%, switch to 30s polling at 90%, pause at 95%)

**CRITICAL ARCHITECTURE REQUIREMENT:**

Implement API key management using the abstraction layer pattern described in api-key-architecture.md (attached).

Create these files with this exact structure:
- `src/config/youtube.config.js` - Configuration constants and embedded API key
- `src/services/ApiKeyManager.js` - API key abstraction layer (with v1.1 methods commented out for future user-provided keys)
- `src/services/YouTubeService.js` - All YouTube API calls (uses ApiKeyManager, NEVER hardcodes keys)
- `src/services/PlaylistSyncService.js` - Playlist polling logic

Requirements:
- `ApiKeyManager.getKey()` is the ONLY way to get the API key anywhere in the app
- `YouTubeService` always calls `apiKeyManager.getKey()` - never accesses the key directly
- Include commented-out "v1.1" code in ApiKeyManager for future user-provided keys
- This architecture must make it trivial to add user-provided keys later without refactoring

For v1.0, `ApiKeyManager.getKey()` should just return the embedded key from config.

**UI Requirements:**

The playlist should:
- Show video thumbnails, titles, duration, and position in queue
- Display "empty playlist" message when no videos added
- Highlight the currently playing video
- Show delete button for each item
- Display YouTube playlist connection status
- Show quota usage meter
- Show "last synced X seconds ago" when connected to YouTube playlist

Show me exactly which files to create, which files to modify, and provide the complete code for each.

---

## ✅ Success Criteria for Phase 2

After following Claude's instructions, you should have:
- [ ] Can add videos from search results to playlist
- [ ] Playlist displays all added videos with thumbnails
- [ ] Clicking play starts the first video
- [ ] Video plays in embedded player
- [ ] Can pause and resume playback
- [ ] Videos automatically advance when they finish
- [ ] Can authenticate with YouTube
- [ ] Can connect to a YouTube playlist by entering its URL
- [ ] App polls the playlist and detects new additions
- [ ] New videos added to YouTube playlist appear in the app automatically
- [ ] Manual "Sync Now" button works
- [ ] Quota usage is displayed
- [ ] Can add new videos during playback without interruption

## 🔧 Setup Steps You'll Do

1. **ZIP your project folder** from Phase 1
2. Apply all changes Claude provides
3. **Set up YouTube OAuth credentials**:
   - Go to Google Cloud Console
   - Set up OAuth 2.0 credentials
   - Add authorized redirect URIs (Claude will tell you what to use)
   - Download credentials and add to your config
4. Test thoroughly:
   - Add 3+ videos to playlist
   - Let them auto-advance
   - Create a test YouTube playlist
   - Connect to it in the app
   - Add a video to YouTube playlist from your phone
   - Verify it appears in the app within 5-10 seconds

## ⚠️ Important Notes

**OAuth Setup:**
- You'll need to create OAuth 2.0 credentials (not just an API key)
- This is separate from the API key you used in Phase 1
- Claude will guide you through where to put the credentials

**Testing the Sync:**
- Create a test YouTube playlist (make it public or unlisted)
- Add the first video manually in the app
- Then add more videos via YouTube on your phone
- They should appear automatically!

**Polling Behavior:**
- While playing: checks every 5 seconds
- While paused: checks every 30 seconds  
- When idle: stops checking (saves quota)
- Resume checking when you interact with the app

## ⏱️ Estimated Time
6-9 hours (this is the biggest phase)

## 📝 Troubleshooting

**If OAuth isn't working:**
- Double-check redirect URIs match exactly
- Make sure OAuth consent screen is configured
- Check that credentials are in the right place

**If polling isn't detecting new videos:**
- Check browser console for API errors
- Verify quota hasn't been exceeded
- Try the manual "Sync Now" button
- Make sure the playlist ID is correct

**If architecture seems wrong:**
- Make sure Claude created all 4 service files
- Verify no API calls hardcode the key
- Check that ApiKeyManager.getKey() is being used everywhere

---

**Next Step**: Once Phase 2 is complete and working, you're done with the core functionality! Phases 3-7 in the development plan cover polish, features, and packaging.
