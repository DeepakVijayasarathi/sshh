import React, { useState, useEffect } from 'react';
import { MapPin, Clock, ChevronRight, CalendarDays, Plus, X, Share2, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PublicLayout from '../../components/common/PublicLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import useSEO from '../../hooks/useSEO';

const formatTime = (t) => {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
};

const CATEGORY_COLORS = {
  Cultural:    { bg: '#fef3c7', color: '#b45309' },
  Education:   { bg: '#dbeafe', color: '#1d4ed8' },
  Sports:      { bg: '#dcfce7', color: '#15803d' },
  Health:      { bg: '#fce7f3', color: '#be185d' },
  Business:    { bg: '#ede9fe', color: '#6d28d9' },
  Religious:   { bg: '#fff7ed', color: '#c2410c' },
  Social:      { bg: '#e0f2fe', color: '#0369a1' },
};

const getCatStyle = (cat) => CATEGORY_COLORS[cat] || { bg: '#f1f5f9', color: '#475569' };

const shareEventWhatsApp = (ev, e) => {
  e.preventDefault();
  e.stopPropagation();
  const date = new Date(ev.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const text = `📅 *${ev.title}*\n${ev.venue ? `📍 Venue: ${ev.venue}\n` : ''}🗓 Date: ${date}${ev.event_time ? ` at ${ev.event_time}` : ''}\n${ev.description ? `\n${ev.description.slice(0, 120)}…\n` : ''}\n🔗 ${window.location.origin}/events/${ev.id}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
};

const EventCard = ({ ev }) => {
  const d = new Date(ev.event_date);
  const day   = d.getDate();
  const month = d.toLocaleString('en-IN', { month: 'short' }).toUpperCase();
  const year  = d.getFullYear();
  const cat   = ev.category || ev.event_type || '';
  const catStyle = getCatStyle(cat);

  return (
    <Link to={`/events/${ev.id}`} className="ev-card">
      {ev.banner_image_url ? (
        <div className="ev-img-wrap">
          <img src={ev.banner_image_url} alt={ev.title} className="ev-img" />
          <div className="ev-date-badge ev-date-over">
            <span className="ev-day">{day}</span>
            <span className="ev-mon">{month}</span>
          </div>
        </div>
      ) : (
        <div className="ev-no-img">
          <div className="ev-date-badge">
            <span className="ev-day">{day}</span>
            <span className="ev-mon">{month}</span>
          </div>
          <div className="ev-year">{year}</div>
        </div>
      )}
      <div className="ev-body">
        {cat && (
          <span className="ev-cat" style={{ background: catStyle.bg, color: catStyle.color }}>
            {cat}
          </span>
        )}
        <h3 className="ev-title">{ev.title}</h3>
        <div className="ev-meta">
          {ev.venue && (
            <span className="ev-meta-item">
              <MapPin size={12} /> {ev.venue}
            </span>
          )}
          {ev.event_time && (
            <span className="ev-meta-item">
              <Clock size={12} /> {formatTime(ev.event_time)}
            </span>
          )}
        </div>
        {ev.description && (
          <p className="ev-desc">
            {ev.description.length > 90 ? ev.description.slice(0, 90) + '…' : ev.description}
          </p>
        )}
        <div className="ev-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="ev-link">View Details <ChevronRight size={13} /></span>
            {ev.youtube_url && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#fee2e2', color: '#dc2626', borderRadius: 5, padding: '2px 7px', fontSize: '0.68rem', fontWeight: 700 }}>
                <PlayCircle size={11} /> Video
              </span>
            )}
          </div>
          <button
            onClick={(e) => shareEventWhatsApp(ev, e)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#25D366', color: 'white', border: 'none', borderRadius: 6, padding: '0.25rem 0.625rem', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <Share2 size={11} /> Share
          </button>
        </div>
      </div>
    </Link>
  );
};

const PROPOSE_DEFAULTS = { title: '', description: '', eventDate: '', eventTime: '', venue: '', contactPerson: '', contactNumber: '' };

const Events = () => {
  useSEO({ title: 'Events', description: 'Upcoming and past events of the Sourashtra community.' });
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  const [showPropose, setShowPropose] = useState(false);
  const [proposeForm, setProposeForm] = useState(PROPOSE_DEFAULTS);
  const [proposeBanner, setProposeBanner] = useState(null);
  const [proposing, setProposing] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/events?${tab}=true&limit=20`)
      .then(r => setEvents(r.data.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const setField = (f) => (e) => setProposeForm(p => ({ ...p, [f]: e.target.value }));

  const handlePropose = async (e) => {
    e.preventDefault();
    setProposing(true);
    try {
      const fd = new FormData();
      Object.entries(proposeForm).forEach(([k, v]) => v && fd.append(k, v));
      if (proposeBanner) fd.append('banner', proposeBanner);
      await api.post('/events/member-submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Event proposed! It will appear publicly once approved by the admin.');
      setShowPropose(false);
      setProposeForm(PROPOSE_DEFAULTS);
      setProposeBanner(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit event');
    } finally {
      setProposing(false);
    }
  };

  return (
    <PublicLayout>
      <div className="page-header">
        <div className="container">
          <h1>Community Events</h1>
          <p>Join us in celebrating culture, education and community</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          {/* Propose Event button for logged-in members */}
          {user && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button
                className="btn btn-primary"
                onClick={() => setShowPropose(!showPropose)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {showPropose ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Propose an Event</>}
              </button>
            </div>
          )}

          {/* Propose Event form */}
          {showPropose && user && (
            <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '1.75rem', marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Propose a Community Event</h3>
              <form onSubmit={handlePropose}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '0 1.25rem' }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Event Title <span style={{ color: '#ef4444' }}>*</span></label>
                    <input className="form-control" value={proposeForm.title} onChange={setField('title')} required placeholder="Name of the event" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="date" className="form-control" value={proposeForm.eventDate} onChange={setField('eventDate')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time</label>
                    <input type="time" className="form-control" value={proposeForm.eventTime} onChange={setField('eventTime')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Venue</label>
                    <input className="form-control" value={proposeForm.venue} onChange={setField('venue')} placeholder="Location / venue" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input className="form-control" value={proposeForm.contactPerson} onChange={setField('contactPerson')} placeholder="Organiser name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Number</label>
                    <input className="form-control" value={proposeForm.contactNumber} onChange={setField('contactNumber')} placeholder="Mobile number" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Banner Image</label>
                    <input type="file" className="form-control" accept="image/*" onChange={e => setProposeBanner(e.target.files[0])} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={3} value={proposeForm.description} onChange={setField('description')} placeholder="Brief description of the event…" style={{ resize: 'vertical' }} />
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.875rem' }}>
                  Your event will be reviewed by an admin before it is published.
                </p>
                <button type="submit" className="btn btn-primary" disabled={proposing}>
                  {proposing ? 'Submitting…' : 'Submit for Approval'}
                </button>
              </form>
            </div>
          )}

          <div className="ev-tab-bar">
            <button className={`ev-tab ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>
              <CalendarDays size={15} /> Upcoming Events
            </button>
            <button className={`ev-tab ${tab === 'past' ? 'active' : ''}`} onClick={() => setTab('past')}>
              Past Events
            </button>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : events.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '3rem' }}>No events found.</div>
          ) : (
            <div className="ev-grid">
              {events.map(ev => <EventCard key={ev.id} ev={ev} />)}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .ev-tab-bar {
          display: flex; gap: 0; border-bottom: 2px solid #e2e8f0;
          margin-bottom: 2rem;
        }
        .ev-tab {
          display: flex; align-items: center; gap: 6px;
          background: none; border: none; padding: 0.75rem 1.5rem;
          font-size: 0.9375rem; font-weight: 500;
          color: #94a3b8; cursor: pointer;
          border-bottom: 2px solid transparent; margin-bottom: -2px;
          transition: all 0.2s;
        }
        .ev-tab.active { color: var(--primary,#8B0000); border-bottom-color: var(--primary,#8B0000); }
        .ev-tab:hover { color: var(--primary,#8B0000); }

        .ev-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .ev-card {
          display: flex; flex-direction: column;
          background: #fff; border-radius: 14px;
          border: 1.5px solid #f1f5f9;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          text-decoration: none; color: inherit;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .ev-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
          border-color: var(--primary,#8B0000);
        }

        /* Top area — no image */
        .ev-no-img {
          background: linear-gradient(135deg, var(--primary,#8B0000) 0%, #1a0a1e 100%);
          padding: 1.5rem 1.25rem;
          display: flex; align-items: center; justify-content: space-between;
          min-height: 90px;
        }
        .ev-year {
          font-size: 0.75rem; font-weight: 700;
          color: rgba(255,255,255,0.35); letter-spacing: 0.1em;
        }

        /* Date badge */
        .ev-date-badge {
          display: flex; flex-direction: column; align-items: center;
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.25);
          border-radius: 10px; padding: 0.5rem 0.875rem;
          backdrop-filter: blur(4px);
        }
        .ev-day {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.75rem; font-weight: 800; color: #fff; line-height: 1;
        }
        .ev-mon {
          font-size: 0.65rem; font-weight: 700; color: var(--secondary,#D4AF37);
          letter-spacing: 0.08em; margin-top: 2px;
        }

        /* Image variant */
        .ev-img-wrap {
          position: relative; overflow: hidden; height: 180px;
        }
        .ev-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.3s;
        }
        .ev-card:hover .ev-img { transform: scale(1.04); }
        .ev-date-over {
          position: absolute; top: 12px; left: 12px;
          background: rgba(0,0,0,0.55);
          border-color: rgba(255,255,255,0.3);
        }

        /* Body */
        .ev-body {
          padding: 1.125rem 1.25rem 1rem;
          display: flex; flex-direction: column; flex: 1;
        }
        .ev-cat {
          display: inline-block; font-size: 0.65rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.07em;
          border-radius: 5px; padding: 2px 8px;
          margin-bottom: 0.5rem; width: fit-content;
        }
        .ev-title {
          font-size: 1rem; font-weight: 700; color: #0f172a;
          margin: 0 0 0.625rem; line-height: 1.4;
        }
        .ev-meta {
          display: flex; flex-wrap: wrap; gap: 0.625rem;
          margin-bottom: 0.625rem;
        }
        .ev-meta-item {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.78rem; color: #64748b;
        }
        .ev-desc {
          font-size: 0.8rem; color: #94a3b8;
          line-height: 1.6; margin: 0 0 0.75rem; flex: 1;
        }
        .ev-footer {
          border-top: 1px solid #f1f5f9; padding-top: 0.75rem;
          margin-top: auto;
        }
        .ev-link {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 0.85rem; font-weight: 600;
          color: var(--primary,#8B0000);
          transition: gap 0.15s;
        }
        .ev-card:hover .ev-link { gap: 6px; }
      `}</style>
    </PublicLayout>
  );
};

export default Events;
