import React, { useRef, useState } from 'react';
import { MapPin, Download, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';
import './MembershipCard.css';

const PRIMARY   = '#8B0000';
const PRIMARY_D = '#4a0000';
const GOLD      = '#D4AF37';
const W = 560;
const FRONT_H = 220;
const BACK_H  = 210;
const GAP     = 12;
const SCALE   = 2;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

async function generateCardBlob(member) {
  const TOTAL_H = FRONT_H + GAP + BACK_H;
  const canvas = document.createElement('canvas');
  canvas.width  = W * SCALE;
  canvas.height = TOTAL_H * SCALE;
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);

  /* ─── FRONT ─── */
  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, FRONT_H);
  grad.addColorStop(0,   PRIMARY);
  grad.addColorStop(0.6, PRIMARY_D);
  grad.addColorStop(1,   '#6B0000');
  roundRect(ctx, 0, 0, W, FRONT_H, 12);
  ctx.fillStyle = grad;
  ctx.fill();

  // Subtle decorative radial
  const radial = ctx.createRadialGradient(W, 0, 0, W, 0, W * 0.7);
  radial.addColorStop(0, 'rgba(212,175,55,0.12)');
  radial.addColorStop(1, 'rgba(212,175,55,0)');
  roundRect(ctx, 0, 0, W, FRONT_H, 12);
  ctx.fillStyle = radial;
  ctx.fill();

  // Header separator
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(16, 58); ctx.lineTo(W - 16, 58);
  ctx.stroke();

  // Logo circle
  ctx.beginPath();
  ctx.arc(36, 29, 19, 0, Math.PI * 2);
  ctx.fillStyle = GOLD;
  ctx.fill();
  ctx.fillStyle = PRIMARY_D;
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SC', 36, 29);

  // Org name
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('Saurashtra Heritage Chair', 64, 24);
  ctx.font = '10px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.fillText('Official Membership Card', 64, 40);

  // Photo
  const PHX = 20, PHY = 70, PHR = 38;
  ctx.save();
  ctx.beginPath();
  ctx.arc(PHX + PHR, PHY + PHR, PHR, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fill();
  ctx.clip();
  if (member.photo_url) {
    try {
      const pImg = await loadImage(member.photo_url);
      ctx.drawImage(pImg, PHX, PHY, PHR * 2, PHR * 2);
    } catch {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `bold 30px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(member.full_name?.charAt(0) || '?', PHX + PHR, PHY + PHR);
    }
  } else {
    ctx.fillStyle = '#fff';
    ctx.font = `bold 30px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(member.full_name?.charAt(0) || '?', PHX + PHR, PHY + PHR);
  }
  ctx.restore();

  // Member info text
  const IX = PHX + PHR * 2 + 18;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText(member.full_name || '', IX, 92);

  ctx.font = '11px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText(member.membership_number || '', IX, 112);

  // Type badge
  if (member.membership_type) {
    ctx.font = 'bold 9px sans-serif';
    const bw = ctx.measureText(member.membership_type).width + 16;
    roundRect(ctx, IX, 118, bw, 18, 9);
    ctx.fillStyle = GOLD;
    ctx.fill();
    ctx.fillStyle = PRIMARY_D;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(member.membership_type, IX + bw / 2, 127);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  // Location
  const loc = [member.city, member.district].filter(Boolean).join(', ');
  if (loc) {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '10px sans-serif';
    ctx.fillText(`\u{1F4CD} ${loc}`, IX, 152);
  }

  // Footer bar
  roundRect(ctx, 0, FRONT_H - 46, W, 46, 12);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fill();
  // re-clip bottom corners to card
  roundRect(ctx, 0, FRONT_H - 46, W, 46, 0);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'left';
  const issued = member.issued_date ? new Date(member.issued_date).toLocaleDateString('en-IN') : 'N/A';
  const valid  = member.valid_until ? new Date(member.valid_until).toLocaleDateString('en-IN') : null;
  ctx.fillText(`Issued: ${issued}`, 16, FRONT_H - 28);
  if (valid) ctx.fillText(`Valid Until: ${valid}`, 16, FRONT_H - 14);

  // QR code
  try {
    const qrData = encodeURIComponent(JSON.stringify({ memberNo: member.membership_number, name: member.full_name }));
    const qrImg  = await loadImage(`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`);
    // white bg behind QR
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(W - 58, FRONT_H - 58, 42, 42);
    ctx.drawImage(qrImg, W - 56, FRONT_H - 56, 38, 38);
  } catch {}

  /* ─── BACK ─── */
  const BY = FRONT_H + GAP;

  // Back card bg
  roundRect(ctx, 0, BY, W, BACK_H, 12);
  ctx.fillStyle = '#f9fafb';
  ctx.fill();
  roundRect(ctx, 0, BY, W, BACK_H, 12);
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Back header text
  ctx.fillStyle = PRIMARY;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Saurashtra Heritage Chair', W / 2, BY + 26);

  ctx.strokeStyle = PRIMARY;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(16, BY + 34); ctx.lineTo(W - 16, BY + 34);
  ctx.stroke();

  // Back rows
  const rows = [
    ['Member No:',       member.membership_number],
    ['Member Name:',     member.full_name],
    ['Membership Type:', member.membership_type],
    ['Mobile:',          member.mobile_number],
    ['District:',        member.district],
  ].filter(([, v]) => v);

  rows.forEach(([label, value], i) => {
    const RY = BY + 52 + i * 26;
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, 20, RY);
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(value, 180, RY);

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, RY + 8); ctx.lineTo(W - 20, RY + 8);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Back note
  ctx.fillStyle = '#9ca3af';
  ctx.font = '8.5px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('This card is the property of Saurashtra Heritage Chair.', W / 2, BY + BACK_H - 30);
  ctx.fillText('If found, please return to the nearest community office.', W / 2, BY + BACK_H - 18);

  ctx.fillStyle = PRIMARY;
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('+91 98765 43210  |  info@sourashtra.org', W / 2, BY + BACK_H - 5);

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

const MembershipCard = ({ member, onClose }) => {
  const cardRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  const handlePrint = () => {
    const printContents = cardRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Membership Card - ${member.full_name}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', sans-serif; background: #f0f0f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            .mc-wrapper { display: flex; gap: 1rem; flex-direction: column; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const handleDownloadImage = async () => {
    setSharing(true);
    try {
      const blob = await generateCardBlob(member);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `membership-card-${member.membership_number}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Image download failed. Use Print / PDF instead.');
    } finally {
      setSharing(false);
    }
  };

  const handleWhatsApp = async () => {
    setSharing(true);
    try {
      const blob = await generateCardBlob(member);
      const file = new File([blob], `membership-card-${member.membership_number}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${member.full_name} — Membership Card`,
          text: `Saurashtra Heritage Chair — Digital Membership Card\nMember: ${member.full_name} | No: ${member.membership_number}`,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = `membership-card-${member.membership_number}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.info('Card downloaded! Attach it from your Downloads folder when sharing on WhatsApp.', { autoClose: 6000 });
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error('Could not share card. Try Download Image instead.');
      }
    } finally {
      setSharing(false);
    }
  };

  if (!member) return null;

  const qrData = encodeURIComponent(JSON.stringify({
    memberNo: member.membership_number,
    name: member.full_name,
    type: member.membership_type,
  }));
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${qrData}`;

  return (
    <div className="mc-overlay" onClick={onClose}>
      <div className="mc-container" onClick={(e) => e.stopPropagation()}>
        <div className="mc-actions">
          <h3>Digital Membership Card</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" onClick={handleDownloadImage} disabled={sharing} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Download size={13} /> {sharing ? 'Preparing…' : 'Download Image'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Download size={13} /> Print / PDF
            </button>
            <button className="btn btn-outline btn-sm" onClick={handleWhatsApp} disabled={sharing} style={{ display: 'flex', alignItems: 'center', gap: 4, borderColor: '#25D366', color: '#25D366' }}>
              <Share2 size={13} /> {sharing ? 'Sharing…' : 'Share on WhatsApp'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
          </div>
        </div>

        <div ref={cardRef} className="mc-wrapper">
          {/* Front of card */}
          <div className="mc-card mc-front">
            <div className="mc-header">
              <div className="mc-logo">SC</div>
              <div className="mc-org">
                <div className="mc-org-name">Saurashtra Heritage Chair</div>
                <div className="mc-org-sub">Official Membership Card</div>
              </div>
            </div>
            <div className="mc-body">
              <div className="mc-photo">
                {member.photo_url ? (
                  <img src={member.photo_url} alt={member.full_name} />
                ) : (
                  <div className="mc-photo-placeholder">{member.full_name?.charAt(0)}</div>
                )}
              </div>
              <div className="mc-info">
                <div className="mc-name">{member.full_name}</div>
                <div className="mc-number">{member.membership_number}</div>
                <div className="mc-type-badge">{member.membership_type}</div>
                {member.district && <div className="mc-location" style={{display:'flex',alignItems:'center',gap:3}}><MapPin size={11}/> {[member.city, member.district].filter(Boolean).join(', ')}</div>}
              </div>
            </div>
            <div className="mc-footer">
              <div className="mc-dates">
                <span>Issued: {member.issued_date ? new Date(member.issued_date).toLocaleDateString('en-IN') : 'N/A'}</span>
                {member.valid_until && <span>Valid Until: {new Date(member.valid_until).toLocaleDateString('en-IN')}</span>}
              </div>
              <div className="mc-qr">
                <img src={qrUrl} alt="QR Code" width={60} height={60} />
              </div>
            </div>
          </div>

          {/* Back of card */}
          <div className="mc-card mc-back">
            <div className="mc-back-header">Saurashtra Heritage Chair</div>
            <div className="mc-back-body">
              <div className="mc-back-row"><span>Member No:</span><strong>{member.membership_number}</strong></div>
              <div className="mc-back-row"><span>Member Name:</span><strong>{member.full_name}</strong></div>
              <div className="mc-back-row"><span>Membership Type:</span><strong>{member.membership_type}</strong></div>
              {member.mobile_number && <div className="mc-back-row"><span>Mobile:</span><strong>{member.mobile_number}</strong></div>}
              {member.district && <div className="mc-back-row"><span>District:</span><strong>{member.district}</strong></div>}
            </div>
            <div className="mc-back-note">
              This card is the property of Saurashtra Heritage Chair.<br />
              If found, please return to the nearest community office.
            </div>
            <div className="mc-back-contact">+91 98765 43210 | info@sourashtra.org</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipCard;
