import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';

const MemberDirectory = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', district: '', city: '', occupation: '' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const load = (page = 1) => {
    if (!user) return;
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12, status: 'Active' });
    if (filters.search) params.set('search', filters.search);
    if (filters.district) params.set('district', filters.district);
    if (filters.city) params.set('city', filters.city);
    api.get(`/members?${params}`)
      .then(r => {
        setMembers(r.data.data || []);
        setPagination(r.data.pagination);
      })
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filters, user]);

  if (!user) {
    return (
      <PublicLayout>
        <div className="page-header"><div className="container"><h1>Member Directory</h1></div></div>
        <section className="section">
          <div className="container text-center">
            <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Please login to access the member directory.</p>
            <a href="/login" className="btn btn-primary">Login</a>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="page-header">
        <div className="container">
          <h1>Member Directory</h1>
          <p>Find and connect with Sourashtra community members</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <input className="form-control" placeholder="Search name or member no..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
            <input className="form-control" placeholder="District" value={filters.district} onChange={e => setFilters({...filters, district: e.target.value})} />
            <input className="form-control" placeholder="City" value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} />
          </div>
          <p className="text-muted mb-3">{pagination.total} members found</p>

          {loading ? <div className="loading-center"><div className="spinner" /></div> :
            members.length === 0 ? <div className="text-center text-muted" style={{ padding: '3rem' }}>No members found.</div> :
              <div className="grid grid-4">
                {members.map(m => (
                  <div key={m.id} className="card" style={{ textAlign: 'center' }}>
                    <div className="card-body">
                      {m.photo_url ? (
                        <img src={m.photo_url} alt={m.full_name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 0.75rem' }} />
                      ) : (
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.5rem', margin: '0 auto 0.75rem' }}>
                          {m.full_name.charAt(0)}
                        </div>
                      )}
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.25rem' }}>{m.full_name}</h3>
                      {m.membership_number && <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>{m.membership_number}</p>}
                      {m.occupation && <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>{m.occupation}</p>}
                      {(m.city || m.district) && <p className="text-muted" style={{ fontSize: '0.8rem' }}>{[m.city, m.district].filter(Boolean).join(', ')}</p>}
                      {m.membership_type_name && <span className="badge badge-info mt-2">{m.membership_type_name}</span>}
                    </div>
                  </div>
                ))}
              </div>
          }

          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              {pagination.hasPrev && <button className="btn btn-outline btn-sm" onClick={() => load(pagination.page - 1)}>Previous</button>}
              <span className="btn btn-sm" style={{ background: '#f3f4f6', cursor: 'default' }}>Page {pagination.page} of {pagination.totalPages}</span>
              {pagination.hasNext && <button className="btn btn-outline btn-sm" onClick={() => load(pagination.page + 1)}>Next</button>}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default MemberDirectory;
