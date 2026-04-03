# PHASE 1 PROMPT - Project Setup & YouTube Search

## What to Do

1. **Open a NEW Claude chat**
2. **Attach this file**: `karaoke-app-prompt.md`
3. **Copy and paste the prompt below**

---

## 📋 PROMPT TO PASTE:

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

---

## ✅ Success Criteria for Phase 1

After following Claude's instructions, you should have:
- [ ] Application window opens
- [ ] Search bar is visible
- [ ] You can type a search query
- [ ] Search results display with thumbnails, titles, and durations
- [ ] Results appear when you search (test with "karaoke songs")

## 🔧 Setup Steps You'll Do

1. Create a project folder (e.g., `karaoke-playlist-app`)
2. Create each file Claude provides
3. Run `npm install` to install dependencies
4. Add your YouTube API key where Claude indicates (usually in a config file or .env)
5. Run the app using the command Claude provides (likely `npm start`)

## ⏱️ Estimated Time
1-2 hours

## 📝 Notes

If you encounter errors:
- Stay in the SAME chat
- Copy the full error message
- Ask Claude to help debug
- Don't move to Phase 2 until this works!

---

**Next Step**: Once Phase 1 is complete and working, open `PHASE-2-PROMPT.md`
