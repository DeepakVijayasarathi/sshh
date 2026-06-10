import React, { useState, useEffect } from 'react';
import { MapPin, Clock, ChevronRight, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/common/PublicLayout';
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
        <div className="ev-footer">
          <span className="ev-link">View Details <ChevronRight size={13} /></span>
        </div>
      </div>
    </Link>
  );
};

const Events = () => {
  useSEO({ title: 'Events', description: 'Upcoming and past events of the Sourashtra community.' });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    setLoading(true);
    api.get(`/events?${tab}=true&limit=20`)
      .then(r => setEvents(r.data.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [tab]);

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
