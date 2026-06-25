import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  Search, Filter, X, Check, Trash2, CreditCard, Users,
  ChevronLeft, ChevronRight, UserCheck, UserX, RefreshCw, SlidersHorizontal, Download, Eye,
} from 'lucide-react';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';
import MembershipCard from '../../components/common/MembershipCard';
import ConfirmModal from '../../components/common/ConfirmModal';

const STATUS_STYLE = {
  Active:    { bg: '#ecfdf5', color: '#059669' },
  Pending:   { bg: '#fffbeb', color: '#d97706' },
  Rejected:  { bg: '#fef2f2', color: '#dc2626' },
  Expired:   { bg: '#f9fafb', color: '#6b7280' },
  Suspended: { bg: '#fef2f2', color: '#dc2626' },
};

const Avatar = ({ name, photo }) => {
  if (photo) {
    return <img src={photo} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  }
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
      background: 'var(--primary)', color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.75rem', fontWeight: 700,
    }}>
      {name?.charAt(0).toUpperCase()}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{
      padding: '0.2rem 0.6rem', borderRadius: 999,
      fontSize: '0.6875rem', fontWeight: 600,
      background: s.bg, color: s.color,
      display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      {status}
    </span>
  );
};

const Members = () => {
  const [members, setMembers]         = useState([]);
  const [pagination, setPagination]   = useState({});
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filters, setFilters]         = useState({ status: '', district: '' });
  const [showFilters, setShowFilters] = useState(false);
  const debSearch                     = useDebounce(search);
  const [page, setPage]               = useState(1);
  const [selected, setSelected]       = useState(null);   // reject target
  const [rejectReason, setRejectReason] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkSelected, setBulkSelected] = useState([]);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [cardData, setCardData]         = useState(null);
  const [detailMember, setDetailMember] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback((pg = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: pg, limit: 15 });
    if (debSearch)       params.set('search',   debSearch);
    if (filters.status)  params.set('status',   filters.status);
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
      toast.success('Member approved successfully');
      setBulkSelected(s => s.filter(x => x !== id));
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to approve'); }
  };

  const reject = async (id) => {
    try {
      await api.post(`/members/${id}/reject`, { reason: rejectReason || 'Application rejected' });
      toast.success('Member rejected');
      setSelected(null); setRejectReason(''); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/members/${deleteTarget.id}`);
      toast.success('Member deleted');
      setDeleteTarget(null); load();
    } catch { toast.error('Failed to delete'); }
  };

  const handleBulkApprove = async () => {
    if (!bulkSelected.length) return;
    setBulkApproving(true);
    try {
      await api.post('/users/bulk-approve', { memberIds: bulkSelected });
      toast.success(`${bulkSelected.length} member(s) approved`);
      setBulkSelected([]); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Bulk approve failed'); }
    finally { setBulkApproving(false); }
  };

  const toggleBulkSelect = (id) =>
    setBulkSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

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

  const viewDetail = async (m) => {
    setDetailMember(m);
    setDetailLoading(true);
    try {
      const res = await api.get(`/members/${m.id}`);
      setDetailMember(res.data);
    } catch { /* use row data already set */ }
    finally { setDetailLoading(false); }
  };

  const clearFilters = () => { setSearch(''); setFilters({ status: '', district: '' }); };
  const hasFilters = search || filters.status || filters.district;
  const pendingMembers = members.filter(m => m.status === 'Pending');

  const exportCSV = async () => {
    try {
      const params = new URLSearchParams({ limit: 10000 });
      if (debSearch) params.set('search', debSearch);
      if (filters.status) params.set('status', filters.status);
      if (filters.district) params.set('district', filters.district);
      const r = await api.get(`/members?${params}`);
      const rows = r.data.data || [];
      const headers = ['Member No', 'Full Name', 'Mobile', 'Email', 'District', 'City', 'State', 'Gotra', 'Ghernov', 'Father Name', 'Mother Name', 'Spouse Name', 'Children Count', 'Membership Type', 'Status', 'Joined Date'];
      const csvRows = [headers, ...rows.map(m => [
        m.membership_number || '', m.full_name || '', m.mobile_number || '', m.email || '',
        m.district || '', m.city || '', m.state || '', m.gotra || '', m.ghernov || '',
        m.father_name || '', m.mother_name || '', m.spouse_name || '', m.children_count || '',
        m.membership_type_name || '', m.status || '',
        new Date(m.created_at).toLocaleDateString('en-IN'),
      ])].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `members_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Members exported to CSV (opens in Excel)');
    } catch { toast.error('Export failed'); }
  };

  return (
    <div>
      {/* ── Page Header ─────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111827', margin: 0 }}>Members</h1>
          <p style={{ fontSize: '0.8125rem', color: '#9ca3af', marginTop: 3 }}>
            {pagination.total ? `${pagination.total} total members` : 'Manage all community members'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={exportCSV}
            className="btn btn-sm btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <Download size={14} /> Export Excel
          </button>
        {bulkSelected.length > 0 && (
          <button
            className="btn btn-primary"
            onClick={handleBulkApprove}
            disabled={bulkApproving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {bulkApproving ? (
              <><span className="spinner-sm" /> Approving…</>
            ) : (
              <><UserCheck size={15} /> Approve {bulkSelected.length} selected</>
            )}
          </button>
        )}
        </div>
      </div>

      {/* ── Search & Filters ─────────────────────────── */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '1rem', overflow: 'hidden' }}>
        <div style={{ padding: '0.875rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
            <input
              className="form-control"
              placeholder="Search by name, member number…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem', paddingRight: search ? '2.25rem' : '0.875rem' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(f => !f)}
            className="btn btn-sm"
            style={{
              border: `1.5px solid ${showFilters ? 'var(--primary)' : '#e5e7eb'}`,
              color: showFilters ? 'var(--primary)' : '#4b5563',
              background: showFilters ? 'rgba(var(--primary-rgb),0.05)' : 'white',
              gap: '0.375rem',
            }}
          >
            <SlidersHorizontal size={14} />
            Filters
            {hasFilters && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', marginLeft: 2 }} />
            )}
          </button>

          {hasFilters && (
            <button onClick={clearFilters} className="btn btn-sm btn-ghost" style={{ gap: '0.375rem' }}>
              <RefreshCw size={13} /> Clear
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div
            style={{ padding: '0 1rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '0.75rem', borderTop: '1px solid #f9fafb' }}
          >
            <div style={{ paddingTop: '0.75rem' }}>
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
              >
                <option value="">All Statuses</option>
                {['Active', 'Pending', 'Rejected', 'Expired', 'Suspended'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div style={{ paddingTop: '0.75rem' }}>
              <label className="form-label">District</label>
              <input
                className="form-control"
                placeholder="Filter by district…"
                value={filters.district}
                onChange={e => setFilters(f => ({ ...f, district: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Select all pending banner ─────────────────── */}
      {pendingMembers.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.625rem 1rem', borderRadius: 8, marginBottom: '0.75rem',
          background: '#fffbeb', border: '1px solid #fde68a',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500, color: '#92400e' }}>
            <input
              type="checkbox"
              style={{ width: 15, height: 15, accentColor: 'var(--primary)' }}
              checked={bulkSelected.length === pendingMembers.length && pendingMembers.length > 0}
              onChange={toggleSelectAll}
            />
            {bulkSelected.length > 0
              ? `${bulkSelected.length} of ${pendingMembers.length} pending selected`
              : `Select all ${pendingMembers.length} pending members`}
          </label>
          <Users size={15} style={{ color: '#d97706' }} />
        </div>
      )}

      {/* ── Table ────────────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Loading members…</p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ width: 44, padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</span>
                    </th>
                    {['Member No.', 'Member', 'Age', 'Mobile', 'Ghernov', 'Gothtra', 'Father', 'Mother', 'Spouse', 'Children', 'District', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 0.625rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={14} style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <Users size={40} style={{ color: '#e5e7eb', margin: '0 auto 0.75rem' }} />
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', fontWeight: 500 }}>No members found</p>
                        <p style={{ color: '#d1d5db', fontSize: '0.8125rem', marginTop: 4 }}>Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : members.map(m => (
                    <tr
                      key={m.id}
                      style={{ borderBottom: '1px solid #f9fafb', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        {m.status === 'Pending' ? (
                          <input
                            type="checkbox"
                            checked={bulkSelected.includes(m.id)}
                            onChange={() => toggleBulkSelect(m.id)}
                            style={{ width: 15, height: 15, accentColor: 'var(--primary)', cursor: 'pointer' }}
                          />
                        ) : (
                          <span style={{ width: 15, height: 15, display: 'inline-block' }} />
                        )}
                      </td>

                      {/* Member No. */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#6b7280', background: '#f9fafb', padding: '0.2rem 0.5rem', borderRadius: 6 }}>
                          {m.membership_number || '—'}
                        </span>
                      </td>

                      {/* Name + avatar */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <Avatar name={m.full_name} photo={m.photo_url} />
                          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#111827' }}>{m.full_name}</span>
                        </div>
                      </td>

                      <td style={{ padding: '0.75rem 0.625rem', fontSize: '0.8rem', color: '#4b5563' }}>
                        {m.date_of_birth ? Math.floor((Date.now() - new Date(m.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)) + ' yrs' : '—'}
                      </td>
                      <td style={{ padding: '0.75rem 0.625rem', fontSize: '0.8rem', color: '#4b5563' }}>{m.mobile_number || '—'}</td>
                      <td style={{ padding: '0.75rem 0.625rem', fontSize: '0.8rem', color: '#4b5563' }}>{m.ghernov || '—'}</td>
                      <td style={{ padding: '0.75rem 0.625rem', fontSize: '0.8rem', color: '#4b5563' }}>{m.gotra || '—'}</td>
                      <td style={{ padding: '0.75rem 0.625rem', fontSize: '0.8rem', color: '#4b5563' }}>{m.father_name || '—'}</td>
                      <td style={{ padding: '0.75rem 0.625rem', fontSize: '0.8rem', color: '#4b5563' }}>{m.mother_name || '—'}</td>
                      <td style={{ padding: '0.75rem 0.625rem', fontSize: '0.8rem', color: '#4b5563' }}>{m.spouse_name || '—'}</td>
                      <td style={{ padding: '0.75rem 0.625rem', fontSize: '0.8rem', color: '#4b5563', textAlign: 'center' }}>{m.children_count ?? '—'}</td>
                      <td style={{ padding: '0.75rem 0.625rem', fontSize: '0.8rem', color: '#4b5563' }}>{m.district || '—'}</td>

                      {/* Status */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <StatusBadge status={m.status} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flexWrap: 'nowrap' }}>
                          {m.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => approve(m.id)}
                                title="Approve"
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 4,
                                  padding: '0.3125rem 0.625rem', borderRadius: 7,
                                  fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                                  background: '#ecfdf5', color: '#059669', transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.color = 'white'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#ecfdf5'; e.currentTarget.style.color = '#059669'; }}
                              >
                                <Check size={13} /> Approve
                              </button>
                              <button
                                onClick={() => setSelected(m)}
                                title="Reject"
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 4,
                                  padding: '0.3125rem 0.625rem', borderRadius: 7,
                                  fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                                  background: '#fef2f2', color: '#dc2626', transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                              >
                                <X size={13} /> Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => viewDetail(m)}
                            title="View Personal Info"
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '0.3125rem 0.625rem', borderRadius: 7,
                              fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                              background: '#f0fdf4', color: '#059669', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#059669'; }}
                          >
                            <Eye size={13} /> View
                          </button>
                          {m.status === 'Active' && m.membership_number && (
                            <button
                              onClick={() => viewCard(m.id)}
                              title="View Card"
                              style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '0.3125rem 0.625rem', borderRadius: 7,
                                fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                                background: '#eff6ff', color: '#3b82f6', transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.color = 'white'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#3b82f6'; }}
                            >
                              <CreditCard size={13} /> Card
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteTarget(m)}
                            title="Delete member"
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: 30, height: 30, borderRadius: 7,
                              border: 'none', cursor: 'pointer',
                              background: '#fef2f2', color: '#dc2626', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderTop: '1px solid #f9fafb' }}>
                <p style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
                  Showing {((pagination.page - 1) * 15) + 1}–{Math.min(pagination.page * 15, pagination.total)} of {pagination.total}
                </p>
                <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={!pagination.hasPrev}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb',
                      background: 'white', color: '#4b5563', cursor: pagination.hasPrev ? 'pointer' : 'not-allowed',
                      opacity: pagination.hasPrev ? 1 : 0.4, transition: 'all 0.15s',
                    }}
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', padding: '0 0.5rem' }}>
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!pagination.hasNext}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb',
                      background: 'white', color: '#4b5563', cursor: pagination.hasNext ? 'pointer' : 'not-allowed',
                      opacity: pagination.hasNext ? 1 : 0.4, transition: 'all 0.15s',
                    }}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Reject Modal ─────────────────────────────── */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div
            style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px -10px rgba(0,0,0,0.2)', animation: 'slideUp 0.2s ease-out' }}
          >
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserX size={17} style={{ color: '#dc2626' }} />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.9375rem' }}>Reject Application</p>
                <p style={{ fontSize: '0.8125rem', color: '#9ca3af', marginTop: 1 }}>{selected.full_name}</p>
              </div>
            </div>
            {/* Body */}
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Reason for Rejection</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Provide a clear reason for the applicant…"
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            {/* Footer */}
            <div style={{ padding: '0 1.5rem 1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => { setSelected(null); setRejectReason(''); }}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => reject(selected.id)}>
                <UserX size={15} /> Confirm Rejection
              </button>
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

      {/* ── Personal Info Detail Modal ─────────────── */}
      {detailMember && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 999, padding: '1.5rem', overflowY: 'auto', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 720, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', marginTop: '2rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {detailMember.photo_url
                  ? <img src={detailMember.photo_url} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                  : <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem' }}>{detailMember.full_name?.charAt(0)}</div>
                }
                <div>
                  <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{detailMember.full_name}</h2>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>{detailMember.membership_number || 'Pending'} · {detailMember.status}</p>
                </div>
              </div>
              <button onClick={() => setDetailMember(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.25rem' }}>✕</button>
            </div>
            {detailLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}><div className="spinner" /></div>
            ) : (
              <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {[
                  ['Full Name', detailMember.full_name],
                  ['Gender', detailMember.gender],
                  ['Date of Birth', detailMember.date_of_birth ? new Date(detailMember.date_of_birth).toLocaleDateString('en-IN') : null],
                  ['Mobile', detailMember.mobile_number],
                  ['Email', detailMember.email],
                  ['Gothtra', detailMember.gotra],
                  ['Ghernov', detailMember.ghernov],
                  ["Father's Name", detailMember.father_name],
                  ["Mother's Name", detailMember.mother_name],
                  ['Spouse Name', detailMember.spouse_name],
                  ['Wife Age', detailMember.wife_age],
                  ['Children Count', detailMember.children_count],
                  ['Occupation', detailMember.occupation],
                  ['Education', detailMember.education],
                  ['Address', detailMember.address],
                  ['District', detailMember.district],
                  ['City', detailMember.city],
                  ['Pincode', detailMember.pincode],
                  ['State', detailMember.state],
                  ['Reference By', detailMember.reference_by],
                  ['Membership Type', detailMember.membership_type_name],
                  ['Joined Date', new Date(detailMember.created_at).toLocaleDateString('en-IN')],
                ].filter(([, v]) => v != null && v !== '' && v !== 0).map(([label, value]) => (
                  <div key={label} style={{ background: '#f8fafc', borderRadius: 10, padding: '0.75rem 1rem' }}>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', margin: 0, wordBreak: 'break-word' }}>{String(value)}</p>
                  </div>
                ))}
                {detailMember.children_details && (() => {
                  try {
                    const kids = typeof detailMember.children_details === 'string' ? JSON.parse(detailMember.children_details) : detailMember.children_details;
                    if (!Array.isArray(kids) || !kids.length) return null;
                    return (
                      <div style={{ gridColumn: '1 / -1', background: '#f8fafc', borderRadius: 10, padding: '0.75rem 1rem' }}>
                        <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Children Details</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {kids.map((k, i) => (
                            <span key={i} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.25rem 0.75rem', fontSize: '0.8125rem', color: '#374151' }}>
                              {k.name || `Child ${i+1}`}{k.age ? ` (${k.age} yrs)` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  } catch { return null; }
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {cardData && <MembershipCard member={cardData} onClose={() => setCardData(null)} />}
    </div>
  );
};

export default Members;
