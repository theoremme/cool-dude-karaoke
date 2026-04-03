# Karaoke Playlist App - Complete Project Package

Welcome! This package contains everything you need to build your karaoke playlist desktop application with Claude's help.

## 📦 What's In This Package

### Core Documentation
1. **karaoke-app-prompt.md** - Full technical specification for the entire app
2. **karaoke-app-development-plan.md** - Complete 7-phase development roadmap with time estimates
3. **api-key-architecture.md** - Technical guide for pluggable API key system (future-proof design)

### Ready-to-Use Prompts
4. **PHASE-1-PROMPT.md** - Copy-paste prompt for Phase 1 (Setup & Search)
5. **PHASE-2-PROMPT.md** - Copy-paste prompt for Phase 2 (Playlist & Sync)
6. **README.md** - This file

## 🚀 How to Use This Package

### Before You Start

**Prerequisites:**
- [ ] Windows machine with Node.js installed (v18+ recommended)
- [ ] Code editor installed (VS Code recommended)
- [ ] YouTube Data API key from Google Cloud Console
  - Go to: https://console.cloud.google.com/
  - Create a new project
  - Enable YouTube Data API v3
  - Create credentials (API key)
  - Save the API key
- [ ] YouTube OAuth 2.0 credentials (for Phase 2)
  - Same Google Cloud project
  - Create OAuth 2.0 credentials
  - Configure OAuth consent screen

### Step-by-Step Process

#### Phase 1: Project Setup & YouTube Search (1-2 hours)

1. Open `PHASE-1-PROMPT.md`
2. Follow the instructions exactly:
   - Open a new Claude chat
   - Attach `karaoke-app-prompt.md`
   - Copy and paste the prompt from the file
3. Follow Claude's setup instructions
4. Test that YouTube search works
5. ✅ Don't proceed until Phase 1 is fully working!

#### Phase 2: Playlist, Playback & YouTube Sync (6-9 hours)

1. Open `PHASE-2-PROMPT.md`
2. Follow the instructions exactly:
   - Open a NEW Claude chat (don't continue Phase 1 chat)
   - Attach `karaoke-app-prompt.md` AND `api-key-architecture.md`
   - ZIP your Phase 1 project folder and attach it
   - Copy and paste the prompt from the file
3. Follow Claude's instructions
4. Set up OAuth credentials as needed
5. Test all features thoroughly
6. ✅ Verify auto-advance and YouTube playlist sync work!

#### Phases 3-7: Additional Features (Optional)

Refer to `karaoke-app-development-plan.md` for:
- Phase 3: Skip & Delete Controls (1-2 hours)
- Phase 4: Pop-Out Player Window (2-3 hours)
- Phase 5: Additional Polish (2-4 hours)
- Phase 6: Packaging for Windows (1 hour)
- Phase 7: macOS Support (if needed)

## 📖 Document Guide

### When to Read Each Document

**karaoke-app-prompt.md**
- Read: Before starting, for overall understanding
- Use: Attach to EVERY Claude conversation
- Purpose: Full technical specification

**karaoke-app-development-plan.md**
- Read: Before starting, to understand the full roadmap
- Use: Reference throughout development
- Purpose: Complete phase-by-phase guide with troubleshooting

**api-key-architecture.md**
- Read: Before Phase 2
- Use: Attach to Phase 2 conversation
- Purpose: Ensures future-proof API key management

**PHASE-1-PROMPT.md**
- Read: When starting Phase 1
- Use: Copy the prompt exactly as written
- Purpose: Get Phase 1 built correctly

**PHASE-2-PROMPT.md**
- Read: After Phase 1 is complete
- Use: Copy the prompt exactly as written
- Purpose: Get Phase 2 built with proper architecture

## 🎯 What You're Building

**Core Problem Solved:**
YouTube playlists don't auto-advance to videos added after playback starts. This app creates a dynamic queue that keeps playing smoothly as people add more songs - perfect for karaoke parties!

**Key Features:**
- ✅ YouTube search and video preview
- ✅ Dynamic playlist that accepts additions during playback
- ✅ Auto-advance to next video
- ✅ YouTube playlist sync (5-second polling when active)
- ✅ Mobile contribution via YouTube app
- ✅ Quota management and warnings
- ✅ Skip and delete controls
- ✅ Pop-out fullscreen player (future phase)

**Tech Stack:**
- Electron (desktop framework)
- React (frontend)
- Node.js (backend)
- YouTube Data API v3
- YouTube IFrame Player API

## ⏱️ Timeline

### Minimum Viable Product (Phases 1-2)
- **Phase 1**: 1-2 hours (Setup & Search)
- **Phase 2**: 6-9 hours (Playlist & Sync)
- **Total**: 7-11 hours

### Full Featured App (Phases 1-7)
- **Total**: 14-20 hours

You can use the app after Phase 2 - everything else is polish and additional features!

## 💡 Pro Tips

### Working with Claude

**DO:**
- ✅ Start a NEW chat for each phase
- ✅ Always attach the specification document
- ✅ Copy error messages exactly
- ✅ Test thoroughly before moving to next phase
- ✅ Save your work between phases (git commit recommended)

**DON'T:**
- ❌ Skip testing between phases
- ❌ Move forward if something isn't working
- ❌ Forget to attach necessary files
- ❌ Try to do multiple phases in one conversation

### Troubleshooting

**If you get stuck:**
1. Stay in the same chat
2. Copy the FULL error message
3. Describe what you were doing
4. Paste relevant code
5. Ask Claude to debug

**If really stuck:**
1. Start a fresh chat
2. Attach your project folder
3. Explain: "I'm on Phase X, stuck on [specific issue]"
4. Include error messages and relevant code

### Testing Tips

**Phase 1:**
- Search for various terms
- Verify thumbnails load
- Check that video info displays correctly

**Phase 2:**
- Add 5+ videos to playlist
- Let them auto-advance completely
- Create a test YouTube playlist
- Add videos from your phone
- Verify they appear in the app within 10 seconds
- Check quota tracking updates

## 🔑 API Key Management

### v1.0 (What You're Building Now)
- Uses your embedded API key
- Good for personal use + 2-3 friends
- ~3,000 units per party
- Can run 3 parties per day

### Future Expansion (v1.1+)
- Architecture is already built for user-provided keys
- When needed, just uncomment code in `ApiKeyManager.js`
- Add UI components
- No refactoring required!

## 📊 Expected Quota Usage

**With 5-second polling:**
- Active playback: 720 units/hour
- Paused: 120 units/hour  
- 6-hour party: ~3,000 units (30% of daily quota)

**Daily limit: 10,000 units**
- Can run 3 parties per day
- Or leave app running for ~14 hours continuously

## 🎉 Success Metrics

### After Phase 1
You should be able to:
- [ ] Open the app
- [ ] Search for "karaoke songs"
- [ ] See results with thumbnails and titles

### After Phase 2
You should be able to:
- [ ] Search and add videos to playlist
- [ ] Play the playlist and have it auto-advance
- [ ] Connect to a YouTube playlist
- [ ] Add videos from your phone via YouTube
- [ ] See them appear in the app automatically
- [ ] View quota usage

### Complete App (After All Phases)
You should be able to:
- [ ] Host a karaoke party
- [ ] Friends add songs from phones
- [ ] Songs play continuously without stopping
- [ ] Pop out video to TV/projector
- [ ] Skip or delete unwanted songs
- [ ] Save/load playlist sessions

## 🆘 Getting Help

**In your Claude conversation:**
```
I'm getting this error: [paste full error]

This happened when I [describe action].

Here's the relevant code: [paste code]

Can you help me debug this?
```

**If you need to explain the project to someone:**
Just share `karaoke-app-prompt.md` - it has the complete specification.

## 📝 Project Structure (After Phase 2)

```
karaoke-playlist-app/
├── package.json
├── main.js (Electron main process)
├── src/
│   ├── App.jsx (Main React component)
│   ├── components/
│   │   ├── SearchBar.jsx
│   │   ├── SearchResults.jsx
│   │   ├── PlaylistQueue.jsx
│   │   └── VideoPlayer.jsx
│   ├── services/
│   │   ├── ApiKeyManager.js ← Abstraction layer
│   │   ├── YouTubeService.js ← All API calls
│   │   └── PlaylistSyncService.js ← Polling logic
│   └── config/
│       └── youtube.config.js ← API key & settings
└── public/
    └── index.html
```

## 🎬 Ready to Start?

1. **Read** `karaoke-app-prompt.md` to understand what you're building
2. **Open** `PHASE-1-PROMPT.md` 
3. **Follow** the instructions exactly
4. **Build** your karaoke app!

Good luck! 🎤🎵

---

**Questions?** 
Refer to `karaoke-app-development-plan.md` for detailed troubleshooting, examples, and guidance.
