import React, { useRef } from 'react';
import { MapPin, Download, Share2 } from 'lucide-react';
import './MembershipCard.css';

const MembershipCard = ({ member, onClose }) => {
  const cardRef = useRef(null);

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

  const handleWhatsApp = () => {
    const text = `*Saurashtra Heritage Chair*\nDigital Membership Card\n\nName: ${member.full_name}\nMember No: ${member.membership_number}\nType: ${member.membership_type}\nDistrict: ${member.district || '—'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
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
            <button className="btn btn-primary btn-sm" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Download size={13} /> Download / Print</button>
            <button className="btn btn-outline btn-sm" onClick={handleWhatsApp} style={{ display: 'flex', alignItems: 'center', gap: 4, borderColor: '#25D366', color: '#25D366' }}><Share2 size={13} /> Share on WhatsApp</button>
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
