import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Search, Phone, X, ChevronLeft, User, MapPin } from 'lucide-react';
import api from '../../services/api';

const STATUS_BADGES = {
  New:       'badge-warning',
  Contacted: 'badge-info',
  Closed:    'badge-secondary',
};

const openWhatsApp = (number) => {
  const cleaned = number.replace(/\D/g, '');
  const phone = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
  window.open(`https://wa.me/${phone}`, '_blank');
};

const TnConnect = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]             = useState('');
  const [detail, setDetail]             = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 100 });
    if (statusFilter) params.set('status', statusFilter);
    if (search)       params.set('search', search);
    api.get(`/tn-connect?${params}`)
      .then(r => setRequests(r.data.data || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tn-connect/${id}/status`, { status });
      toast.success('Status updated');
      load();
      if (detail?.id === id) setDetail(prev => ({ ...prev, status }));
    } catch { toast.error('Failed to update status'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    try {
      await api.delete(`/tn-connect/${id}`);
      toast.success('Request deleted');
      if (detail?.id === id) setDetail(null);
      load();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>TN Sourash Connect</h1>
        <span style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>{requests.length} request{requests.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
          <input
            className="form-control"
            placeholder="Search name, contact, place…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        <select className="form-control" style={{ width: 165 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {['New', 'Contacted', 'Closed'].map(s => <option key={s}>{s}</option>)}
        </select>
        {(search || statusFilter) && (
          <button className="btn btn-sm btn-ghost" onClick={() => { setSearch(''); setStatusFilter(''); }} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <X size={13} /> Clear
          </button>
        )}
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact No.</th>
                  <th>Ghornav</th>
                  <th>Gothtra</th>
                  <th>Place</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-light)' }}>
                      No requests found
                    </td>
                  </tr>
                ) : requests.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                      <button onClick={() => setDetail(r)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', color: 'var(--primary,#8B0000)', fontWeight: 600, fontSize: '0.8125rem' }}>
                        {r.name}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8125rem' }}>{r.contact_no}</span>
                        <a href={`tel:${r.contact_no}`} title="Call" style={{ color: '#3b82f6', display: 'flex' }}><Phone size={12} /></a>
                        <button onClick={() => openWhatsApp(r.contact_no)} title="WhatsApp" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#25D366', display: 'flex', padding: 0 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </button>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#4b5563' }}>{r.ghornav || '—'}</td>
                    <td style={{ fontSize: '0.8125rem', color: '#4b5563' }}>{r.gothtra || '—'}</td>
                    <td style={{ fontSize: '0.8125rem', color: '#4b5563' }}>{r.place || '—'}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGES[r.status] || 'badge-secondary'}`}>{r.status}</span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {new Date(r.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                          className="form-control"
                          style={{ fontSize: '0.8rem', padding: '0.25rem', width: 120 }}
                          value={r.status}
                          onChange={e => updateStatus(r.id, e.target.value)}
                        >
                          {['New', 'Contacted', 'Closed'].map(s => <option key={s}>{s}</option>)}
                        </select>
                        <button className="btn btn-sm btn-danger" onClick={() => remove(r.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 540, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', marginTop: '2rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}><ChevronLeft size={18} /></button>
                {detail.name}
              </h2>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><User size={12}/> {detail.name}</span>
                {detail.place && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={12}/> {detail.place}</span>}
                <span style={{ color: '#94a3b8' }}>{new Date(detail.created_at).toLocaleDateString('en-IN')}</span>
              </div>
              {[
                ['Ghornav (Family Group)', detail.ghornav],
                ['Gothtra (Clan / Gotra)', detail.gothtra],
                ['Work / Organisation', detail.work_organization],
                ['Work Intro', detail.work_organization_intro],
                ['Place', detail.place],
                ['Pincode', detail.pincode],
                ['Contact No.', detail.contact_no],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} style={{ marginBottom: '0.625rem' }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.125rem' }}>{label}</p>
                  <p style={{ fontSize: '0.875rem', color: '#0f172a', margin: 0, whiteSpace: 'pre-wrap' }}>{value}</p>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <a href={`tel:${detail.contact_no}`} className="btn btn-sm btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                  <Phone size={12} /> Call
                </a>
                <button onClick={() => openWhatsApp(detail.contact_no)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, background: '#25D366', color: 'white', border: 'none', borderRadius: 7, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: '0.375rem 0' }}>
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TnConnect;
