import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, Briefcase, Calendar, Users, CheckCircle2, Globe, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';
import useSEO from '../../hooks/useSEO';

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
          <div className="tab-bar mb-4">
            <button className={`tab-btn ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>Upcoming Events</button>
            <button className={`tab-btn ${tab === 'past' ? 'active' : ''}`} onClick={() => setTab('past')}>Past Events</button>
          </div>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : events.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '3rem' }}>No events found.</div>
          ) : (
            <div className="grid grid-3">
              {events.map(ev => (
                <Link key={ev.id} to={`/events/${ev.id}`} className="card" style={{ color: 'inherit', transition: 'transform 0.2s' }}>
                  {ev.banner_image_url && <img src={ev.banner_image_url} alt={ev.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />}
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span className="badge badge-info">
                        {new Date(ev.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {ev.event_time && <span className="text-muted" style={{ fontSize: '0.8rem' }}>{ev.event_time}</span>}
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{ev.title}</h3>
                    {ev.venue && <p className="text-muted" style={{ fontSize: '0.85rem' }}><MapPin size={12} style={{marginRight:3}}/> {ev.venue}</p>}
                    {ev.contact_person && <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Contact: {ev.contact_person}</p>}
                    <div style={{ marginTop: '1rem', color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 500 }}>View Details →</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <style>{`
        .tab-bar { display: flex; gap: 0.5rem; border-bottom: 2px solid var(--border); padding-bottom: -2px; }
        .tab-btn { background: none; border: none; padding: 0.75rem 1.5rem; font-size: 0.9375rem; font-weight: 500; color: var(--text-light); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; }
        .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }
        .tab-btn:hover { color: var(--primary); }
      `}</style>
    </PublicLayout>
  );
};

export default Events;
