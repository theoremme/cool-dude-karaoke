import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const RoomPanel = ({ room, members }) => {
  const [flipped, setFlipped] = useState(false);
  const qrRef = useRef(null);

  const joinUrl = `https://cool-dude-karaoke-web-production.up.railway.app/room/${room.inviteCode}`;
  const activeCount = members.length;

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `karaoke-room-${room.inviteCode}.png`;
    link.href = url;
    link.click();
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="qr-code-section">
      <div className="qr-code-container">
        <h3 className="qr-title">Get in, loser.</h3>
        <p className="qr-subtitle">You're up next.</p>

        <div className={`qr-flipper ${flipped ? 'qr-flipped' : ''}`}>
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
            <div className="guest-overlay-list">
              {members.map((m) => (
                <div key={m.id} className="guest-panel-item">
                  <span className="guest-panel-name">{m.guestName || 'Host'}</span>
                  <span className="guest-panel-time">joined {formatTime(m.joinedAt)}</span>
                </div>
              ))}
              {members.length === 0 && (
                <div style={{ color: '#666', fontSize: 12, fontStyle: 'italic' }}>
                  No guests yet
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="qr-info">
          <p className="qr-scan-label">Scan to join</p>
          <p className="qr-room-name" style={{ textTransform: 'uppercase', fontWeight: 700 }}>{room.name}</p>
          <p className="qr-invite-code">Code: <span>{room.inviteCode}</span></p>
        </div>

        <div className="qr-actions">
          <button className="btn-neon btn-small" onClick={copyLink}>Copy Link</button>
          <button className="btn-neon btn-small" onClick={downloadQR}>Download QR</button>
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
