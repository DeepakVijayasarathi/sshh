import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Phone, Globe, Eye, EyeOff, X } from 'lucide-react';
import api from '../../services/api';

const STATUS_BADGES = { Active: 'badge-success', Pending: 'badge-warning', Rejected: 'badge-danger', Suspended: 'badge-secondary' };

const openWhatsApp = (number) => {
  const cleaned = (number || '').replace(/\D/g, '');
  const phone = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
  window.open(`https://wa.me/${phone}`, '_blank');
};

const EMPTY_FORM = { businessName: '', ownerName: '', categoryId: '', mobileNumber: '', email: '', address: '', city: '', website: '', description: '' };

const Businesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [detail, setDetail] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [logo, setLogo] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 100 });
    params.set('status', status || 'all');
    if (category) params.set('category', category);
    api.get(`/businesses?${params}`)
      .then(r => setBusinesses(r.data.data || []))
      .catch(err => { console.error('Businesses load error:', err); setBusinesses([]); })
      .finally(() => setLoading(false));
  }, [status, category]);

  useEffect(() => {
    api.get('/businesses/categories').then(r => setCategories(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    try { await api.post(`/businesses/${id}/approve`); toast.success('Business approved'); load(); }
    catch { toast.error('Failed to approve'); }
  };

  const toggleVisibility = async (b) => {
    try {
      await api.put(`/businesses/${b.id}`, {
        businessName: b.business_name, ownerName: b.owner_name,
        categoryId: b.category_id, mobileNumber: b.mobile_number,
        email: b.email, address: b.address, city: b.city,
        website: b.website, description: b.description,
        isFeatured: b.is_featured ? 'true' : 'false',
      });
      toast.success('Updated');
      load();
    } catch { toast.error('Failed'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this business?')) return;
    try { await api.delete(`/businesses/${id}`); toast.success('Deleted'); if (detail?.id === id) setDetail(null); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (logo) fd.append('logo', logo);
      await api.post('/businesses', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Business added successfully');
      setShowForm(false); setForm(EMPTY_FORM); setLogo(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Business Directory</h1>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="form-control" style={{ width: 160 }} value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Status</option>
            {['Active','Pending','Rejected','Suspended'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-control" style={{ width: 180 }} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Types</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(f => !f)}>+ Add Business</button>
        </div>
      </div>

      {/* Add Business Form */}
      {showForm && (
        <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600, margin: 0 }}>Add Business</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
          </div>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 1rem' }}>
              <div className="form-group"><label className="form-label">Business Name *</label><input className="form-control" required value={form.businessName} onChange={setF('businessName')} /></div>
              <div className="form-group"><label className="form-label">Owner Name *</label><input className="form-control" required value={form.ownerName} onChange={setF('ownerName')} /></div>
              <div className="form-group"><label className="form-label">Category</label>
                <select className="form-control" value={form.categoryId} onChange={setF('categoryId')}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Mobile Number</label><input className="form-control" value={form.mobileNumber} onChange={setF('mobileNumber')} placeholder="10-digit number" /></div>
              <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={setF('email')} /></div>
              <div className="form-group"><label className="form-label">City</label><input className="form-control" value={form.city} onChange={setF('city')} /></div>
              <div className="form-group"><label className="form-label">Website URL</label><input type="url" className="form-control" value={form.website} onChange={setF('website')} placeholder="https://..." /></div>
              <div className="form-group"><label className="form-label">Logo</label><input type="file" className="form-control" accept="image/*" onChange={e => setLogo(e.target.files[0])} /></div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Address</label><input className="form-control" value={form.address} onChange={setF('address')} /></div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Description</label><textarea className="form-control" rows={2} value={form.description} onChange={setF('description')} /></div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Add Business'}</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Business</th><th>Owner</th><th>Type</th><th>Mobile</th><th>URL Link</th><th>City</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {businesses.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-light)' }}>
                    No businesses found. Use "Add Business" to create one.
                  </td></tr>
                ) : businesses.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        {b.logo_url
                          ? <img src={b.logo_url} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
                          : <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>{b.business_name?.charAt(0)}</div>
                        }
                        {b.business_name}
                      </div>
                    </td>
                    <td>{b.owner_name}</td>
                    <td>{b.category_name || '—'}</td>
                    <td>
                      {b.mobile_number ? (
                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8125rem' }}>{b.mobile_number}</span>
                          <a href={`tel:${b.mobile_number}`} title="Call" style={{ color: '#3b82f6', display: 'flex' }}><Phone size={12} /></a>
                          <button onClick={() => openWhatsApp(b.mobile_number)} title="WhatsApp" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#25D366', display: 'flex', padding: 0 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          </button>
                        </div>
                      ) : '—'}
                    </td>
                    <td>
                      {b.website ? (
                        <a href={b.website} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 500 }}>
                          <Globe size={12} /> Visit
                        </a>
                      ) : '—'}
                    </td>
                    <td>{b.city || '—'}</td>
                    <td><span className={`badge ${STATUS_BADGES[b.status] || 'badge-secondary'}`}>{b.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'nowrap', alignItems: 'center' }}>
                        {b.status === 'Pending' && (
                          <button className="btn btn-sm btn-primary" onClick={() => approve(b.id)}>Approve</button>
                        )}
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => setDetail(b)}
                          title="View Details"
                        >View</button>
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

      {/* Detail Modal */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 600, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', marginTop: '2rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {detail.logo_url
                  ? <img src={detail.logo_url} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />
                  : <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{detail.business_name?.charAt(0)}</div>
                }
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{detail.business_name}</h2>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>{detail.category_name || '—'} · <span className={`badge ${STATUS_BADGES[detail.status] || 'badge-secondary'}`}>{detail.status}</span></p>
                </div>
              </div>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.25rem' }}>✕</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              {[
                ['Owner', detail.owner_name],
                ['Mobile', detail.mobile_number],
                ['Email', detail.email],
                ['City', detail.city],
                ['Address', detail.address],
                ['Website', detail.website],
                ['Description', detail.description],
              ].filter(([,v]) => v).map(([k, v]) => (
                <div key={k} style={{ background: '#f8fafc', borderRadius: 10, padding: '0.75rem', gridColumn: k === 'Address' || k === 'Description' ? '1 / -1' : undefined }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{k}</p>
                  {k === 'Website'
                    ? <a href={v} target="_blank" rel="noreferrer" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 500 }}>{v}</a>
                    : <p style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500, margin: 0 }}>{v}</p>
                  }
                </div>
              ))}
              {detail.mobile_number && (
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem' }}>
                  <a href={`tel:${detail.mobile_number}`} className="btn btn-sm btn-outline" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={14} /> Call
                  </a>
                  <button onClick={() => openWhatsApp(detail.mobile_number)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#25D366', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', padding: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Businesses;
