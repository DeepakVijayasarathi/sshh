import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import PublicLayout from '../../components/common/PublicLayout';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const Contact = () => {
  const settings = useSiteSettings();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const contactItems = [
    { Icon: MapPin, color: '#8B0000', label: 'Address',      value: settings.contact_address || 'Sourashtra Community Hall, Chennai, Tamil Nadu 600001' },
    { Icon: Phone,  color: '#2563eb', label: 'Phone',        value: settings.contact_phone   || '+91 98765 43210' },
    { Icon: Mail,   color: '#059669', label: 'Email',        value: settings.contact_email   || 'info@sourashtra.org' },
    { Icon: Clock,  color: '#7c3aed', label: 'Office Hours', value: 'Mon–Sat, 9:00 AM – 5:00 PM' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Message sent! We will get back to you shortly.');
      setForm({ name: '', email: '', mobile: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <PublicLayout>
      <div className="page-header">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Reach out to us anytime.</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem', alignItems: 'start' }}>
            <div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 600, marginBottom: '1.5rem' }}>Get In Touch</h2>
              {contactItems.map(item => (
                <div key={item.label} style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: `rgba(0,0,0,0.05)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.Icon size={17} color={item.color} strokeWidth={1.75} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.125rem' }}>{item.label}</p>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-header">Send us a Message</div>
              <form onSubmit={handleSubmit} className="card-body">
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Your Name *</label>
                    <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile</label>
                    <input className="form-control" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input className="form-control" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea className="form-control" rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Contact;
