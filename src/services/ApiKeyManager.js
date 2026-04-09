/**
 * API Key Manager (v1.1)
 *
 * Abstraction layer for API key management.
 * Checks for user-provided key first, falls back to embedded default.
 * Persists user key in a JSON file in the app's user data directory.
 */

const { YOUTUBE_CONFIG } = require('../config/youtube.config');
const { app } = require('electron');
const path = require('path');
const fs = require('fs');

function getSettingsPath() {
  return path.join(app.getPath('userData'), 'api-settings.json');
}

function readSettings() {
  try {
    const data = fs.readFileSync(getSettingsPath(), 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

function writeSettings(settings) {
  fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2));
}

class ApiKeyManager {
  constructor() {
    this.cachedKey = null;
  }

  /**
   * Get the active API key.
   * Returns user-provided key if set, otherwise embedded default.
   */
  async getKey() {
    const userKey = this.getUserProvidedKey();
    if (userKey) return userKey;
    return YOUTUBE_CONFIG.DEFAULT_API_KEY;
  }

  /**
   * Check if using the default embedded key.
   */
  async isUsingDefaultKey() {
    return !this.getUserProvidedKey();
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

  /**
   * Get user-provided API key from storage.
   */
  getUserProvidedKey() {
    const settings = readSettings();
    return settings.userApiKey || null;
  }

  /**
   * Validate and save a user-provided API key.
   */
  async setUserProvidedKey(apiKey) {
    const validation = await this.validateKey(apiKey);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    const settings = readSettings();
    settings.userApiKey = apiKey;
    writeSettings(settings);
    this.cachedKey = apiKey;
    return { success: true };
  }

  /**
   * Clear user-provided key and revert to default.
   */
  clearUserProvidedKey() {
    const settings = readSettings();
    delete settings.userApiKey;
    writeSettings(settings);
    this.cachedKey = null;
  }

  /**
   * Get current key status info for the UI.
   */
  getKeyStatus() {
    const userKey = this.getUserProvidedKey();
    const anthropicKey = this.getAnthropicKey();
    return {
      isUsingCustomKey: !!userKey,
      maskedKey: userKey
        ? userKey.slice(0, 8) + '...' + userKey.slice(-4)
        : null,
      hasAnthropicKey: !!anthropicKey,
      maskedAnthropicKey: anthropicKey
        ? anthropicKey.slice(0, 10) + '...' + anthropicKey.slice(-4)
        : null,
      hasCustomVibePrompt: !!this.getVibePrompt(),
    };
  }

  // --- Anthropic API Key ---

  getAnthropicKey() {
    const settings = readSettings();
    return settings.anthropicApiKey || process.env.ANTHROPIC_API_KEY || null;
  }

  setAnthropicKey(apiKey) {
    const settings = readSettings();
    settings.anthropicApiKey = apiKey;
    writeSettings(settings);
  }

  clearAnthropicKey() {
    const settings = readSettings();
    delete settings.anthropicApiKey;
    writeSettings(settings);
  }

  // --- Custom Vibe Prompt ---

  getVibePrompt() {
    const settings = readSettings();
    return settings.vibePrompt || null;
  }

  setVibePrompt(prompt) {
    const settings = readSettings();
    settings.vibePrompt = prompt;
    writeSettings(settings);
  }

  clearVibePrompt() {
    const settings = readSettings();
    delete settings.vibePrompt;
    writeSettings(settings);
  }

  // --- Backend URL ---

  getBackendUrl() {
    const settings = readSettings();
    return settings.backendUrl || 'https://cool-dude-karaoke-web-production.up.railway.app';
  }

  setBackendUrl(url) {
    const settings = readSettings();
    settings.backendUrl = url;
    writeSettings(settings);
  }

  clearBackendUrl() {
    const settings = readSettings();
    delete settings.backendUrl;
    writeSettings(settings);
  }

  // --- Auth Token ---

  getAuthToken() {
    const settings = readSettings();
    return settings.authToken || null;
  }

  setAuthToken(token) {
    const settings = readSettings();
    settings.authToken = token;
    writeSettings(settings);
  }

  clearAuthToken() {
    const settings = readSettings();
    delete settings.authToken;
    writeSettings(settings);
  }

  // --- Session data (roomId, memberId for crash recovery) ---

  getSession() {
    const settings = readSettings();
    return settings.session || null;
  }

  setSession(session) {
    const settings = readSettings();
    settings.session = session;
    writeSettings(settings);
  }

  clearSession() {
    const settings = readSettings();
    delete settings.session;
    writeSettings(settings);
  }
}

const apiKeyManager = new ApiKeyManager();
module.exports = { apiKeyManager };
