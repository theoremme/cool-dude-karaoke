import React, { useState } from 'react';
import { PlaylistProvider } from './contexts/PlaylistContext';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import VideoPlayer from './components/VideoPlayer';
import PlaylistQueue from './components/PlaylistQueue';
import PlaylistSync from './components/PlaylistSync';
import logo from './assets/cool-dude-karaoke-logo-v2.png';
import './styles/App.css';

const AppContent = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (query) => {
    setLoading(true);
    setError(null);
    setResults([]);

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

  return (
    <div className="app">
      <header className="app-header">
        <img src={logo} alt="Cool Dude Karaoke" className="app-logo" />
      </header>

      <div className="app-body">
        {/* Left panel: Player + Search */}
        <div className="panel-left">
          <VideoPlayer />
          <div className="search-section">
            <SearchBar onSearch={handleSearch} loading={loading} />
            {error && <div className="error-message">{error}</div>}
            {loading && <div className="loading">Searching...</div>}
            <SearchResults results={results} />
          </div>
        </div>

        {/* Right panel: Playlist Queue + Sync */}
        <div className="panel-right">
          <PlaylistQueue />
          <PlaylistSync />
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <PlaylistProvider>
    <AppContent />
  </PlaylistProvider>
);

export default App;
