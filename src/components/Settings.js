import React, { useState, useEffect, useCallback } from 'react';

const Settings = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [status, setStatus] = useState(null);
  const [vibePrompt, setVibePrompt] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [anthropicMessage, setAnthropicMessage] = useState(null);
  const [vibeMessage, setVibeMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      loadVibePrompt();
      setApiKey('');
      setAnthropicKey('');
      setMessage(null);
      setAnthropicMessage(null);
      setVibeMessage(null);
    }
  }, [isOpen]);

  const loadVibePrompt = async () => {
    const result = await window.api.vibePromptGet();
    setVibePrompt(result.prompt || '');
  };

  const loadStatus = async () => {
    const result = await window.api.apikeyGetStatus();
    setStatus(result);
  };

  // --- YouTube API Key ---

  const handleSaveYouTube = useCallback(async () => {
    if (!apiKey.trim()) return;
    setSaving(true);
    setMessage(null);

    const result = await window.api.apikeySet(apiKey.trim());
    if (result.success) {
      setMessage({ type: 'success', text: 'YouTube API key validated and saved!' });
      setApiKey('');
      loadStatus();
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    setSaving(false);
  }, [apiKey]);

  const handleClearYouTube = useCallback(async () => {
    await window.api.apikeyClear();
    setMessage({ type: 'success', text: 'Reverted to default YouTube API key.' });
    setApiKey('');
    loadStatus();
  }, []);

  // --- Anthropic API Key ---

  const handleSaveAnthropic = useCallback(async () => {
    if (!anthropicKey.trim()) return;
    setAnthropicMessage(null);

    await window.api.anthropicKeySet(anthropicKey.trim());
    setAnthropicMessage({ type: 'success', text: 'Anthropic API key saved!' });
    setAnthropicKey('');
    loadStatus();
  }, [anthropicKey]);

  const handleClearAnthropic = useCallback(async () => {
    await window.api.anthropicKeyClear();
    setAnthropicMessage({ type: 'success', text: 'Anthropic API key removed.' });
    setAnthropicKey('');
    loadStatus();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        <div className="settings-body">
          {/* YouTube API Key */}
          <div className="settings-section">
            <h3>YouTube API Key</h3>
            <p className="settings-description">
              Use your own YouTube API key for higher quota limits.
              Get one free at{' '}
              <span className="settings-link">console.cloud.google.com</span>
            </p>

            <div className="settings-status">
              <span className={`status-dot ${status?.isUsingCustomKey ? 'status-custom' : 'status-default'}`} />
              <span>
                {status?.isUsingCustomKey
                  ? `Using custom key: ${status.maskedKey}`
                  : 'Using default (built-in) key'}
              </span>
            </div>

            <div className="settings-input-row">
              <input
                type="text"
                className="settings-input"
                placeholder="Paste your YouTube API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveYouTube()}
                disabled={saving}
              />
              <button
                className="btn-neon btn-small"
                onClick={handleSaveYouTube}
                disabled={saving || !apiKey.trim()}
              >
                {saving ? 'Validating...' : 'Save'}
              </button>
            </div>

            {status?.isUsingCustomKey && (
              <button
                className="btn-neon btn-small btn-danger settings-reset"
                onClick={handleClearYouTube}
              >
                Reset to Default Key
              </button>
            )}

            {message && (
              <div className={`settings-message settings-message-${message.type}`}>
                {message.text}
              </div>
            )}
          </div>

          {/* Anthropic API Key */}
          <div className="settings-section settings-section-divider">
            <h3>Anthropic API Key <span className="settings-badge">✦ Vibe</span></h3>
            <p className="settings-description">
              Required for AI-powered playlist generation. The "✦ Vibe" button
              uses Claude to suggest songs matching a theme.
              Get a key at{' '}
              <span className="settings-link">console.anthropic.com</span>
            </p>

            <div className="settings-status">
              <span className={`status-dot ${status?.hasAnthropicKey ? 'status-custom' : 'status-default'}`} />
              <span>
                {status?.hasAnthropicKey
                  ? `Key set: ${status.maskedAnthropicKey}`
                  : 'Not configured'}
              </span>
            </div>

            <div className="settings-input-row">
              <input
                type="text"
                className="settings-input"
                placeholder="Paste your Anthropic API key..."
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveAnthropic()}
              />
              <button
                className="btn-neon btn-small"
                onClick={handleSaveAnthropic}
                disabled={!anthropicKey.trim()}
              >
                Save
              </button>
            </div>

            {status?.hasAnthropicKey && (
              <button
                className="btn-neon btn-small btn-danger settings-reset"
                onClick={handleClearAnthropic}
              >
                Remove Key
              </button>
            )}

            {anthropicMessage && (
              <div className={`settings-message settings-message-${anthropicMessage.type}`}>
                {anthropicMessage.text}
              </div>
            )}
          </div>

          {/* Custom Vibe Prompt */}
          <div className="settings-section settings-section-divider">
            <h3>Custom Vibe Prompt <span className="settings-badge">✦ Vibe</span></h3>
            <p className="settings-description">
              Customize the AI prompt used for playlist generation.
              Use <code>{'{{THEME}}'}</code> as a placeholder for the user's input.
              Must instruct Claude to return a JSON array of {'{title, artist}'} objects.
            </p>

            <textarea
              className="settings-textarea"
              placeholder="Leave empty to use the default prompt..."
              value={vibePrompt}
              onChange={(e) => setVibePrompt(e.target.value)}
              rows={6}
            />

            <div className="settings-input-row">
              <button
                className="btn-neon btn-small"
                onClick={async () => {
                  if (vibePrompt.trim()) {
                    await window.api.vibePromptSet(vibePrompt.trim());
                    setVibeMessage({ type: 'success', text: 'Custom prompt saved!' });
                  }
                }}
                disabled={!vibePrompt.trim()}
              >
                Save Prompt
              </button>
              {status?.hasCustomVibePrompt && (
                <button
                  className="btn-neon btn-small btn-danger"
                  onClick={async () => {
                    await window.api.vibePromptClear();
                    setVibePrompt('');
                    setVibeMessage({ type: 'success', text: 'Reverted to default prompt.' });
                    loadStatus();
                  }}
                >
                  Reset to Default
                </button>
              )}
            </div>

            {vibeMessage && (
              <div className={`settings-message settings-message-${vibeMessage.type}`}>
                {vibeMessage.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
