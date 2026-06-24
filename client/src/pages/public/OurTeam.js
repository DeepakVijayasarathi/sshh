import React, { useEffect, useState } from 'react';
import { User, Phone } from 'lucide-react';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';

const OurTeam = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/team')
      .then(r => setMembers(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const patrons      = members.filter(m => m.division === 'Patron');
  const coordinators = members.filter(m => m.division !== 'Patron');
  const divisions    = [...new Set(coordinators.map(m => m.division).filter(Boolean))];

  return (
    <PublicLayout>
      <div className="page-header">
        <div className="container">
          <h1>Our Team &amp; Coordinators</h1>
          <p>Meet the dedicated people who lead and coordinate the Sourashtra community</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <>
              {/* Patrons */}
              {patrons.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.5rem',
                               paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary)' }}>
                    Patrons &amp; Inspiration
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                    {patrons.map(p => (
                      <div key={p.id} style={{
                        background: 'linear-gradient(135deg, #fffbf0 0%, #fff 100%)',
                        border: '1.5px solid #e8d98a', borderRadius: 16, padding: '1.75rem 1.25rem',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      }}>
                        <div style={{
                          width: 88, height: 88, borderRadius: '50%', overflow: 'hidden',
                          border: '3px solid #D4AF37', background: '#f1f5f9',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {p.photo_url
                            ? <img src={p.photo_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                            : <User size={30} color="#94a3b8" />
                          }
                        </div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase',
                                      letterSpacing: '0.08em', color: '#b45309' }}>{p.role}</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                        {p.designation && <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.designation}</div>}
                        {p.contact_number && (
                          <a href={`tel:${p.contact_number}`} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', marginTop: 4,
                          }}>
                            <Phone size={11} /> {p.contact_number}
                          </a>
                        )}
                        {p.quote && (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic',
                                        borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                            "{p.quote.substring(0, 100)}{p.quote.length > 100 ? '…' : ''}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coordinators grouped by division */}
              {coordinators.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.5rem',
                               paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary)' }}>
                    Team Coordinators
                  </h2>
                  {(divisions.length > 0 ? divisions : ['General']).map(div => {
                    const group = coordinators.filter(m => (m.division || 'General') === div);
                    return (
                      <div key={div} style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase',
                                     letterSpacing: '0.07em', color: '#64748b', margin: '0 0 1rem',
                                     paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                          {div}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                          {group.map(m => (
                            <div key={m.id} style={{
                              background: '#fff', border: '1.5px solid #f1f5f9', borderRadius: 14,
                              padding: '1.125rem', display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
                              boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                            }}>
                              <div style={{
                                width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                                background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid var(--secondary,#D4AF37)',
                              }}>
                                {m.photo_url
                                  ? <img src={m.photo_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                                  : <User size={22} color="#94a3b8" />
                                }
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase',
                                              letterSpacing: '0.08em', color: 'var(--primary,#8B0000)', marginBottom: 2 }}>{m.role}</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{m.name}</div>
                                {m.designation && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{m.designation}</div>}
                                {m.contact_number && (
                                  <a href={`tel:${m.contact_number}`} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6,
                                    fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none',
                                  }}>
                                    <Phone size={11} /> {m.contact_number}
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {members.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                  Team information coming soon.
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default OurTeam;
