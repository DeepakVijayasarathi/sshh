import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const STATUS_BADGES = { Active: 'badge-success', Pending: 'badge-warning', Rejected: 'badge-danger', Suspended: 'badge-secondary' };

const Businesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const load = () => {
    setLoading(true);
    const url = status ? `/businesses?status=${status}&limit=50` : '/businesses?limit=50';
    api.get(url).then(r => setBusinesses(r.data.data || [])).catch(() => setBusinesses([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]);

  const approve = async (id) => {
    try { await api.post(`/businesses/${id}/approve`); toast.success('Business approved'); load(); }
    catch { toast.error('Failed'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this business?')) return;
    try { await api.delete(`/businesses/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Business Directory</h1>
        <select className="form-control" style={{ width: 180 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {['Active','Pending','Rejected','Suspended'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="admin-card">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-responsive">
            <table>
              <thead><tr><th>Business</th><th>Owner</th><th>Category</th><th>Mobile</th><th>City</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {businesses.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>No businesses found</td></tr> :
                  businesses.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 500 }}>{b.business_name}</td>
                      <td>{b.owner_name}</td>
                      <td>{b.category_name || '—'}</td>
                      <td>{b.mobile_number}</td>
                      <td>{b.city || '—'}</td>
                      <td><span className={`badge ${STATUS_BADGES[b.status] || 'badge-secondary'}`}>{b.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          {b.status === 'Pending' && <button className="btn btn-sm btn-primary" onClick={() => approve(b.id)}>Approve</button>}
                          <button className="btn btn-sm btn-danger" onClick={() => remove(b.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Businesses;
