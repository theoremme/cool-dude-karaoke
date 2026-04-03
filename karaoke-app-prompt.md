# Karaoke Playlist Desktop Application - Project Specification

## Project Overview
Build a desktop application that creates a seamless karaoke experience by managing a YouTube video/audio playlist that can accept new additions while playing, similar to a Korean-style karaoke room system.

## Technical Stack
- **Frontend**: React with JavaScript ES6
- **Backend**: Node.js
- **Platform**: Windows desktop application
- **Framework**: Electron (recommended for desktop deployment)
- **YouTube Integration**: YouTube Data API v3 and YouTube IFrame Player API

## Core Requirements

### 1. YouTube Search Functionality
- Implement YouTube search using the YouTube Data API v3
- Display search results with:
  - Video thumbnail
  - Title
  - Duration
  - Channel name
- Allow users to preview results before adding to playlist
- Provide "Add to Playlist" button for each result

### 2. Playlist Management System

#### Adding Items
- Videos should be appended to the end of the playlist
- Support adding items while playlist is playing
- Each playlist item should display:
  - Thumbnail
  - Title
  - Duration
  - Position in queue
  - Delete/Remove button

#### Playlist Controls
- **Play/Pause**: Control current video playback
- **Skip**: Move immediately to next item
- **Delete**: Remove specific items from queue
- **Re-cue/Restart**: Ability to restart playlist from any position
- **Auto-advance**: Automatically proceed to next video when current finishes

#### Playlist Behavior
- Once started, playlist should continue playing through all items
- Accept new additions during playback without interruption
- If playlist completes (no more items), stop and wait for user to restart
- Allow restarting from any point in the playlist
- Maintain playlist state and order

### 3. Video Player Features

#### Pop-out/Undock Functionality
- Separate video player from playlist interface
- Allow video window to be:
  - Moved independently
  - Resized
  - Maximized to fullscreen
- Maintain playback controls in both modes
- Keep playlist management accessible while video is popped out

#### Player Requirements
- Use YouTube IFrame Player API for video playback
- Maintain playback state across docked/undocked modes
- Display current track information
- Show time elapsed/remaining

### 4. YouTube Playlist Integration (Optional Advanced Feature)

**Problem to Solve**: YouTube playlists don't auto-advance to items added after playback starts

**Desired Solution**:
- Monitor a connected YouTube playlist for new additions
- Poll YouTube Data API for playlist updates
- Automatically add new items to local queue
- Allow users to add videos via their phones to the YouTube playlist
- Sync changes bidirectionally if possible

**Implementation Considerations**:
- YouTube Data API polling frequency (API quota limits)
- Authentication for accessing user playlists
- Real-time sync challenges and solutions
- Fallback: manual refresh button to sync playlist

## Technical Implementation Details

### Application Architecture

```
┌─────────────────────────────────────────┐
│         Electron Main Process            │
│  (Window management, IPC handling)       │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐    ┌────────▼─────────┐
│  React Frontend │    │   Node.js Backend │
│                 │    │                   │
│ - Search UI     │◄───┤ - YouTube API    │
│ - Playlist UI   │    │ - Playlist State  │
│ - Player UI     │    │ - Sync Service    │
└─────────────────┘    └───────────────────┘
```

### Key Components to Build

#### Frontend Components (React)
1. **SearchBar**: YouTube search input and results
2. **SearchResults**: Display search results grid
3. **PlaylistQueue**: Show current playlist with controls
4. **VideoPlayer**: YouTube player wrapper with controls
5. **PlayerControls**: Play, pause, skip, volume controls
6. **PopoutWindow**: Separate window for video player
7. **PlaylistManager**: Add, remove, reorder functionality

#### Backend Services (Node.js)
1. **YouTubeService**: API calls for search and playlist data
2. **PlaylistManager**: State management for queue
3. **SyncService**: Monitor YouTube playlist for changes
4. **IPC Handlers**: Communication between Electron processes

### Data Structures

```javascript
// Playlist Item
{
  id: string,              // Unique identifier
  videoId: string,         // YouTube video ID
  title: string,
  thumbnail: string,
  duration: number,        // in seconds
  channelName: string,
  addedAt: timestamp,
  position: number
}

// Playlist State
{
  items: Array<PlaylistItem>,
  currentIndex: number,
  isPlaying: boolean,
  isPopout: boolean,
  connectedYouTubePlaylistId: string | null
}
```

### API Integration

#### Required APIs
- **YouTube Data API v3**: Search and playlist management
- **YouTube IFrame Player API**: Video playback

#### API Key Setup
- Obtain YouTube Data API key from Google Cloud Console
- Store securely (environment variables or config file)
- Handle API quota limits gracefully

### User Experience Flow

1. **Initial Setup**
   - User opens application
   - (Optional) Authenticate with YouTube account
   - (Optional) Connect to existing YouTube playlist

2. **Building Playlist**
   - Search for videos using search bar
   - Click "Add" to append videos to queue
   - See playlist grow in real-time

3. **Playback**
   - Click "Play" to start playlist
   - Video plays in embedded player
   - Auto-advances to next item when finished
   - Users can continue adding items during playback

4. **Management**
   - Skip unwanted videos
   - Delete items from queue
   - Restart playlist from any position
   - Pop out video for fullscreen karaoke experience

5. **Mobile Integration** (if implemented)
   - Friends add videos via YouTube app to shared playlist
   - Application detects new additions
   - New videos appear in queue automatically

## Suggested Features & Enhancements

### Priority Features
- [ ] Save/load playlist sessions
- [ ] Search history
- [ ] Recently played list
- [ ] Keyboard shortcuts (Space for play/pause, N for next, etc.)
- [ ] Volume control and mute
- [ ] Dark/light theme

### Nice-to-Have Features
- [ ] Drag-and-drop playlist reordering
- [ ] Duplicate detection
- [ ] Playlist shuffle mode
- [ ] Video quality selection
- [ ] Lyrics overlay (using third-party lyrics API)
- [ ] Multiple playlist tabs
- [ ] Export playlist to YouTube
- [ ] Background music during search/idle state

## Development Approach

### Phase 1: Core MVP
1. Set up Electron + React + Node.js project structure
2. Implement YouTube search functionality
3. Build basic playlist queue (add, display, remove)
4. Integrate YouTube player
5. Implement auto-advance logic

### Phase 2: Enhanced Playback
1. Add skip and delete controls
2. Implement re-cue from any position
3. Build pop-out/undock functionality
4. Add player controls (play/pause, volume)

### Phase 3: YouTube Playlist Integration
1. Implement YouTube authentication
2. Build playlist sync service
3. Add polling mechanism for new items
4. Test with multiple users adding content

### Phase 4: Polish & UX
1. Improve UI/UX design
2. Add keyboard shortcuts
3. Implement save/load functionality
4. Performance optimization
5. Error handling and edge cases

## Technical Challenges & Solutions

### Challenge 1: YouTube Playlist Sync
**Problem**: YouTube playlists don't notify of new additions
**Solution**: Poll YouTube Data API every 10-30 seconds for updates when playlist is active

### Challenge 2: Playback Interruption
**Problem**: Adding items might cause UI jitter
**Solution**: Use React state management (Context or Redux) to update queue without affecting player component

### Challenge 3: Pop-out Window State
**Problem**: Keeping player state synchronized between windows
**Solution**: Use Electron IPC for communication between main window and pop-out window

### Challenge 4: API Quota Limits
**Problem**: YouTube Data API has daily quota limits
**Solution**: 
- Implement caching for search results
- Batch API calls where possible
- Inform users of quota limitations
- Provide manual refresh option instead of continuous polling

## Testing Considerations
- Test auto-advance with various video lengths
- Verify playlist behavior when items are added during playback
- Test pop-out window across different screen configurations
- Verify YouTube API error handling
- Test with API quota exceeded scenario
- Check memory leaks with long-running playlists

## Deliverables
1. Fully functional desktop application (.exe installer for Windows)
2. Source code with clear documentation
3. README with setup instructions
4. User guide for application features
5. API key configuration guide

## Getting Started Prompt

When ready to begin development, use this prompt:

"I need help building a Windows desktop application using Electron, React (ES6), and Node.js. The application is a karaoke-style playlist manager for YouTube videos. 

Start by:
1. Setting up the Electron + React project structure with necessary dependencies
2. Configuring the YouTube Data API v3 integration
3. Creating the basic React component hierarchy for the search interface and playlist queue
4. Implementing the YouTube IFrame Player API for video playback

The core functionality needed is:
- YouTube search with results display
- Playlist queue that accepts additions during playback
- Auto-advance to next video
- Skip and delete controls
- Pop-out video player window
- Optional: Sync with external YouTube playlist to detect mobile additions

Please help me build this step by step, starting with the project setup and basic structure."

## Additional Resources
- Electron Documentation: https://www.electronjs.org/docs
- YouTube Data API: https://developers.google.com/youtube/v3
- YouTube IFrame Player API: https://developers.google.com/youtube/iframe_api_reference
- React Documentation: https://react.dev
