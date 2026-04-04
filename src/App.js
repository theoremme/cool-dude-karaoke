import React, { useState } from 'react';
import { PlaylistProvider } from './contexts/PlaylistContext';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import VibeSuggestions from './components/VibeSuggestions';
import VideoPlayer from './components/VideoPlayer';
import PlaylistQueue from './components/PlaylistQueue';
import PlaylistSync from './components/PlaylistSync';
import Settings from './components/Settings';
import logo from './assets/cool-dude-karaoke-logo-v2.png';
import './styles/App.css';

const AppContent = () => {
  const [results, setResults] = useState([]);
  const [vibeSuggestions, setVibeSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vibeLoading, setVibeLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vibeTheme, setVibeTheme] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSearch = async (query) => {
    setLoading(true);
    setError(null);
    setResults([]);
    setVibeSuggestions([]);
    setVibeTheme(null);

    try {
      const response = await window.api.searchYouTube(query);
      if (response.success) {
        setResults(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to search YouTube. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVibe = async (theme) => {
    setVibeLoading(true);
    setError(null);
    setResults([]);
    setVibeSuggestions([]);
    setVibeTheme(theme);

    try {
      const response = await window.api.vibeGenerate(theme);
      if (response.success) {
        setVibeSuggestions(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to generate playlist. Check your Anthropic API key in Settings.');
    } finally {
      setVibeLoading(false);
    }
  };

  const [loadingMore, setLoadingMore] = useState(false);

  const handleRequestMore = async () => {
    if (!vibeTheme) return;
    setLoadingMore(true);
    setError(null);

    try {
      // Build exclusion list from existing suggestions
      const existingTitles = vibeSuggestions.map(
        (s) => `${s.title} by ${s.artist}`
      );
      const moreTheme = `${vibeTheme}\n\nDo NOT include any of these songs (already suggested):\n${existingTitles.join('\n')}`;

      const response = await window.api.vibeGenerate(moreTheme);
      if (response.success) {
        // Deduplicate by title+artist
        const existing = new Set(
          vibeSuggestions.map((s) => `${s.title}|||${s.artist}`.toLowerCase())
        );
        const unique = response.data.filter(
          (s) => !existing.has(`${s.title}|||${s.artist}`.toLowerCase())
        );
        setVibeSuggestions((prev) => [...prev, ...unique]);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to generate more suggestions.');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <img src={logo} alt="Cool Dude Karaoke" className="app-logo" />
        <button
          className="btn-settings"
          onClick={() => setSettingsOpen(true)}
          title="Settings"
        >
          &#9881;
        </button>
      </header>

      <div className="app-body">
        <div className="panel-left">
          <VideoPlayer />
          <div className="search-section">
            <SearchBar
              onSearch={handleSearch}
              onVibe={handleVibe}
              loading={loading}
              vibeLoading={vibeLoading}
            />
            {error && <div className="error-message">{error}</div>}
            {loading && <div className="loading">Searching...</div>}
            {vibeLoading && (
              <div className="loading">
                ✦ Generating "{vibeTheme}" playlist...
              </div>
            )}
            {vibeSuggestions.length > 0 && (
              <VibeSuggestions
                theme={vibeTheme}
                suggestions={vibeSuggestions}
                onRequestMore={handleRequestMore}
                loadingMore={loadingMore}
              />
            )}
            <SearchResults results={results} />
          </div>
        </div>

        <div className="panel-right">
          <PlaylistQueue />
          <PlaylistSync />
        </div>
      </div>

      <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

const App = () => (
  <PlaylistProvider>
    <AppContent />
  </PlaylistProvider>
);

export default App;
