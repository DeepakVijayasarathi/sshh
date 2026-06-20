import React, { useState, useEffect } from 'react';
import { MapPin, Globe, Phone, Star, ChevronRight, Building2, Lock, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/common/PublicLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const openWhatsApp = (number) => {
  const cleaned = (number || '').replace(/\D/g, '');
  const phone = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
  window.open(`https://wa.me/${phone}`, '_blank');
};

const BusinessDirectory = () => {
  const { user } = useAuth();
  const isActiveMember = user && user.member_status === 'Active';
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    api.get('/businesses/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    api.get(`/businesses?${params}&limit=20`)
      .then(r => setBusinesses(r.data.data || []))
      .catch(() => setBusinesses([]))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <PublicLayout>
      <div className="page-header">
        <div className="container">
          <h1>Business Directory</h1>
          <p>Discover Sourashtra community businesses and services</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="biz-search-bar">
            <div className="biz-search-input-wrap">
              <Building2 size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="form-control"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="Search business or owner name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="form-control" style={{ width: 200 }} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : businesses.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '3rem' }}>No businesses found.</div>
          ) : (
            <div className="biz-grid">
              {businesses.map(b => (
                <div key={b.id} className="biz-card" onClick={() => isActiveMember ? setDetail(b) : null}>
                  <div className="biz-card-top">
                    {b.logo_url ? (
                      <img src={b.logo_url} alt={b.business_name} className="biz-logo" />
                    ) : (
                      <div className="biz-logo biz-logo-initial">
                        {b.business_name.charAt(0)}
                      </div>
                    )}
                    <div className="biz-info">
                      <h3 className="biz-name">{b.business_name}</h3>
                      <p className="biz-owner">{b.owner_name}</p>
                    </div>
                    {b.is_featured && (
                      <span className="biz-featured"><Star size={10} fill="currentColor" /> Featured</span>
                    )}
                  </div>

                  {b.category_name && (
                    <span className="biz-category">{b.category_name}</span>
                  )}

                  {b.description && (
                    <p className="biz-desc">{b.description.substring(0, 90)}{b.description.length > 90 ? '…' : ''}</p>
                  )}

                  <div className="biz-meta">
                    {b.city && (
                      <span className="biz-meta-item"><MapPin size={12} /> {b.city}</span>
                    )}
                    {isActiveMember ? (
                      b.mobile_number && <span className="biz-meta-item"><Phone size={12} /> {b.mobile_number}</span>
                    ) : (
                      <span className="biz-meta-item" style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                        <Lock size={11} /> <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Active membership</Link> required
                      </span>
                    )}
                  </div>

                  <div className="biz-footer">
                    {isActiveMember && b.website ? (
                      <a href={b.website} target="_blank" rel="noreferrer" className="biz-website" onClick={e => e.stopPropagation()}>
                        <Globe size={12} /> Visit Website
                      </a>
                    ) : <span />}
                    <span className="biz-view">
                      {isActiveMember ? <>View Details <ChevronRight size={12} /></> : <><Lock size={11} /> Members Only</>}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Business Detail Modal */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} onClick={() => setDetail(null)}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 560, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {detail.logo_url
                  ? <img src={detail.logo_url} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />
                  : <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem' }}>{detail.business_name.charAt(0)}</div>
                }
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{detail.business_name}</h2>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>{detail.category_name} {detail.city ? `· ${detail.city}` : ''}</p>
                </div>
              </div>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {detail.description && <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.7, margin: 0 }}>{detail.description}</p>}
              {detail.address && <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}><MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />{detail.address}</p>}
              {detail.website && (
                <a href={detail.website} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>
                  <Globe size={14} /> {detail.website}
                </a>
              )}
              {detail.mobile_number && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <a href={`tel:${detail.mobile_number}`} className="btn btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Phone size={15} /> Call {detail.mobile_number}
                  </a>
                  <button onClick={() => openWhatsApp(detail.mobile_number)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#25D366', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', padding: '0.625rem' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .biz-search-bar {
          display: grid; grid-template-columns: 1fr auto;
          gap: 1rem; margin-bottom: 2rem;
        }
        .biz-search-input-wrap { position: relative; }

        .biz-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .biz-card {
          background: #fff; border-radius: 14px;
          border: 1.5px solid #f1f5f9;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          padding: 1.25rem;
          display: flex; flex-direction: column; gap: 0.625rem;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          cursor: pointer;
        }
        .biz-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
          border-color: var(--primary,#8B0000);
        }

        .biz-card-top {
          display: flex; align-items: center; gap: 0.875rem;
          position: relative;
        }
        .biz-logo {
          width: 52px; height: 52px; border-radius: 12px;
          object-fit: cover; flex-shrink: 0;
          border: 1.5px solid #f1f5f9;
        }
        .biz-logo-initial {
          background: linear-gradient(135deg, var(--primary,#8B0000), #1a0a1e);
          color: #fff; font-weight: 700; font-size: 1.25rem;
          display: flex; align-items: center; justify-content: center;
          border: none;
        }
        .biz-info { flex: 1; min-width: 0; }
        .biz-name {
          font-size: 0.9375rem; font-weight: 700; color: #0f172a;
          margin: 0 0 0.125rem; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }
        .biz-owner { font-size: 0.78rem; color: #94a3b8; margin: 0; }

        .biz-featured {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 0.62rem; font-weight: 700; text-transform: uppercase;
          background: #fef3c7; color: #b45309;
          padding: 2px 7px; border-radius: 20px; flex-shrink: 0;
        }

        .biz-category {
          display: inline-block;
          font-size: 0.7rem; font-weight: 600;
          background: #f1f5f9; color: #475569;
          padding: 3px 10px; border-radius: 6px; width: fit-content;
        }
        .biz-desc {
          font-size: 0.8rem; color: #64748b;
          line-height: 1.55; margin: 0;
        }
        .biz-meta {
          display: flex; flex-direction: column; gap: 0.25rem;
        }
        .biz-meta-item {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.78rem; color: #64748b;
        }
        .biz-footer {
          display: flex; align-items: center; justify-content: space-between;
          border-top: 1px solid #f1f5f9; padding-top: 0.625rem;
          margin-top: 0.25rem;
        }
        .biz-website {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.78rem; font-weight: 500;
          color: var(--primary,#8B0000); text-decoration: none;
        }
        .biz-view {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 0.78rem; font-weight: 600;
          color: var(--primary,#8B0000);
        }
        .biz-card:hover .biz-view { gap: 6px; transition: gap 0.15s; }
      `}</style>
    </PublicLayout>
  );
};

export default BusinessDirectory;
