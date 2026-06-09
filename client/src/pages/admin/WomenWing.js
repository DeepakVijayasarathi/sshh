import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';
import ConfirmModal from '../../components/common/ConfirmModal';

const WomenWing = () => {
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const debSearch = useDebounce(search);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const limit = 20;

  const fetchMembers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit });
    if (debSearch) params.set('search', debSearch);
    if (districtFilter) params.set('district', districtFilter);
    api.get(`/women?${params}`)
      .then(r => { setMembers(r.data.data || []); setTotal(r.data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, debSearch, districtFilter]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);
  useEffect(() => { api.get('/women/stats').then(r => setStats(r.data)).catch(() => {}); }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/women/${deleteTarget.id}`);
      toast.success('Member removed');
      setDeleteTarget(null);
      fetchMembers();
    } catch { toast.error('Delete failed'); }
  };

  const openEdit = (m) => {
    setEditTarget(m);
    setEditForm({ fullName: m.full_name, mobileNumber: m.mobile_number || '', email: m.email || '', district: m.district || '', city: m.city || '', occupation: m.occupation || '', programInterest: m.program_interest || '', status: m.status || (m.is_active ? 'Active' : 'Inactive') });
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await api.put(`/women/${editTarget.id}`, editForm);
      toast.success('Member updated');
      setEditTarget(null);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const totalPages = Math.ceil(total / limit);
  const setEf = (f) => (e) => setEditForm(prev => ({ ...prev, [f]: e.target.value }));

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Women Wing Management</h1>
        <p className="text-muted">Manage women wing members and programs</p>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="card-body">
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#c2185b' }}>{stats.totalActive}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-light)' }}>Active Members</div>
            </div>
          </div>
          {stats.byDistrict?.slice(0, 4).map(d => (
            <div key={d.district} className="card" style={{ textAlign: 'center' }}>
              <div className="card-body">
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#c2185b' }}>{d.count}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-light)' }}>{d.district}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input className="form-control" style={{ width: 220 }} placeholder="Search by name, email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <input className="form-control" style={{ width: 160 }} placeholder="Filter district..." value={districtFilter} onChange={e => { setDistrictFilter(e.target.value); setPage(1); }} />
          <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setDistrictFilter(''); setPage(1); }}>Clear</button>
          <span style={{ marginLeft: 'auto', lineHeight: '38px', color: 'var(--text-light)', fontSize: '0.875rem' }}>{total} members</span>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : members.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: '3rem' }}>No women members found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>District / City</th>
                  <th>Occupation</th>
                  <th>Program Interest</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 500 }}>{m.full_name}</td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>{m.mobile_number}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{m.email}</div>
                    </td>
                    <td>{m.district}{m.city && `, ${m.city}`}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{m.occupation || '—'}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-light)', maxWidth: 160 }}>{m.program_interest?.substring(0, 50) || '—'}</td>
                    <td><span className={`badge ${m.is_active ? 'badge-success' : 'badge-secondary'}`}>{m.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-light)' }}>{m.created_at ? new Date(m.created_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(m)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(m)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1.25rem', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>Page {page} of {totalPages}</span>
            <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div className="modal-overlay" onClick={() => setEditTarget(null)}>
          <div className="modal-content card" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="card-header">Edit Women Member — {editTarget.full_name}</div>
            <div className="card-body">
              <div className="grid grid-2">
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-control" value={editForm.fullName} onChange={setEf('fullName')} /></div>
                <div className="form-group"><label className="form-label">Mobile</label><input className="form-control" value={editForm.mobileNumber} onChange={setEf('mobileNumber')} /></div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={editForm.email} onChange={setEf('email')} /></div>
                <div className="form-group"><label className="form-label">District</label><input className="form-control" value={editForm.district} onChange={setEf('district')} /></div>
                <div className="form-group"><label className="form-label">City</label><input className="form-control" value={editForm.city} onChange={setEf('city')} /></div>
                <div className="form-group"><label className="form-label">Status</label>
                  <select className="form-control" value={editForm.status || 'Active'} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Occupation</label><input className="form-control" value={editForm.occupation} onChange={setEf('occupation')} /></div>
              <div className="form-group"><label className="form-label">Program Interest</label><input className="form-control" value={editForm.programInterest} onChange={setEf('programInterest')} /></div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setEditTarget(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Remove Women Member"
        message={`Remove ${deleteTarget?.full_name} from Women Wing? This cannot be undone.`}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default WomenWing;
