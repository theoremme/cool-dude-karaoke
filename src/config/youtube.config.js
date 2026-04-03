/**
 * YouTube API Configuration
 *
 * v1.0: Uses embedded developer API key (from .env)
 * Future: Will support user-provided keys
 */

const YOUTUBE_CONFIG = {
  // Default embedded API key (loaded from .env in main process)
  DEFAULT_API_KEY: process.env.YOUTUBE_API_KEY,

  // API base URL
  API_BASE: 'https://www.googleapis.com/youtube/v3',

  // API quota settings
  DAILY_QUOTA_LIMIT: 10000,
  QUOTA_WARNING_THRESHOLD: 0.80,
  QUOTA_CRITICAL_THRESHOLD: 0.90,
  QUOTA_PAUSE_THRESHOLD: 0.95,

  // Quota costs per operation
  QUOTA_COST_SEARCH: 100,
  QUOTA_COST_LIST: 1,

  // Polling intervals (in milliseconds)
  POLLING_INTERVAL_ACTIVE: 5000,
  POLLING_INTERVAL_PAUSED: 30000,
  IDLE_TIMEOUT: 300000, // 5 minutes

  // Storage keys (for v1.1)
  STORAGE_KEY_USER_API_KEY: 'user_youtube_api_key',
  STORAGE_KEY_API_MODE: 'api_key_mode',
};

module.exports = { YOUTUBE_CONFIG };
