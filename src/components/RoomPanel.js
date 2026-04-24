import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return name;
  return parts.map((p) => p[0]).join('').toUpperCase();
};

const RoomPanel = ({ room, members, currentUserId }) => {
  const [flipped, setFlipped] = useState(false);
  const qrRef = useRef(null);
  const flipperRef = useRef(null);
  const [displayMode, setDisplayMode] = useState('full'); // 'full' | 'compact' | 'count-only'

  const joinUrl = `https://www.cooldudekaraoke.com/room/${room.inviteCode}`;
  const activeCount = members.length;

  // Watch flipper size to decide what to show in posse
  useEffect(() => {
    const el = flipperRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      if (width < 90) {
        setDisplayMode('count-only');
      } else if (width < 150) {
        setDisplayMode('compact');
      } else {
        setDisplayMode('full');
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeFull = (dateStr) => {
    const d = new Date(dateStr);
    return `Joined ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="qr-code-section">
      <div className="qr-code-container">
        <h3 className="qr-title">Get in, loser.</h3>
        <p className="qr-subtitle">You're up next.</p>

        <div className={`qr-flipper ${flipped ? 'qr-flipped' : ''}`} ref={flipperRef}>
          {/* Front: QR code */}
          <div className="qr-flip-front">
            <div className="qr-code-wrapper" ref={qrRef}>
              <QRCodeCanvas
                value={joinUrl}
                size={128}
                level="H"
                includeMargin={true}
                bgColor="#0d1117"
                fgColor="#00ffff"
              />
            </div>
          </div>

          {/* Back: Posse list */}
          <div className="qr-flip-back">
            <h3 className="guest-overlay-title">Posse ({activeCount})</h3>
            {displayMode !== 'count-only' && (
              <div className="guest-overlay-list">
                {members.map((m) => {
                  const isYou = currentUserId && m.userId === currentUserId;
                  const rawName = isYou ? 'You' : (m.guestName || 'Guest');
                  const displayName = rawName === 'You' ? 'You' : (rawName.trim().split(/\s+/).length > 1 ? getInitials(rawName) : rawName);
                  return (
                    <div key={m.id} className="guest-panel-item">
                      <span className="guest-panel-name" title={rawName}>{displayName}</span>
                      {displayMode === 'full' && (
                        <span className="guest-panel-time" title={formatTimeFull(m.joinedAt)}>{formatTime(m.joinedAt)}</span>
                      )}
                    </div>
                  );
                })}
                {members.length === 0 && (
                  <div style={{ color: '#666', fontSize: 12, fontStyle: 'italic' }}>
                    No guests yet
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="qr-info">
          <p className="qr-scan-label">Scan to join</p>
          <p className="qr-room-name" style={{ textTransform: 'uppercase', fontWeight: 700 }}>{room.name}</p>
          <p className="qr-invite-code">Code: <span>{room.inviteCode}</span></p>
        </div>

        <div className="qr-actions">
          <button className="btn-neon btn-small" onClick={copyLink}>Copy Link</button>
          {members.length > 0 && (
            <button className="btn-neon btn-small guest-toggle-btn" onClick={() => setFlipped(!flipped)}>
              {flipped ? '◈ QR Code' : `◈ Posse (${activeCount})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomPanel;
