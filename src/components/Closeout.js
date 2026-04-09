import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import logo from '../assets/cool-dude-karaoke-logo-v2-nobg.png';

const Closeout = ({ room, playlist, onBackToLobby }) => {
  const [playlistName, setPlaylistName] = useState('');
  const logoImgRef = useRef(null);

  useEffect(() => {
    setPlaylistName(`${room?.name || 'Karaoke'} - ${new Date().toLocaleDateString()}`);
  }, [room]);

  // Preload logo for PDF
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = logo;
    img.onload = () => { logoImgRef.current = img; };
  }, []);

  const formatDuration = (dur) => {
    if (!dur) return '';
    if (typeof dur === 'string' && dur.includes(':')) return dur;
    return dur;
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    // Try to load Orbitron font
    let hasOrbitron = false;
    try {
      const fontRes = await fetch(require('../assets/Orbitron-Bold.ttf'));
      const fontBuf = await fontRes.arrayBuffer();
      const fontBase64 = btoa(String.fromCharCode(...new Uint8Array(fontBuf)));
      doc.addFileToVFS('Orbitron-Bold.ttf', fontBase64);
      doc.addFont('Orbitron-Bold.ttf', 'Orbitron', 'bold');
      hasOrbitron = true;
    } catch {}

    const setOrbitron = () => {
      if (hasOrbitron) doc.setFont('Orbitron', 'bold');
      else doc.setFont('helvetica', 'bold');
    };

    function drawPageBackground() {
      doc.setFillColor(10, 10, 15);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setDrawColor(18, 22, 30);
      doc.setLineWidth(0.1);
      for (let x = 0; x <= pageWidth; x += 10) doc.line(x, 0, x, pageHeight);
      for (let gy = 0; gy <= pageHeight; gy += 10) doc.line(0, gy, pageWidth, gy);
      doc.setDrawColor(22, 30, 40);
      doc.setLineWidth(0.15);
      for (let x = 0; x <= pageWidth; x += 40) doc.line(x, 0, x, pageHeight);
      for (let gy = 0; gy <= pageHeight; gy += 40) doc.line(0, gy, pageWidth, gy);
    }

    drawPageBackground();

    let y = 20;
    if (logoImgRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = logoImgRef.current.naturalWidth;
        canvas.height = logoImgRef.current.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(logoImgRef.current, 0, 0);
        const logoData = canvas.toDataURL('image/png');
        const logoWidth = 60;
        const logoHeight = (logoImgRef.current.naturalHeight / logoImgRef.current.naturalWidth) * logoWidth;
        doc.addImage(logoData, 'PNG', (pageWidth - logoWidth) / 2, y, logoWidth, logoHeight);
        y += logoHeight + 12;
      } catch { y += 10; }
    }

    doc.setTextColor(0, 200, 255);
    doc.setFontSize(26);
    setOrbitron();
    doc.text('RAD SESH, DUDE!', pageWidth / 2, y, { align: 'center' });
    y += 12;

    doc.setTextColor(157, 0, 255);
    doc.setFontSize(14);
    setOrbitron();
    doc.text((room?.name || 'Karaoke Session').toUpperCase(), pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setTextColor(150, 150, 160);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(dateStr, pageWidth / 2, y, { align: 'center' });
    y += 14;

    doc.setTextColor(0, 200, 255);
    doc.setFontSize(12);
    setOrbitron();
    doc.text('SETLIST', margin, y);
    doc.setTextColor(100, 100, 110);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${playlist.length} song${playlist.length !== 1 ? 's' : ''}`, pageWidth - margin, y, { align: 'right' });
    y += 8;

    doc.setFontSize(9);
    playlist.forEach((item, index) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        drawPageBackground();
        y = margin;
      }

      doc.setTextColor(60, 60, 70);
      doc.setFont('helvetica', 'normal');
      doc.text(String(index + 1).padStart(2, '0'), margin, y);

      doc.setTextColor(230, 230, 240);
      doc.setFont('helvetica', 'bold');
      const title = item.title.length > 55 ? item.title.substring(0, 52) + '...' : item.title;
      doc.text(title, margin + 10, y);

      const dur = formatDuration(item.duration);
      if (dur) {
        doc.setTextColor(100, 100, 110);
        doc.setFont('helvetica', 'normal');
        doc.text(dur, pageWidth - margin, y, { align: 'right' });
      }
      y += 4.5;

      doc.setTextColor(80, 80, 90);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      let meta = item.channelName || '';
      if (item.addedByName) meta += (meta ? ' · ' : '') + `Added by ${item.addedByName}`;
      doc.text(meta, margin + 10, y);

      doc.setTextColor(60, 60, 70);
      const vid = item.videoId || item.video_id;
      if (vid) doc.text(`youtu.be/${vid}`, pageWidth - margin, y, { align: 'right' });

      doc.setFontSize(9);
      y += 7;
    });

    y = Math.max(y + 5, pageHeight - 16);
    if (y > pageHeight - 10) {
      doc.addPage();
      drawPageBackground();
      y = pageHeight - 16;
    }
    doc.setTextColor(60, 60, 70);
    doc.setFontSize(7);
    setOrbitron();
    doc.text('COOL DUDE KARAOKE — AMPED', pageWidth / 2, y, { align: 'center' });

    const filename = `${(room?.name || 'karaoke').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-setlist.pdf`;
    doc.save(filename);
  };

  const roomName = room?.name || 'Karaoke Session';
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="closeout-page">
      <div className="closeout-container closeout-flex-layout">
        <div className="logo-wrap">
          <img src={logo} alt="Cool Dude Karaoke" className="closeout-logo" />
          <span className="logo-subtitle">AMPED</span>
        </div>

        <h1 className="closeout-title">Rad sesh, dude!</h1>
        <p className="closeout-room-name">{roomName}</p>
        <p className="closeout-date">{dateStr}</p>

        {playlist.length > 0 && (
          <div className="closeout-stats">
            <span className="closeout-stat">{playlist.length} song{playlist.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        <div className="closeout-actions">
          <div className="closeout-action-card">
            <h3>Download Keepsake</h3>
            <p>Save a stylized PDF of tonight's setlist</p>
            <button
              className="btn-neon closeout-btn"
              onClick={handleDownloadPDF}
              disabled={playlist.length === 0}
            >
              Download PDF
            </button>
          </div>

          <div className="closeout-action-card">
            <h3>Publish to YouTube</h3>
            <p>Create a YouTube playlist from tonight's setlist</p>
            <button
              className="btn-neon closeout-btn"
              onClick={() => {
                const url = `http://localhost:5174/closeout/${room?.inviteCode || ''}`;
                window.open(url, '_blank');
              }}
            >
              Open in Browser
            </button>
            <p className="closeout-note">YouTube publishing requires browser sign-in</p>
          </div>
        </div>

        <div className="closeout-setlist">
          <h3>Tonight's Setlist</h3>
          <div className="closeout-song-list">
            {playlist.map((item, index) => (
              <div key={item.id || index} className="closeout-song">
                <span className="closeout-song-num">{index + 1}</span>
                <div className="closeout-song-info">
                  <span className="closeout-song-title">{item.title}</span>
                  <span className="closeout-song-meta">
                    {item.channelName || item.channel_name}
                    {(item.addedByName || item.added_by_name) && ` · ${item.addedByName || item.added_by_name}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn-neon closeout-new-room" onClick={onBackToLobby}>
          Go to the Lobby
        </button>
      </div>
    </div>
  );
};

export default Closeout;
