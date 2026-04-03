import React, { useState, useEffect, useCallback } from 'react';

const Settings = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Load current status on open
  useEffect(() => {
    if (isOpen) {
      loadStatus();
      setApiKey('');
      setMessage(null);
    }
  }, [isOpen]);

  const loadStatus = async () => {
    const result = await window.api.apikeyGetStatus();
    setStatus(result);
  };

  const handleSave = useCallback(async () => {
    if (!apiKey.trim()) return;
    setSaving(true);
    setMessage(null);

    const result = await window.api.apikeySet(apiKey.trim());
    if (result.success) {
      setMessage({ type: 'success', text: 'API key validated and saved!' });
      setApiKey('');
      loadStatus();
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    setSaving(false);
  }, [apiKey]);

  const handleClear = useCallback(async () => {
    await window.api.apikeyClear();
    setMessage({ type: 'success', text: 'Reverted to default API key.' });
    setApiKey('');
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
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                disabled={saving}
              />
              <button
                className="btn-neon btn-small"
                onClick={handleSave}
                disabled={saving || !apiKey.trim()}
              >
                {saving ? 'Validating...' : 'Save'}
              </button>
            </div>

            {status?.isUsingCustomKey && (
              <button
                className="btn-neon btn-small btn-danger settings-reset"
                onClick={handleClear}
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
        </div>
      </div>
    </div>
  );
};

export default Settings;
