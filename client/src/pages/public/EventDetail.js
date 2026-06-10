import React, { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', mobile: '' });
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(r => setEvent(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/events/${id}/register`, form);
      toast.success('Successfully registered for the event!');
      setRegistered(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem', alignItems: 'start' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontFamily: "'Playfair Display', serif", marginBottom: '1rem', color: 'var(--primary)' }}>{event.title}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <span className="badge badge-info" style={{display:'inline-flex',alignItems:'center',gap:4}}><Calendar size={11}/> {new Date(event.event_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                {event.event_time && <span className="badge badge-secondary">{event.event_time}</span>}
                {event.registered_count && <span className="badge badge-success" style={{display:'inline-flex',alignItems:'center',gap:4}}><Users size={11}/> {event.registered_count} Registered</span>}
              </div>
              {event.venue && <p style={{ marginBottom: '0.5rem' }}><strong>Venue:</strong> {event.venue}</p>}
              {event.contact_person && <p style={{ marginBottom: '0.5rem' }}><strong>Contact:</strong> {event.contact_person} {event.contact_number && `(${event.contact_number})`}</p>}
              {event.google_map_link && <a href={event.google_map_link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm mt-2">View on Map</a>}
              {event.description && (
                <div style={{ marginTop: '1.5rem', lineHeight: 1.8, color: 'var(--text-medium)' }}>
                  <h3 style={{ marginBottom: '0.75rem' }}>About this Event</h3>
                  <p>{event.description}</p>
                </div>
              )}
            </div>
            <div className="card">
              <div className="card-header">Register for This Event</div>
              {registered ? (
                <div className="card-body text-center">
                  <div style={{display:'flex',justifyContent:'center',marginBottom:'0.5rem'}}><CheckCircle2 size={40} color="#059669" strokeWidth={1.5}/></div>
                  <p className="fw-bold">You're registered!</p>
                  <p className="text-muted">See you at the event.</p>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="card-body">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Your name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email for confirmation" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile</label>
                    <input className="form-control" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} placeholder="Mobile number" />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                    {submitting ? 'Registering...' : 'Register Now'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default EventDetail;
