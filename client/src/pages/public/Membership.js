import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';

const PLAN_COLORS = [
  { accent: '#8B0000', bg: 'rgba(139,0,0,0.06)', border: 'rgba(139,0,0,0.15)' },
  { accent: '#b45309', bg: 'rgba(212,175,55,0.07)', border: 'rgba(212,175,55,0.3)' },
  { accent: '#2563eb', bg: 'rgba(37,99,235,0.06)', border: 'rgba(37,99,235,0.15)' },
  { accent: '#059669', bg: 'rgba(5,150,105,0.06)', border: 'rgba(5,150,105,0.15)' },
  { accent: '#7c3aed', bg: 'rgba(124,58,237,0.06)', border: 'rgba(124,58,237,0.15)' },
];

const DEFAULT_BENEFITS = [
  'Community Directory Access', 'Event Participation', 'Digital Membership Card',
  'Business Networking', 'Scholarship Programs', 'Community Updates',
  'Forum Participation', 'Job Opportunities',
];

const Membership = () => {
  const [types, setTypes] = useState([]);

  useEffect(() => {
    api.get('/members/types').then(r => setTypes(r.data)).catch(() => {});
  }, []);

  return (
    <PublicLayout>
      <div className="page-header">
        <div className="container">
          <h1>Membership</h1>
          <p>Join the Sourashtra Community and enjoy exclusive benefits</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">Membership Plans</h2>
            <p className="section-subtitle">Choose the plan that best suits you</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(types.length || 4, 4)}, 1fr)`,
            gap: 20,
          }}>
            {types.map((type, i) => {
              const { accent, bg, border } = PLAN_COLORS[i % PLAN_COLORS.length];
              const featured = i === 1;
              const benefits = type.benefits
                ? type.benefits.split('\n').filter(Boolean)
                : [];

              return (
                <div key={type.id} style={{
                  position: 'relative',
                  background: '#fff',
                  border: `${featured ? 2 : 1.5}px solid ${featured ? accent : border}`,
                  borderRadius: 16,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: featured ? `0 8px 32px ${bg.replace('0.06', '0.18')}` : '0 2px 10px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${bg.replace('0.06', '0.2')}`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = featured ? `0 8px 32px ${bg.replace('0.06', '0.18')}` : '0 2px 10px rgba(0,0,0,0.05)'; }}
                >
                  {/* Top accent bar */}
                  <div style={{ height: 4, background: accent }} />

                  {featured && (
                    <div style={{
                      position: 'absolute', top: 16, right: -24,
                      background: accent, color: 'white',
                      padding: '3px 32px', fontSize: '0.65rem', fontWeight: 700,
                      transform: 'rotate(45deg)', letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}>Popular</div>
                  )}

                  <div style={{ padding: '1.5rem 1.5rem 1rem', flex: 1 }}>
                    {/* Plan name */}
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.375rem' }}>
                      {type.name}
                    </h3>
                    {type.description && (
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
                        {type.description}
                      </p>
                    )}

                    {/* Price */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: accent }}>₹</span>
                        <span style={{ fontSize: '2.25rem', fontWeight: 800, color: accent, lineHeight: 1 }}>
                          {parseFloat(type.fee).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
                        {type.duration_months
                          ? `per ${type.duration_months === 12 ? 'year' : type.duration_months + ' months'}`
                          : 'one-time · lifetime'}
                      </p>
                    </div>

                    {/* Benefits */}
                    {benefits.length > 0 && (
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {benefits.map((b, j) => (
                          <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.8rem', color: '#475569' }}>
                            <span style={{ color: accent, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                            {b.replace(/^[-•]\s*/, '')}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div style={{ padding: '1rem 1.5rem 1.5rem' }}>
                    <Link to="/register"
                      style={{
                        display: 'block', textAlign: 'center', padding: '0.625rem',
                        borderRadius: 9, fontSize: '0.875rem', fontWeight: 700,
                        textDecoration: 'none', transition: 'opacity 0.15s',
                        background: featured ? accent : 'transparent',
                        color: featured ? '#fff' : accent,
                        border: `2px solid ${accent}`,
                      }}
                      onMouseEnter={e => { if (!featured) { e.currentTarget.style.background = accent; e.currentTarget.style.color = '#fff'; } }}
                      onMouseLeave={e => { if (!featured) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = accent; } }}
                    >
                      Join Now
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Default benefits section (when plans have no custom benefits) */}
          {types.length > 0 && types.every(t => !t.benefits) && (
            <div style={{ marginTop: '4rem' }}>
              <h2 className="section-title" style={{ textAlign: 'center' }}>Member Benefits</h2>
              <p className="section-subtitle" style={{ textAlign: 'center' }}>What you get as a member</p>
              <div className="grid grid-4" style={{ marginTop: '1rem' }}>
                {DEFAULT_BENEFITS.map(b => (
                  <div key={b} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '0.75rem', background: 'white',
                    borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                  }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>✓</span>
                    <span style={{ fontSize: '0.875rem' }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default Membership;
