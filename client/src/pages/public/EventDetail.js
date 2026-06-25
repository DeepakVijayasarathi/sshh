import React, { useState, useEffect } from 'react';
import { Calendar, Users, Phone, ExternalLink, Share2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(r => setEvent(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const openWhatsApp = (number) => {
    const cleaned = number.replace(/\D/g, '');
    const phone = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const text = `Check out this event: *${event.title}*\n${event.venue ? `📍 ${event.venue}\n` : ''}${event.event_date ? `📅 ${new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}\n` : ''}\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return <PublicLayout><div className="loading-center"><div className="spinner" /></div></PublicLayout>;
  if (!event) return <PublicLayout><div className="text-center" style={{ padding: '3rem' }}>Event not found.</div></PublicLayout>;

  return (
    <PublicLayout>
      {event.banner_image_url && (
        <div style={{ height: 350, overflow: 'hidden' }}>
          <img src={event.banner_image_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <section className="section">
        <div className="container">
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontFamily: "'Playfair Display', serif", marginBottom: '1rem', color: 'var(--primary)' }}>{event.title}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={11} /> {new Date(event.event_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                {event.event_time && <span className="badge badge-secondary">{event.event_time}</span>}
                {event.registered_count && (
                  <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Users size={11} /> {event.registered_count} Registered
                  </span>
                )}
              </div>
              {event.venue && <p style={{ marginBottom: '0.5rem' }}><strong>Venue:</strong> {event.venue}</p>}

              {/* Contact with WhatsApp button */}
              {event.contact_person && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <p style={{ margin: 0 }}><strong>Contact:</strong> {event.contact_person}{event.contact_number && ` — ${event.contact_number}`}</p>
                  {event.contact_number && (
                    <>
                      <a href={`tel:${event.contact_number}`} className="btn btn-sm btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.25rem 0.625rem' }}>
                        <Phone size={12} /> Call
                      </a>
                      <button onClick={() => openWhatsApp(event.contact_number)} className="btn btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.25rem 0.625rem', background: '#25D366', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                        WhatsApp
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* URL / Map link */}
              {event.google_map_link && (
                <a href={event.google_map_link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: '1rem' }}>
                  <ExternalLink size={13} /> View on Map / URL
                </a>
              )}

              {/* WhatsApp Share */}
              <div style={{ marginTop: '1.25rem' }}>
                <button
                  onClick={shareOnWhatsApp}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: '#25D366', color: 'white', border: 'none',
                    borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer',
                    fontSize: '0.875rem', fontWeight: 600,
                  }}
                >
                  <Share2 size={14} /> Share on WhatsApp
                </button>
              </div>

              {event.description && (
                <div style={{ marginTop: '1.5rem', lineHeight: 1.8, color: 'var(--text-medium)' }}>
                  <h3 style={{ marginBottom: '0.75rem' }}>About this Event</h3>
                  <p>{event.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default EventDetail;
