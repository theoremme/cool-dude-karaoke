# Karaoke App Development Plan - Working with Claude

This document breaks down the development into manageable phases with specific instructions for each Claude conversation session.

---

## 📋 Before You Start

### Prerequisites Checklist
- [ ] Windows machine with Node.js installed (v18+ recommended)
- [ ] Code editor installed (VS Code recommended)
- [ ] YouTube Data API key obtained from Google Cloud Console
  - Go to: https://console.cloud.google.com/
  - Create a new project
  - Enable YouTube Data API v3
  - Create credentials (API key)
  - Save the API key securely
- [ ] Git installed (optional but recommended)

### Files You'll Need
- `karaoke-app-prompt.md` - The main specification document
- This development plan document
- Any files generated in previous phases (for later phases)

---

## Phase 1: Project Setup & Basic Structure
**Goal**: Get the Electron + React + Node.js application running with basic UI

**Estimated Time**: 1-2 hours

### What You'll Build
- Electron application that opens a window
- React app with basic component structure
- YouTube Data API integration (search only)
- Basic search interface

### Instructions

#### Step 1: Open a New Chat
**Attach**: `karaoke-app-prompt.md`

**Paste This Prompt**:
```
I'm building the karaoke playlist application described in the attached specification document. Let's start with Phase 1.

Please help me:
1. Set up an Electron + React + Node.js project structure for Windows
2. Configure all necessary dependencies
3. Set up the YouTube Data API v3 integration (I have my API key ready)
4. Create the basic React component structure with:
   - SearchBar component
   - SearchResults component (displays search results in a grid)
   - Basic layout with search at the top

Please provide:
- Complete package.json with all dependencies
- Project folder structure
- Step-by-step setup instructions
- All configuration files needed
- The initial React components

I want to be able to search YouTube and see results displayed. Don't implement the playlist functionality yet.
```

#### Step 2: Follow Claude's Instructions
Claude will provide:
- Folder structure to create
- Files to create with their contents
- Commands to run

**Action Items**:
1. Create the project folder (e.g., `karaoke-playlist-app`)
2. Create each file Claude provides
3. Run `npm install` to install dependencies
4. Add your YouTube API key where Claude indicates (usually in a config file or .env)
5. Run the app using the start command Claude provides (likely `npm start`)

#### Step 3: Verify Phase 1 Complete
✅ **Success Criteria**:
- Application window opens
- You can type in the search bar
- Search results display with thumbnails, titles, and durations
- Results show when you search for a video (e.g., "karaoke songs")

#### Troubleshooting
If something doesn't work:
- **Same chat**: Describe the error message you're seeing
- Claude can debug and provide fixes
- Share the exact error from your terminal/console

---

## Phase 2: Playlist Queue & Basic Playback
**Goal**: Add playlist functionality and get videos playing

**Estimated Time**: 1-2 hours

### What You'll Build
- Playlist queue component that displays added videos
- "Add to Playlist" button on search results
- YouTube player that plays the first video
- Basic play/pause functionality

### Instructions

#### Step 1: Open a New Chat
**Attach**: 
- `karaoke-app-prompt.md`
- Your entire project folder as a ZIP file (or key files: package.json and your src/ folder)

**Paste This Prompt**:
```
I'm continuing development on the karaoke playlist application (specification attached). I've completed Phase 1 - the app runs and YouTube search works.

Now I need Phase 2: Playlist Queue & Basic Playback

Please help me add:
1. PlaylistQueue component that displays added videos in a list
2. "Add to Playlist" button on each search result
3. Playlist state management (use React Context or simple state)
4. YouTube IFrame Player integration to play videos
5. The player should show the current video from the playlist
6. Basic play/pause functionality

The playlist should:
- Show video thumbnails, titles, and position in queue
- Display "empty playlist" message when no videos added
- Show the current playing video differently (highlight it)

Show me exactly which files to modify and what code to add.
```

#### Step 2: Implement Changes
Claude will tell you:
- Which files to modify
- New components to create
- State management approach

**Action Items**:
1. Create new files Claude specifies
2. Update existing files with the changes Claude provides
3. Restart your app
4. Test by searching for videos and adding them to the playlist

#### Step 3: Verify Phase 2 Complete
✅ **Success Criteria**:
- You can add videos from search results to a playlist
- Playlist displays all added videos
- Clicking play starts the first video
- Video plays in an embedded player
- You can pause and resume playback

---

## Phase 3: Auto-Advance & Playlist Controls
**Goal**: Make the playlist automatically advance and add management controls

**Estimated Time**: 1-2 hours

### What You'll Build
- Auto-advance to next video when current finishes
- Skip button (jump to next video immediately)
- Delete button for each playlist item
- Add videos to playlist while playing (without interruption)

### Instructions

#### Step 1: Open a New Chat
**Attach**: 
- `karaoke-app-prompt.md`
- Your current project folder as ZIP

**Paste This Prompt**:
```
I'm continuing the karaoke playlist app (spec attached). Phase 2 is complete - videos play from the playlist.

Now I need Phase 3: Auto-Advance & Playlist Controls

Please help me add:
1. Auto-advance: When a video ends, automatically play the next video in the queue
2. Skip button: Jump to the next video immediately
3. Delete button: Remove individual videos from the playlist (with confirmation if currently playing)
4. Current video indicator: Clearly show which video is playing
5. Ensure adding new videos during playback doesn't interrupt the current video

The playlist should:
- Continue smoothly from video to video
- Handle edge cases (skip last video, delete currently playing video)
- Stop playback if playlist reaches the end with no more videos
- Update the queue display in real-time

Show me which files to modify and provide the complete updated code.
```

#### Step 2: Implement Changes
**Action Items**:
1. Apply all changes Claude provides
2. Pay special attention to the YouTube Player event listeners (onStateChange)
3. Test thoroughly:
   - Add 3+ videos
   - Let them auto-advance
   - Try skipping
   - Try deleting items
   - Add a new video while one is playing

#### Step 3: Verify Phase 3 Complete
✅ **Success Criteria**:
- Videos automatically advance when they finish
- Skip button works and moves to next video
- Delete button removes videos from queue
- Currently playing video is clearly marked
- Can add videos during playback without interruption
- Playlist stops when it reaches the end

---

## Phase 4: Pop-Out Player Window
**Goal**: Allow the video player to be separated from the main window

**Estimated Time**: 2-3 hours (this is more complex)

### What You'll Build
- "Pop Out" button to open video in a separate window
- Separate Electron window for the video player
- State synchronization between windows
- Fullscreen capability in pop-out window

### Instructions

#### Step 1: Open a New Chat
**Attach**: 
- `karaoke-app-prompt.md`
- Current project folder as ZIP

**Paste This Prompt**:
```
I'm continuing the karaoke playlist app (spec attached). Phase 3 is complete - playlist auto-advances and has full controls.

Now I need Phase 4: Pop-Out Player Window

This is the most complex phase. Please help me:
1. Add a "Pop Out" button near the video player
2. Create a new Electron window that shows only the video player
3. Synchronize playback state between the main window and pop-out window using Electron IPC
4. The pop-out window should:
   - Show the video player
   - Display current video title
   - Have basic controls (play/pause, skip)
   - Be resizable and able to go fullscreen
5. When pop-out is active, the main window should still show the playlist and search
6. Add a "Dock" button to bring the player back to the main window

Please provide:
- Electron main process changes for creating the second window
- IPC communication setup between windows
- React components for the pop-out window
- State synchronization logic

Break this down into steps if it's complex.
```

#### Step 2: Implement Carefully
This phase involves Electron IPC which is more advanced.

**Action Items**:
1. Follow Claude's instructions step-by-step
2. Create new window files as specified
3. Update the Electron main process file
4. Implement IPC handlers
5. Test extensively:
   - Pop out while playing
   - Control playback from both windows
   - Skip videos from pop-out window
   - Close pop-out and verify main window still works

**Pro Tip**: If this phase feels overwhelming, tell Claude: "This seems complex. Can you break it down into smaller sub-steps?" Claude can guide you through it more gradually.

#### Step 3: Verify Phase 4 Complete
✅ **Success Criteria**:
- Pop-out button opens a new window with the player
- Video continues playing in the new window
- Can control playback from either window
- Skip button in pop-out window advances the playlist
- Can close pop-out and player returns to main window
- Pop-out window can go fullscreen

---

## Phase 5: YouTube Playlist Sync (Optional)
**Goal**: Monitor a YouTube playlist and sync new additions

**Estimated Time**: 2-3 hours

### What You'll Build
- YouTube authentication (OAuth 2.0)
- Input field to connect to a YouTube playlist
- Background polling service to check for new videos
- Auto-add new videos to local queue

### Instructions

#### Step 1: Set Up YouTube OAuth
**Before opening Claude**:
- Go to Google Cloud Console
- Set up OAuth 2.0 credentials
- Add authorized redirect URIs
- Download the OAuth credentials JSON

#### Step 2: Open a New Chat
**Attach**: 
- `karaoke-app-prompt.md`
- Current project folder as ZIP
- OAuth credentials file (if you want Claude to help configure it)

**Paste This Prompt**:
```
I'm continuing the karaoke playlist app (spec attached). Core features are complete.

Now I want to add Phase 5: YouTube Playlist Sync

This is an advanced optional feature. Please help me:
1. Implement YouTube OAuth 2.0 authentication
2. Add an input field to enter a YouTube playlist URL or ID
3. Create a background service that:
   - Polls the YouTube playlist every 30 seconds
   - Detects new videos added to the YouTube playlist
   - Automatically adds them to the local queue
4. Display connection status (connected to playlist X)
5. Handle API quota limits gracefully
6. Add a manual "Sync Now" button

The goal: Users can add videos from their phones to the YouTube playlist, and they'll automatically appear in the app's queue.

Please guide me through:
- Setting up OAuth authentication
- Implementing the polling service
- Managing API rate limits
- UI for connecting to a playlist

Break this into sub-steps if needed.
```

#### Step 2: Implement Authentication First
This phase is complex. Focus on:
1. Getting OAuth working first
2. Then add playlist fetching
3. Finally add the polling service

**Action Items**:
1. Set up OAuth as Claude instructs
2. Test authentication flow
3. Implement playlist fetching
4. Add polling logic
5. Test with a real YouTube playlist (add videos from your phone)

#### Step 3: Verify Phase 5 Complete
✅ **Success Criteria**:
- Can authenticate with YouTube account
- Can connect to a YouTube playlist by entering its URL
- App polls the playlist for changes
- New videos added to YouTube playlist appear in the app automatically
- Displays connection status
- Manual sync button works
- Handles API errors gracefully

---

## Phase 6: Polish & Features
**Goal**: Add quality-of-life improvements and polish the UX

**Estimated Time**: 2-4 hours

### What You'll Build
- Save/load playlist sessions
- Keyboard shortcuts
- Better UI styling
- Error handling improvements
- Volume controls

### Instructions

#### Step 1: Open a New Chat
**Attach**: 
- `karaoke-app-prompt.md`
- Current project folder as ZIP

**Paste This Prompt**:
```
I'm finishing the karaoke playlist app (spec attached). All core features work.

Now I want to add Phase 6: Polish & Quality-of-Life Features

Please help me add:
1. Save playlist functionality (save current queue to a JSON file)
2. Load playlist functionality (restore a saved queue)
3. Keyboard shortcuts:
   - Space: play/pause
   - N: next/skip
   - F: fullscreen (when popped out)
   - Delete: remove selected playlist item
4. Volume control slider
5. Better error handling (network errors, video unavailable, etc.)
6. Improve the UI styling:
   - Better layout
   - Consistent colors and spacing
   - Loading indicators
7. Add a "Clear All" button for the playlist
8. Display total playlist duration

Focus on making the app feel polished and professional. Suggest UI improvements as you implement these features.
```

#### Step 2: Implement Incrementally
**Action Items**:
1. Add features one at a time
2. Test each addition
3. If you don't like a UI change, tell Claude and ask for alternatives
4. Iterate on the design until you're happy

#### Step 3: Verify Phase 6 Complete
✅ **Success Criteria**:
- Can save and load playlists
- Keyboard shortcuts work
- Volume control functions properly
- Errors are handled gracefully with user-friendly messages
- UI looks polished and professional
- App feels smooth to use

---

## Phase 7: Packaging & Distribution
**Goal**: Create an installer for Windows

**Estimated Time**: 1 hour

### What You'll Build
- Windows executable (.exe)
- Installer for easy distribution

### Instructions

#### Step 1: Open a New Chat
**Attach**: 
- `karaoke-app-prompt.md`
- Current project folder as ZIP (or just package.json)

**Paste This Prompt**:
```
My karaoke playlist app is complete and working well. Now I need to package it for distribution on Windows.

Please help me:
1. Set up electron-builder to package the app
2. Configure it to create a Windows installer (.exe)
3. Add an application icon
4. Set up proper app metadata (name, version, description)
5. Create a build script in package.json

Provide step-by-step instructions for:
- Installing electron-builder
- Creating the configuration
- Building the installer
- Testing the installer

I want to be able to share this app with friends who can just double-click an installer to use it.
```

#### Step 2: Build and Test
**Action Items**:
1. Install electron-builder as Claude instructs
2. Create/update configuration files
3. Add an app icon (you can create one or find one online)
4. Run the build command
5. Test the installer on your machine
6. If possible, test on another Windows machine

#### Step 3: Verify Phase 7 Complete
✅ **Success Criteria**:
- `npm run build` creates an installer
- Installer works and installs the app
- Installed app runs correctly
- App has proper icon and name in Windows

---

## 🎯 General Tips for Working with Claude

### During Each Phase

**✅ DO:**
- Be specific about errors you encounter (copy full error messages)
- Ask Claude to explain complex code sections
- Request alternatives if you don't like an approach
- Test frequently as you implement
- Save your work and commit to git between phases

**❌ DON'T:**
- Implement multiple phases in one chat (Claude works best focused on one phase)
- Skip testing between changes
- Move to the next phase if the current phase isn't working
- Forget to attach necessary files (spec doc and your current code)

### If You Get Stuck

**In the Same Chat**:
```
I'm getting this error: [paste full error message]

This happened when I [describe what you were doing].

Here's the relevant code from [filename]: [paste code]

Can you help me debug this?
```

**If Really Stuck**:
1. Start a new chat
2. Attach your project folder
3. Explain: "I'm working on [phase] of this karaoke app [attach spec]. I'm stuck on [specific issue]. Here's what's happening: [describe problem]."

### Asking for Modifications

**Good Request**:
```
The playlist UI works but I'd like to make it look better. Can you:
- Make the video thumbnails larger
- Add a hover effect on playlist items
- Change the delete button to an icon instead of text
- Make the currently playing video highlighted in green

Which files should I modify?
```

**Vague Request** (avoid):
```
Can you make it look nicer?
```

### Requesting Explanations

```
Can you explain how the auto-advance functionality works? Specifically:
- Where is the YouTube player event being listened to?
- How does it know which video is next?
- What happens if there's no next video?
```

---

## 📊 Project Timeline Estimate

| Phase | Estimated Time | Complexity |
|-------|---------------|------------|
| Phase 1: Setup & Search | 1-2 hours | Easy |
| Phase 2: Playlist & Playback | 1-2 hours | Medium |
| Phase 3: Auto-Advance & Controls | 1-2 hours | Medium |
| Phase 4: Pop-Out Window | 2-3 hours | Hard |
| Phase 5: YouTube Sync | 2-3 hours | Hard |
| Phase 6: Polish | 2-4 hours | Medium |
| Phase 7: Packaging | 1 hour | Easy |
| **Total** | **10-17 hours** | |

**Note**: Times assume you have basic familiarity with React and Node.js. Add 50% more time if you're learning as you go.

---

## 🎉 Success Checklist

By the end of all phases, you should have:
- [ ] A working desktop application
- [ ] YouTube search and playlist functionality
- [ ] Auto-advancing playlist
- [ ] Pop-out fullscreen player
- [ ] (Optional) YouTube playlist sync
- [ ] Polished UI with keyboard shortcuts
- [ ] Windows installer for distribution

---

## 📝 Notes Section

Use this space to track your progress:

**Phase 1 Completion Date**: ___________
**Issues Encountered**: 

**Phase 2 Completion Date**: ___________
**Issues Encountered**: 

**Phase 3 Completion Date**: ___________
**Issues Encountered**: 

**Phase 4 Completion Date**: ___________
**Issues Encountered**: 

**Phase 5 Completion Date**: ___________
**Issues Encountered**: 

**Phase 6 Completion Date**: ___________
**Issues Encountered**: 

**Phase 7 Completion Date**: ___________
**Issues Encountered**: 

---

## 🆘 Quick Reference

### File Sharing with Claude
- **Small projects** (<50 files): Attach your entire project folder as ZIP
- **Large projects**: Attach only: package.json, your src/ folder, and any config files

### Common Commands You'll Use
```bash
npm install                 # Install dependencies
npm start                   # Run the app in development
npm run build              # Build for production (Phase 7)
```

### Most Important Files
- `package.json` - Dependencies and scripts
- `src/main.js` or `main.js` - Electron main process
- `src/App.js` - Main React component
- `src/components/` - Your React components

Good luck building your karaoke app! 🎤🎵
