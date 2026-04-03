/**
 * API Key Manager
 *
 * Abstraction layer for API key management.
 * v1.0: Returns embedded key only
 * v1.1: Will support user-provided keys with zero changes to API calls
 */

const { YOUTUBE_CONFIG } = require('../config/youtube.config');

class ApiKeyManager {
  constructor() {
    this.cachedKey = null;
  }

  /**
   * Get the active API key.
   * v1.0: Always returns embedded key.
   * v1.1: Will check for user-provided key first, fall back to embedded.
   */
  async getKey() {
    return YOUTUBE_CONFIG.DEFAULT_API_KEY;

    /* v1.1 Implementation:
    const userKey = await this.getUserProvidedKey();
    if (userKey) return userKey;
    return YOUTUBE_CONFIG.DEFAULT_API_KEY;
    */
  }

  /**
   * Check if using the default embedded key.
   */
  async isUsingDefaultKey() {
    return true;

    /* v1.1:
    const userKey = await this.getUserProvidedKey();
    return !userKey;
    */
  }

  /**
   * Validate an API key by making a lightweight test call.
   */
  async validateKey(apiKey) {
    const axios = require('axios');
    try {
      await axios.get(`${YOUTUBE_CONFIG.API_BASE}/search`, {
        params: { part: 'snippet', q: 'test', maxResults: 1, key: apiKey },
      });
      return { valid: true };
    } catch (error) {
      const msg = error.response?.data?.error?.message || error.message;
      return { valid: false, error: msg };
    }
  }

  // ============================================
  // FUTURE METHODS (Stubbed for v1.1)
  // ============================================

  async getUserProvidedKey() {
    return null;

    /* v1.1:
    try {
      const encryptedKey = localStorage.getItem(YOUTUBE_CONFIG.STORAGE_KEY_USER_API_KEY);
      if (!encryptedKey) return null;
      return await this.decrypt(encryptedKey);
    } catch (error) {
      console.error('Error reading user API key:', error);
      return null;
    }
    */
  }

  async setUserProvidedKey(apiKey) {
    throw new Error('Custom API keys not yet supported');

    /* v1.1:
    const validation = await this.validateKey(apiKey);
    if (!validation.valid) throw new Error(validation.error);
    const encryptedKey = await this.encrypt(apiKey);
    localStorage.setItem(YOUTUBE_CONFIG.STORAGE_KEY_USER_API_KEY, encryptedKey);
    localStorage.setItem(YOUTUBE_CONFIG.STORAGE_KEY_API_MODE, 'custom');
    this.cachedKey = apiKey;
    return { success: true };
    */
  }

  async clearUserProvidedKey() {
    /* v1.1:
    localStorage.removeItem(YOUTUBE_CONFIG.STORAGE_KEY_USER_API_KEY);
    localStorage.setItem(YOUTUBE_CONFIG.STORAGE_KEY_API_MODE, 'default');
    this.cachedKey = null;
    */
  }

  async encrypt(value) { return value; }
  async decrypt(value) { return value; }
}

const apiKeyManager = new ApiKeyManager();
module.exports = { apiKeyManager };
