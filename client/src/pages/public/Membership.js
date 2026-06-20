import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/common/PublicLayout';
import { CheckCircle, ArrowRight, Users, Heart, Star, Shield } from 'lucide-react';

const BENEFITS = [
  { icon: Users, title: 'Community Network', desc: 'Connect with Sourashtra members across Tamil Nadu' },
  { icon: Star, title: 'Event Access', desc: 'Participate in cultural, religious and community events' },
  { icon: Heart, title: 'Support Programs', desc: 'Access scholarship and welfare assistance programs' },
  { icon: Shield, title: 'Business Directory', desc: 'List and discover Sourashtra community businesses' },
];

const FEATURES = [
  'Digital Membership Card',
  'Member Directory Access',
  'Event Participation',
  'Business Networking',
  'Scholarship Programs',
  'Community Forum',
  'Job Opportunities',
  'Community Updates',
];

const Membership = () => (
  <PublicLayout>
    <div className="page-header">
      <div className="container">
        <h1>Membership</h1>
        <p>Join the Sourashtra Community and become a part of our heritage</p>
      </div>
    </div>

    <section className="section">
      <div className="container">
        {/* Hero CTA */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #4a0000 100%)',
          borderRadius: 20, padding: '3rem 2.5rem', textAlign: 'center', marginBottom: '3rem',
          color: 'white', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top right, rgba(212,175,55,0.15), transparent 60%)', pointerEvents: 'none' }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
            Become a Member Today
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.85)', maxWidth: 560, margin: '0 auto 2rem', lineHeight: 1.7 }}>
            Fill out the registration form to apply for membership. Your application will be reviewed and approved by the admin team.
          </p>
          <Link
            to="/register"
            className="btn"
            style={{
              background: 'var(--secondary, #D4AF37)', color: '#1a0a1e',
              fontWeight: 700, fontSize: '1rem', padding: '0.875rem 2.5rem',
              borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 8,
              textDecoration: 'none', boxShadow: '0 4px 20px rgba(212,175,55,0.4)',
            }}
          >
            Apply for Membership <ArrowRight size={18} />
          </Link>
        </div>

        {/* Benefits */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 className="section-title">Member Benefits</h2>
          <p className="section-subtitle">Everything you get as a community member</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ background: 'white', borderRadius: 16, border: '1.5px solid #f1f5f9', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(var(--primary-rgb),0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Icon size={24} style={{ color: 'var(--primary)' }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: '0.5rem' }}>{title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Features checklist */}
        <div style={{ background: '#f8fafc', borderRadius: 16, padding: '2rem', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: '#111827', textAlign: 'center', marginBottom: '1.5rem' }}>What's Included</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle size={16} style={{ color: '#059669', flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', color: '#374151' }}>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/register" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Register Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default Membership;
