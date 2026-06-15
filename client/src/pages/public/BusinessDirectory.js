import React, { useState, useEffect } from 'react';
import { MapPin, Globe, Phone, Star, ChevronRight, Building2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/common/PublicLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const BusinessDirectory = () => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

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
                <div key={b.id} className="biz-card">
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
                    {user ? (
                      b.mobile_number && <span className="biz-meta-item"><Phone size={12} /> {b.mobile_number}</span>
                    ) : (
                      <span className="biz-meta-item" style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                        <Lock size={11} /> <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Sign in</Link> to view contact
                      </span>
                    )}
                  </div>

                  <div className="biz-footer">
                    {user && b.website ? (
                      <a href={b.website} target="_blank" rel="noreferrer" className="biz-website" onClick={e => e.stopPropagation()}>
                        <Globe size={12} /> Visit Website
                      </a>
                    ) : <span />}
                    <span className="biz-view">View Details <ChevronRight size={12} /></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

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
