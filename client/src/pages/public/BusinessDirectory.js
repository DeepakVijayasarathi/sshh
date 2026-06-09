import React, { useState, useEffect } from 'react';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';

const BusinessDirectory = () => {
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '2rem' }}>
            <input
              className="form-control"
              placeholder="Search business or owner name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select className="form-control" style={{ width: 180 }} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : businesses.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '3rem' }}>No businesses found.</div>
          ) : (
            <div className="grid grid-3">
              {businesses.map(b => (
                <div key={b.id} className="card">
                  <div className="card-body">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      {b.logo_url ? (
                        <img src={b.logo_url} alt={b.business_name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem', flexShrink: 0 }}>
                          {b.business_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.125rem' }}>{b.business_name}</h3>
                        <p className="text-muted" style={{ fontSize: '0.8rem' }}>Owner: {b.owner_name}</p>
                        {b.is_featured && <span className="badge badge-warning">Featured</span>}
                      </div>
                    </div>
                    {b.category_name && <span className="badge badge-secondary mb-2">{b.category_name}</span>}
                    {b.description && <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{b.description.substring(0, 100)}{b.description.length > 100 ? '...' : ''}</p>}
                    <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {b.mobile_number && <span>📞 {b.mobile_number}</span>}
                      {b.city && <span>📍 {b.city}</span>}
                      {b.website && <a href={b.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>🌐 Website</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default BusinessDirectory;
