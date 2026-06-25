import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Search, Phone, MessageCircle, X, Send, ChevronLeft, MapPin, User, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const CATEGORIES = [
  'Culture and Heritage', 'Community Welfare', 'Women Empowerment',
  'Youth Development', 'Senior Citizen Support', 'Education', 'Employment',
];

const STATUS_BADGES = {
  Pending:        'badge-warning',
  Approved:       'badge-info',
  'Under Review': 'badge-info',
  Resolved:       'badge-success',
  Closed:         'badge-secondary',
};

const openWhatsApp = (number) => {
  const cleaned = number.replace(/\D/g, '');
  const phone = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
  window.open(`https://wa.me/${phone}`, '_blank');
};

const Forum = () => {
  const [issues, setIssues]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter]       = useState('');
  const [search, setSearch]             = useState('');

  // Detail modal
  const [detail, setDetail]           = useState(null);
  const [detailComments, setDetailComments] = useState([]);
  const [loadingDetail, setLoadingDetail]   = useState(false);
  const [commentText, setCommentText]       = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 100, include_pending: 'true' });
    if (statusFilter) params.set('status', statusFilter);
    if (catFilter)    params.set('category', catFilter);
    api.get(`/forums/issues?${params}`)
      .then(r => setIssues(r.data.data || []))
      .catch(() => setIssues([]))
      .finally(() => setLoading(false));
  }, [statusFilter, catFilter]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (issue) => {
    setDetail(issue);
    setDetailComments([]);
    setCommentText('');
    setLoadingDetail(true);
    try {
      const res = await api.get(`/forums/issues/${issue.id}`);
      setDetailComments(res.data.comments || []);
    } catch { toast.error('Could not load issue details'); }
    finally { setLoadingDetail(false); }
  };

  const updateStatus = async (id, s) => {
    try {
      await api.put(`/forums/issues/${id}/status`, { status: s });
      toast.success('Status updated');
      load();
      if (detail?.id === id) setDetail(prev => ({ ...prev, status: s }));
    } catch { toast.error('Failed to update status'); }
  };

  const approveIssue = async (id) => {
    try {
      await api.put(`/forums/issues/${id}/status`, { status: 'Under Review' });
      toast.success('Issue approved — now Under Review');
      load();
      if (detail?.id === id) setDetail(prev => ({ ...prev, status: 'Under Review' }));
    } catch { toast.error('Failed to approve'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this issue?')) return;
    try {
      await api.delete(`/forums/issues/${id}`);
      toast.success('Issue deleted');
      if (detail?.id === id) setDetail(null);
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const handleAdminComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await api.post(`/forums/issues/${detail.id}/comments`, { comment: commentText });
      toast.success('Reply added');
      setCommentText('');
      const res = await api.get(`/forums/issues/${detail.id}`);
      setDetailComments(res.data.comments || []);
    } catch { toast.error('Failed to add reply'); }
    finally { setSubmittingComment(false); }
  };

  // client-side search filter
  const filtered = issues.filter(i => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      i.issue_title?.toLowerCase().includes(q) ||
      i.name?.toLowerCase().includes(q) ||
      i.contact_number?.includes(q) ||
      i.location?.toLowerCase().includes(q)
    );
  });

  const statCounts = {
    Pending: issues.filter(i => i.status === 'Pending').length,
    'Under Review': issues.filter(i => i.status === 'Under Review').length,
    Resolved: issues.filter(i => i.status === 'Resolved').length,
    Closed: issues.filter(i => i.status === 'Closed').length,
  };

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Community Forum</h1>
        <span style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>{filtered.length} issue{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Stats overview ── */}
      <div className="forum-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {Object.entries(statCounts).map(([label, count]) => (
          <div key={label} className="admin-card" style={{ padding: '0.875rem 1rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{label}</p>
            <p style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0 0' }}>{count}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
          <input
            className="form-control"
            placeholder="Search title, name, contact…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        <select className="form-control" style={{ width: 165 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {['Pending','Under Review','Resolved','Closed'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="form-control" style={{ width: 200 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(search || statusFilter || catFilter) && (
          <button className="btn btn-sm btn-ghost" onClick={() => { setSearch(''); setStatusFilter(''); setCatFilter(''); }} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="admin-card">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Issue Title</th>
                  <th>Contact Person</th>
                  <th>Contact No.</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-light)' }}>
                      No issues found
                    </td>
                  </tr>
                ) : filtered.map(issue => (
                  <tr key={issue.id}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ fontWeight: 500, maxWidth: 220 }}>
                      <button
                        onClick={() => openDetail(issue)}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', color: 'var(--primary,#8B0000)', fontWeight: 600, fontSize: '0.8125rem' }}
                      >
                        {issue.issue_title.length > 45 ? issue.issue_title.slice(0, 45) + '…' : issue.issue_title}
                      </button>
                      {issue.comment_count > 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.7rem', color: '#94a3b8', marginLeft: 6 }}>
                          <MessageCircle size={10} /> {issue.comment_count}
                        </span>
                      )}
                    </td>
                    <td>{issue.name || '—'}</td>
                    <td>
                      {issue.contact_number ? (
                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8125rem' }}>{issue.contact_number}</span>
                          <a href={`tel:${issue.contact_number}`} title="Call" style={{ color: '#3b82f6', display: 'flex' }}><Phone size={12} /></a>
                          <button onClick={() => openWhatsApp(issue.contact_number)} title="WhatsApp" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#25D366', display: 'flex', padding: 0 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          </button>
                        </div>
                      ) : '—'}
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{issue.category || '—'}</span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#4b5563' }}>{issue.location || '—'}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGES[issue.status] || 'badge-secondary'}`}>{issue.status}</span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {new Date(issue.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {issue.status === 'Pending' ? (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => approveIssue(issue.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <CheckCircle size={12} /> Approve
                          </button>
                        ) : (
                          <select
                            className="form-control"
                            style={{ fontSize: '0.8rem', padding: '0.25rem', width: 130 }}
                            value={issue.status}
                            onChange={e => updateStatus(issue.id, e.target.value)}
                          >
                            {['Under Review','Resolved','Closed'].map(s => <option key={s}>{s}</option>)}
                          </select>
                        )}
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => openDetail(issue)}
                          title="View Details"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          View
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => remove(issue.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 740, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', marginTop: '2rem', marginBottom: '2rem' }}>
            {/* Modal header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                  <span className={`badge ${STATUS_BADGES[detail.status] || 'badge-secondary'}`}>{detail.status}</span>
                  {detail.category && <span className="badge badge-info">{detail.category}</span>}
                </div>
                <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.35 }}>{detail.issue_title}</h2>
              </div>
              <button onClick={() => { setDetail(null); setDetailComments([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0.25rem', flexShrink: 0 }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <div className="forum-modal-body" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 220px', gap: '1.25rem' }}>
              {/* Left: Description + Comments */}
              <div>
                {/* Meta */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><User size={12}/> {detail.name}</span>
                  {detail.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={12}/> {detail.location}</span>}
                  <span style={{ color: '#94a3b8' }}>{new Date(detail.created_at).toLocaleDateString('en-IN')}</span>
                </div>

                {/* Image */}
                {detail.picture_url && (
                  <img src={detail.picture_url} alt="Issue" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 10, marginBottom: '1rem' }} />
                )}

                {/* Description */}
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.75, margin: 0 }}>{detail.issue_description}</p>
                </div>

                {/* Status change */}
                <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Update Status:</label>
                  <select className="form-control" style={{ width: 160, fontSize: '0.8125rem' }} value={detail.status} onChange={e => updateStatus(detail.id, e.target.value)}>
                    {['Pending','Under Review','Resolved','Closed'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                {/* Comments */}
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageCircle size={14} /> Replies / Comments {detailComments.length > 0 && `(${detailComments.length})`}
                  </h4>
                  {loadingDetail ? (
                    <div style={{ textAlign: 'center', padding: '1rem' }}><div className="spinner" /></div>
                  ) : detailComments.length === 0 ? (
                    <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.75rem' }}>No comments yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '0.75rem' }}>
                      {detailComments.map(c => (
                        <div key={c.id} style={{ background: '#f8fafc', borderRadius: 8, padding: '0.75rem', borderLeft: '3px solid var(--primary,#8B0000)' }}>
                          <p style={{ fontSize: '0.8125rem', color: '#374151', marginBottom: '0.25rem' }}>{c.comment}</p>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '0.5rem' }}>
                            {c.user_email && <span>{c.user_email}</span>}
                            <span>{new Date(c.created_at).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <form onSubmit={handleAdminComment} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      className="form-control"
                      placeholder="Add admin reply or note…"
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      style={{ flex: 1, fontSize: '0.875rem' }}
                    />
                    <button type="submit" className="btn btn-primary btn-sm" disabled={submittingComment || !commentText.trim()} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Send size={13} /> Reply
                    </button>
                  </form>
                </div>
              </div>

              {/* Right sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {/* Contact */}
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '1rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>Contact</p>
                  {detail.name && (
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.375rem' }}>{detail.name}</p>
                  )}
                  {detail.contact_number ? (
                    <>
                      <p style={{ fontSize: '0.8125rem', color: '#374151', marginBottom: '0.75rem' }}>{detail.contact_number}</p>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <a href={`tel:${detail.contact_number}`} className="btn btn-sm btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                          <Phone size={12} /> Call
                        </a>
                        <button onClick={() => openWhatsApp(detail.contact_number)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, background: '#25D366', color: 'white', border: 'none', borderRadius: 7, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: '0.375rem 0' }}>
                          WhatsApp
                        </button>
                      </div>
                    </>
                  ) : <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>No contact provided</p>}
                </div>

                {/* Info */}
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '1rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>Details</p>
                  {[
                    ['Forum', detail.forum_name || '—'],
                    ['Location', detail.location || '—'],
                    ['Category', detail.category || '—'],
                    ['Date', new Date(detail.created_at).toLocaleDateString('en-IN')],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.25rem 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>{k}</span>
                      <span style={{ color: '#0f172a', fontWeight: 500, maxWidth: 120, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Danger */}
                <button className="btn btn-sm btn-danger" onClick={() => remove(detail.id)} style={{ width: '100%' }}>
                  Delete Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .forum-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .forum-modal-body { grid-template-columns: 1fr !important; padding: 1rem !important; }
        }
      `}</style>
    </div>
  );
};

export default Forum;
