# API Key Architecture - Pluggable Design for Future Expansion

## 🎯 Goal
Build v1.0 with embedded API key, but architect it so adding user-provided keys later requires **minimal changes** (no retrofitting, no refactoring).

---

## 🏗️ Architecture Pattern: Strategy Pattern + Abstraction Layer

### The Key Principle
**Never access the API key directly**. Always go through an abstraction layer.

### Bad (Hard to Change Later):
```javascript
// DON'T DO THIS - API key hardcoded everywhere
async function searchVideos(query) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?q=${query}&key=AIzaSyC...`
  );
  return response.json();
}

async function getPlaylistItems(playlistId) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&key=AIzaSyC...`
  );
  return response.json();
}
```

**Problem**: When you want to add user keys, you have to find and change every API call.

### Good (Easy to Extend):
```javascript
// DO THIS - Single point of access
import { apiKeyManager } from './services/ApiKeyManager';

async function searchVideos(query) {
  const apiKey = await apiKeyManager.getKey();
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?q=${query}&key=${apiKey}`
  );
  return response.json();
}

async function getPlaylistItems(playlistId) {
  const apiKey = await apiKeyManager.getKey();
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&key=${apiKey}`
  );
  return response.json();
}
```

**Benefit**: When you want to add user keys, you only change `ApiKeyManager.js`. All your API calls stay the same.

---

## 📁 File Structure for v1.0

```
src/
├── services/
│   ├── ApiKeyManager.js          ← The abstraction layer
│   ├── YouTubeService.js          ← All YouTube API calls
│   └── PlaylistSyncService.js     ← Playlist polling logic
├── config/
│   └── youtube.config.js          ← API key and settings
└── components/
    └── ... (your React components)
```

---

## 📄 Implementation Files for v1.0

### File 1: `src/config/youtube.config.js`
```javascript
/**
 * YouTube API Configuration
 * 
 * v1.0: Uses embedded developer API key
 * Future: Will support user-provided keys
 */

export const YOUTUBE_CONFIG = {
  // Default embedded API key (developer's key)
  DEFAULT_API_KEY: 'AIzaSyC...your-actual-key-here',
  
  // API quota settings
  DAILY_QUOTA_LIMIT: 10000,
  QUOTA_WARNING_THRESHOLD: 0.80,  // 80%
  QUOTA_CRITICAL_THRESHOLD: 0.95, // 95%
  
  // Polling intervals (in seconds)
  POLLING_INTERVAL_ACTIVE: 5,
  POLLING_INTERVAL_PAUSED: 30,
  POLLING_INTERVAL_IDLE: 0, // 0 = stopped
  
  // Storage keys (for future use)
  STORAGE_KEY_USER_API_KEY: 'user_youtube_api_key',
  STORAGE_KEY_API_MODE: 'api_key_mode', // 'default' or 'custom'
};
```

### File 2: `src/services/ApiKeyManager.js`
```javascript
/**
 * API Key Manager
 * 
 * Abstraction layer for API key management.
 * v1.0: Returns embedded key only
 * v1.1: Will support user-provided keys with zero changes to API calls
 */

import { YOUTUBE_CONFIG } from '../config/youtube.config';

class ApiKeyManager {
  constructor() {
    this.cachedKey = null;
  }

  /**
   * Get the active API key
   * 
   * v1.0: Always returns embedded key
   * v1.1: Will check for user-provided key first, fall back to embedded
   * 
   * @returns {Promise<string>} The API key to use
   */
  async getKey() {
    // v1.0 Implementation: Just return the embedded key
    return YOUTUBE_CONFIG.DEFAULT_API_KEY;
    
    /* v1.1 Implementation (commented out for now):
    
    // Check if user has provided their own key
    const userKey = await this.getUserProvidedKey();
    if (userKey) {
      return userKey;
    }
    
    // Fall back to embedded key
    return YOUTUBE_CONFIG.DEFAULT_API_KEY;
    */
  }

  /**
   * Check if using the default embedded key
   * Used for showing quota warnings
   * 
   * @returns {Promise<boolean>} True if using default key
   */
  async isUsingDefaultKey() {
    // v1.0: Always true
    return true;
    
    /* v1.1:
    const userKey = await this.getUserProvidedKey();
    return !userKey;
    */
  }

  /**
   * Validate an API key by making a test call
   * 
   * @param {string} apiKey - The key to validate
   * @returns {Promise<{valid: boolean, error?: string}>}
   */
  async validateKey(apiKey) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&maxResults=1&key=${apiKey}`
      );
      
      if (response.ok) {
        return { valid: true };
      } else {
        const error = await response.json();
        return { 
          valid: false, 
          error: error.error?.message || 'Invalid API key or quota exceeded' 
        };
      }
    } catch (error) {
      return { 
        valid: false, 
        error: error.message 
      };
    }
  }

  // ============================================
  // FUTURE METHODS (Stubbed for v1.1)
  // ============================================

  /**
   * Get user-provided API key from storage
   * v1.0: Not implemented (returns null)
   * v1.1: Will read from secure storage
   */
  async getUserProvidedKey() {
    // v1.0: Not implemented
    return null;
    
    /* v1.1 Implementation:
    try {
      // Read from electron-store or encrypted localStorage
      const encryptedKey = localStorage.getItem(YOUTUBE_CONFIG.STORAGE_KEY_USER_API_KEY);
      if (!encryptedKey) return null;
      
      // Decrypt and return
      const decryptedKey = await this.decrypt(encryptedKey);
      return decryptedKey;
    } catch (error) {
      console.error('Error reading user API key:', error);
      return null;
    }
    */
  }

  /**
   * Set user-provided API key
   * v1.0: Not implemented
   * v1.1: Will validate and store the key
   */
  async setUserProvidedKey(apiKey) {
    // v1.0: Not implemented
    throw new Error('Custom API keys not yet supported');
    
    /* v1.1 Implementation:
    // Validate the key first
    const validation = await this.validateKey(apiKey);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // Encrypt and store
    const encryptedKey = await this.encrypt(apiKey);
    localStorage.setItem(YOUTUBE_CONFIG.STORAGE_KEY_USER_API_KEY, encryptedKey);
    localStorage.setItem(YOUTUBE_CONFIG.STORAGE_KEY_API_MODE, 'custom');
    
    this.cachedKey = apiKey;
    return { success: true };
    */
  }

  /**
   * Clear user-provided key and revert to default
   * v1.0: Not implemented
   * v1.1: Will remove stored key
   */
  async clearUserProvidedKey() {
    // v1.0: Not implemented
    
    /* v1.1 Implementation:
    localStorage.removeItem(YOUTUBE_CONFIG.STORAGE_KEY_USER_API_KEY);
    localStorage.setItem(YOUTUBE_CONFIG.STORAGE_KEY_API_MODE, 'default');
    this.cachedKey = null;
    */
  }

  /**
   * Encrypt API key for storage (placeholder)
   * v1.1: Implement actual encryption
   */
  async encrypt(value) {
    // v1.1: Use crypto library or electron safeStorage
    return value; // Placeholder
  }

  /**
   * Decrypt API key from storage (placeholder)
   * v1.1: Implement actual decryption
   */
  async decrypt(value) {
    // v1.1: Use crypto library or electron safeStorage
    return value; // Placeholder
  }
}

// Export singleton instance
export const apiKeyManager = new ApiKeyManager();
```

### File 3: `src/services/YouTubeService.js`
```javascript
/**
 * YouTube API Service
 * 
 * All YouTube API calls go through this service.
 * Uses ApiKeyManager for key retrieval - no hardcoded keys!
 */

import { apiKeyManager } from './ApiKeyManager';
import { YOUTUBE_CONFIG } from '../config/youtube.config';

class YouTubeService {
  constructor() {
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
    this.quotaUsedToday = 0;
  }

  /**
   * Search for videos
   * 
   * @param {string} query - Search query
   * @param {number} maxResults - Number of results to return
   * @returns {Promise<Array>} Array of video results
   */
  async searchVideos(query, maxResults = 10) {
    const apiKey = await apiKeyManager.getKey(); // ← Goes through abstraction layer
    
    const url = `${this.baseUrl}/search?` + new URLSearchParams({
      part: 'snippet',
      q: query,
      maxResults: maxResults,
      type: 'video',
      key: apiKey
    });

    const response = await fetch(url);
    
    if (!response.ok) {
      await this.handleApiError(response);
    }

    const data = await response.json();
    this.quotaUsedToday += 100; // Search costs 100 units
    
    return data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelName: item.snippet.channelTitle,
    }));
  }

  /**
   * Get playlist items
   * 
   * @param {string} playlistId - YouTube playlist ID
   * @returns {Promise<Array>} Array of playlist items
   */
  async getPlaylistItems(playlistId) {
    const apiKey = await apiKeyManager.getKey(); // ← Goes through abstraction layer
    
    const url = `${this.baseUrl}/playlistItems?` + new URLSearchParams({
      part: 'snippet,contentDetails',
      playlistId: playlistId,
      maxResults: 50,
      key: apiKey
    });

    const response = await fetch(url);
    
    if (!response.ok) {
      await this.handleApiError(response);
    }

    const data = await response.json();
    this.quotaUsedToday += 1; // List costs 1 unit
    
    return data.items.map(item => ({
      videoId: item.contentDetails.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      position: item.snippet.position,
    }));
  }

  /**
   * Get quota usage information
   * 
   * @returns {Object} Quota info
   */
  getQuotaInfo() {
    const used = this.quotaUsedToday;
    const limit = YOUTUBE_CONFIG.DAILY_QUOTA_LIMIT;
    const percentage = used / limit;
    
    return {
      used,
      limit,
      percentage,
      remaining: limit - used,
      isWarning: percentage >= YOUTUBE_CONFIG.QUOTA_WARNING_THRESHOLD,
      isCritical: percentage >= YOUTUBE_CONFIG.QUOTA_CRITICAL_THRESHOLD,
    };
  }

  /**
   * Handle API errors
   */
  async handleApiError(response) {
    const error = await response.json();
    
    if (response.status === 403) {
      // Quota exceeded or invalid key
      throw new Error(`YouTube API Error: ${error.error.message}`);
    }
    
    throw new Error(`YouTube API Error: ${response.status} - ${error.error.message}`);
  }
}

// Export singleton instance
export const youtubeService = new YouTubeService();
```

### File 4: `src/services/PlaylistSyncService.js`
```javascript
/**
 * Playlist Sync Service
 * 
 * Handles polling YouTube playlists for new additions
 */

import { youtubeService } from './YouTubeService';
import { YOUTUBE_CONFIG } from '../config/youtube.config';

class PlaylistSyncService {
  constructor() {
    this.connectedPlaylistId = null;
    this.pollingInterval = null;
    this.lastKnownItems = [];
    this.currentPollingRate = YOUTUBE_CONFIG.POLLING_INTERVAL_ACTIVE;
    this.isPlaying = false;
  }

  /**
   * Connect to a YouTube playlist
   */
  async connectToPlaylist(playlistId) {
    this.connectedPlaylistId = playlistId;
    
    // Get initial items
    const items = await youtubeService.getPlaylistItems(playlistId);
    this.lastKnownItems = items;
    
    // Start polling
    this.startPolling();
    
    return items;
  }

  /**
   * Start polling for playlist changes
   */
  startPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    const pollRate = this.currentPollingRate * 1000; // Convert to ms
    
    this.pollingInterval = setInterval(async () => {
      await this.checkForUpdates();
    }, pollRate);
  }

  /**
   * Check for new items in the playlist
   */
  async checkForUpdates() {
    if (!this.connectedPlaylistId) return;

    try {
      const currentItems = await youtubeService.getPlaylistItems(this.connectedPlaylistId);
      
      // Compare with last known items
      const newItems = this.findNewItems(currentItems, this.lastKnownItems);
      
      if (newItems.length > 0) {
        this.onNewItemsDetected(newItems);
      }
      
      this.lastKnownItems = currentItems;
    } catch (error) {
      console.error('Error checking for playlist updates:', error);
      // Handle quota errors gracefully
      if (error.message.includes('quota')) {
        this.stopPolling();
        this.onQuotaExceeded();
      }
    }
  }

  /**
   * Find items that are new
   */
  findNewItems(currentItems, lastKnownItems) {
    const lastKnownIds = new Set(lastKnownItems.map(item => item.videoId));
    return currentItems.filter(item => !lastKnownIds.has(item.videoId));
  }

  /**
   * Update polling rate based on playback state
   */
  setPlaybackState(isPlaying) {
    this.isPlaying = isPlaying;
    
    if (isPlaying) {
      this.currentPollingRate = YOUTUBE_CONFIG.POLLING_INTERVAL_ACTIVE;
    } else {
      this.currentPollingRate = YOUTUBE_CONFIG.POLLING_INTERVAL_PAUSED;
    }
    
    // Restart polling with new rate
    if (this.pollingInterval) {
      this.startPolling();
    }
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Disconnect from playlist
   */
  disconnect() {
    this.stopPolling();
    this.connectedPlaylistId = null;
    this.lastKnownItems = [];
  }

  /**
   * Callbacks (to be set by components)
   */
  onNewItemsDetected(newItems) {
    // Override this in your React component
    console.log('New items detected:', newItems);
  }

  onQuotaExceeded() {
    // Override this in your React component
    console.log('Quota exceeded - polling stopped');
  }
}

// Export singleton instance
export const playlistSyncService = new PlaylistSyncService();
```

---

## 🔌 How This Makes v1.1 Trivial

### When You Want to Add User-Provided Keys in v1.1:

**Step 1**: Uncomment the v1.1 code in `ApiKeyManager.js`
- Uncomment `getUserProvidedKey()`
- Uncomment `setUserProvidedKey()`
- Uncomment the logic in `getKey()`

**Step 2**: Add UI components (new files)
- `components/SetupWizard.jsx` - First-run setup
- `components/ApiKeySettings.jsx` - Settings page

**Step 3**: Add encryption (optional but recommended)
```javascript
// Install: npm install electron-store
import Store from 'electron-store';
const store = new Store({ encryptionKey: 'your-secret' });
```

**Step 4**: Done!
- **Zero changes** to `YouTubeService.js`
- **Zero changes** to `PlaylistSyncService.js`
- **Zero changes** to any API calls
- **Zero refactoring** needed

---

## 📋 Checklist for Claude During Phase 2

When you give Claude the Phase 2 prompt, include this:

```
IMPORTANT ARCHITECTURE REQUIREMENT:

The API key must be accessed through an abstraction layer, NOT hardcoded.

Create these files:
1. src/config/youtube.config.js - Configuration constants
2. src/services/ApiKeyManager.js - API key abstraction layer
3. src/services/YouTubeService.js - All YouTube API calls
4. src/services/PlaylistSyncService.js - Playlist polling logic

Requirements:
- ApiKeyManager.getKey() is the ONLY way to get the API key
- YouTubeService always calls apiKeyManager.getKey() - never accesses the key directly
- Include commented-out "v1.1" code in ApiKeyManager for future user-provided keys
- This architecture must make it trivial to add user-provided keys later

For v1.0, ApiKeyManager.getKey() should just return the embedded key from config.
```

---

## 🎯 Benefits of This Architecture

### For v1.0 (Now):
✅ Clean separation of concerns  
✅ Easy to test  
✅ All API calls in one place  
✅ Quota tracking built-in  
✅ Works immediately with embedded key

### For v1.1 (Later):
✅ Uncomment ~30 lines of code  
✅ Add 2 UI components  
✅ No refactoring needed  
✅ No risk of breaking existing code  
✅ Can ship in 2-3 hours instead of 7-11 hours

### For v2.0+ (Future):
✅ Can add OAuth authentication  
✅ Can add backend API service  
✅ Can add key rotation  
✅ Can add multi-user support  
✅ Foundation is solid and extensible

---

## 📝 Updated Phase 2 Prompt

Add this section to your Phase 2 prompt:

```markdown
API KEY ARCHITECTURE:

Please implement a pluggable API key system following this structure:

1. Config file with embedded API key and settings
2. ApiKeyManager class that abstracts key retrieval
3. YouTubeService that ONLY accesses keys via ApiKeyManager
4. Include commented-out code for future user-provided keys

The embedded key should work immediately in v1.0, but the architecture 
must make it trivial to add user-provided keys in v1.1 without refactoring.

See attached API architecture document for implementation details.
```

---

## 🚀 Summary

**What you're building in v1.0:**
- Embedded API key that works immediately
- Abstraction layer that makes future expansion trivial
- All the hooks for user-provided keys (commented out)

**What you'll build in v1.1 (when needed):**
- Uncomment existing code
- Add UI components for setup wizard
- Add settings page
- Ship in 2-3 hours

**Total time saved**: ~5-8 hours when you eventually need custom keys

**Complexity added to v1.0**: Minimal (just better organization)

This is the "wide open door" you asked for! 🚪✨
