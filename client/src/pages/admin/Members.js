import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';
import MembershipCard from '../../components/common/MembershipCard';
import ConfirmModal from '../../components/common/ConfirmModal';

const STATUS_BADGES = { Active: 'badge-success', Pending: 'badge-warning', Rejected: 'badge-danger', Expired: 'badge-secondary', Suspended: 'badge-danger' };

const Members = () => {
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', district: '' });
  const debSearch = useDebounce(search);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkSelected, setBulkSelected] = useState([]);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [cardData, setCardData] = useState(null);

  const load = useCallback((pg = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: pg, limit: 15 });
    if (debSearch) params.set('search', debSearch);
    if (filters.status) params.set('status', filters.status);
    if (filters.district) params.set('district', filters.district);
    api.get(`/members?${params}`)
      .then(r => { setMembers(r.data.data || []); setPagination(r.data.pagination || {}); })
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, [page, debSearch, filters]);

  useEffect(() => { setPage(1); }, [debSearch, filters]);
  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    try {
      await api.post(`/members/${id}/approve`);
      toast.success('Member approved');
      setBulkSelected(s => s.filter(x => x !== id));
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const reject = async (id) => {
    try {
      await api.post(`/members/${id}/reject`, { reason: rejectReason || 'Application rejected' });
      toast.success('Member rejected');
      setSelected(null);
      setRejectReason('');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/members/${deleteTarget.id}`);
      toast.success('Member deleted');
      setDeleteTarget(null);
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const handleBulkApprove = async () => {
    if (!bulkSelected.length) return;
    setBulkApproving(true);
    try {
      await api.post('/users/bulk-approve', { memberIds: bulkSelected });
      toast.success(`${bulkSelected.length} member(s) approved`);
      setBulkSelected([]);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Bulk approve failed'); }
    finally { setBulkApproving(false); }
  };

  const toggleBulkSelect = (id) => {
    setBulkSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const toggleSelectAll = () => {
    const pending = members.filter(m => m.status === 'Pending').map(m => m.id);
    setBulkSelected(s => s.length === pending.length ? [] : pending);
  };

  const viewCard = async (memberId) => {
    try {
      const res = await api.get(`/users/${memberId}/membership-card`);
      setCardData(res.data);
    } catch { toast.error('No active membership card found'); }
  };

  const pendingMembers = members.filter(m => m.status === 'Pending');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Member Management</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {bulkSelected.length > 0 && (
            <button className="btn btn-primary btn-sm" onClick={handleBulkApprove} disabled={bulkApproving}>
              {bulkApproving ? 'Approving...' : `✓ Approve ${bulkSelected.length} selected`}
            </button>
          )}
          <span className="badge badge-info">{pagination.total || 0} total</span>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '0.75rem' }}>
          <input className="form-control" placeholder="Search name, member no..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-control" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Status</option>
            {['Active', 'Pending', 'Rejected', 'Expired', 'Suspended'].map(s => <option key={s}>{s}</option>)}
          </select>
          <input className="form-control" placeholder="District" value={filters.district} onChange={e => setFilters(f => ({ ...f, district: e.target.value }))} />
          <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setFilters({ status: '', district: '' }); }}>Clear</button>
        </div>
      </div>

      {pendingMembers.length > 0 && (
        <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}>
            <input type="checkbox" checked={bulkSelected.length === pendingMembers.length && pendingMembers.length > 0} onChange={toggleSelectAll} />
            Select all pending ({pendingMembers.length})
          </label>
          {bulkSelected.length > 0 && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-light)' }}>{bulkSelected.length} selected</span>
          )}
        </div>
      )}

      <div className="admin-card">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 32 }}></th>
                  <th>Member No.</th><th>Name</th><th>Mobile</th><th>District</th>
                  <th>Membership Type</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>No members found</td></tr>
                ) : members.map(m => (
                  <tr key={m.id}>
                    <td>
                      {m.status === 'Pending' && (
                        <input type="checkbox" checked={bulkSelected.includes(m.id)} onChange={() => toggleBulkSelect(m.id)} />
                      )}
                    </td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{m.membership_number || '—'}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {m.photo_url ? <img src={m.photo_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{m.full_name.charAt(0)}</div>}
                        <span>{m.full_name}</span>
                      </div>
                    </td>
                    <td>{m.mobile_number}</td>
                    <td>{m.district || '—'}</td>
                    <td>{m.membership_type_name || '—'}</td>
                    <td><span className={`badge ${STATUS_BADGES[m.status] || 'badge-secondary'}`}>{m.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {m.status === 'Pending' && (
                          <>
                            <button className="btn btn-sm btn-primary" onClick={() => approve(m.id)}>Approve</button>
                            <button className="btn btn-sm btn-danger" onClick={() => setSelected(m)}>Reject</button>
                          </>
                        )}
                        {m.status === 'Active' && m.membership_number && (
                          <button className="btn btn-sm btn-outline" onClick={() => viewCard(m.id)}>🪪 Card</button>
                        )}
                        <button className="btn btn-sm btn-outline btn-danger" onClick={() => setDeleteTarget(m)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            {pagination.hasPrev && <button className="btn btn-sm btn-outline" onClick={() => setPage(p => p - 1)}>Previous</button>}
            <span style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}>Page {pagination.page} of {pagination.totalPages}</span>
            {pagination.hasNext && <button className="btn btn-sm btn-outline" onClick={() => setPage(p => p + 1)}>Next</button>}
          </div>
        )}
      </div>

      {/* Reject modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="card" style={{ width: 420, padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Reject Member: {selected.full_name}</h3>
            <div className="form-group">
              <label className="form-label">Reason for Rejection</label>
              <textarea className="form-control" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Provide a reason..." />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => { setSelected(null); setRejectReason(''); }}>Cancel</button>
              <button className="btn btn-danger" onClick={() => reject(selected.id)}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Member"
        message={`Permanently delete ${deleteTarget?.full_name}? This cannot be undone.`}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {cardData && <MembershipCard member={cardData} onClose={() => setCardData(null)} />}
    </div>
  );
};

export default Members;
