import React, { useState, useEffect } from 'react';
import { MapPin, Phone, MessageCircle, Search, Filter, ChevronLeft, Image as ImageIcon, Send, User } from 'lucide-react';
import { toast } from 'react-toastify';
import PublicLayout from '../../components/common/PublicLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CATEGORIES = [
  'All',
  'Culture and Heritage',
  'Community Welfare',
  'Women Empowerment',
  'Youth Development',
  'Senior Citizen Support',
  'Education',
  'Employment',
];

const STATUS_COLORS = {
  Pending:      { badge: '#fef3c7', text: '#b45309' },
  'Under Review': { badge: '#dbeafe', text: '#1d4ed8' },
  Resolved:     { badge: '#dcfce7', text: '#15803d' },
  Closed:       { badge: '#f1f5f9', text: '#64748b' },
};

const CAT_COLORS = {
  'Culture and Heritage':    '#8B0000',
  'Community Welfare':       '#059669',
  'Women Empowerment':       '#be185d',
  'Youth Development':       '#2563eb',
  'Senior Citizen Support':  '#7c3aed',
  'Education':               '#0891b2',
  'Employment':              '#d97706',
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || { badge: '#f1f5f9', text: '#64748b' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: s.badge, color: s.text,
      fontSize: '0.6875rem', fontWeight: 700,
      padding: '3px 10px', borderRadius: 20,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.text }} />
      {status}
    </span>
  );
};

const openWhatsApp = (number) => {
  const cleaned = number.replace(/\D/g, '');
  const phone = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
  window.open(`https://wa.me/${phone}`, '_blank');
};

const Forum = () => {
  const { user } = useAuth();
  const [issues, setIssues]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [comments, setComments]   = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [search, setSearch]       = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('');
  const [commentText, setCommentText]   = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [form, setForm] = useState({
    forumName: '', name: '', location: '',
    issueTitle: '', issueDescription: '',
    contactNumber: '', category: '',
  });
  const [picture, setPicture] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 50 });
    if (statusFilter) params.set('status', statusFilter);
    if (catFilter && catFilter !== 'All') params.set('category', catFilter);
    api.get(`/forums/issues?${params}`)
      .then(r => setIssues(r.data.data || []))
      .catch(() => setIssues([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter, catFilter]);

  const openIssue = async (issue) => {
    setSelected(issue);
    setLoadingDetail(true);
    setComments([]);
    try {
      const res = await api.get(`/forums/issues/${issue.id}`);
      setComments(res.data.comments || []);
    } catch { toast.error('Could not load issue details'); }
    finally { setLoadingDetail(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (picture) fd.append('picture', picture);
      await api.post('/forums/issues', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Issue submitted! Admin will review shortly.');
      setShowForm(false);
      setForm({ forumName: '', name: '', location: '', issueTitle: '', issueDescription: '', contactNumber: '', category: '' });
      setPicture(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit issue');
    } finally { setSubmitting(false); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) { toast.info('Please sign in to comment'); return; }
    setSubmittingComment(true);
    try {
      await api.post(`/forums/issues/${selected.id}/comments`, { comment: commentText });
      toast.success('Comment added');
      setCommentText('');
      const res = await api.get(`/forums/issues/${selected.id}`);
      setComments(res.data.comments || []);
    } catch { toast.error('Failed to add comment'); }
    finally { setSubmittingComment(false); }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const filtered = issues.filter(i =>
    !search ||
    i.issue_title.toLowerCase().includes(search.toLowerCase()) ||
    (i.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PublicLayout>
      <div className="page-header">
        <div className="container">
          <h1>Community Forum</h1>
          <p>Raise community issues and find solutions together</p>
        </div>
      </div>

      <section className="section">
        <div className="container">

          {/* ── Detail View ── */}
          {selected ? (
            <div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => { setSelected(null); setComments([]); setCommentText(''); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: '1.5rem' }}
              >
                <ChevronLeft size={15} /> Back to Issues
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
                {/* Main */}
                <div>
                  <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '1.75rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
                      <StatusBadge status={selected.status} />
                      {selected.category && (
                        <span style={{ background: `${CAT_COLORS[selected.category] || '#8B0000'}18`, color: CAT_COLORS[selected.category] || '#8B0000', fontSize: '0.6875rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                          {selected.category}
                        </span>
                      )}
                    </div>

                    <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', lineHeight: 1.35 }}>{selected.issue_title}</h2>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.25rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <User size={13} /> {selected.name}
                      </span>
                      {selected.location && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <MapPin size={13} /> {selected.location}
                        </span>
                      )}
                      <span style={{ color: '#94a3b8' }}>{new Date(selected.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>

                    {selected.picture_url && (
                      <img
                        src={selected.picture_url} alt="Issue"
                        style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 12, marginBottom: '1.25rem' }}
                      />
                    )}

                    <p style={{ lineHeight: 1.85, color: '#374151', fontSize: '0.9375rem' }}>{selected.issue_description}</p>
                  </div>

                  {/* Comments */}
                  <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                      <MessageCircle size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                      Comments {comments.length > 0 && `(${comments.length})`}
                    </h3>
                    {loadingDetail ? (
                      <div style={{ textAlign: 'center', padding: '1rem' }}><div className="spinner" /></div>
                    ) : comments.length === 0 ? (
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No comments yet. Be the first to respond.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        {comments.map(c => (
                          <div key={c.id} style={{ background: '#f8fafc', borderRadius: 10, padding: '0.875rem 1rem', borderLeft: '3px solid var(--primary,#8B0000)' }}>
                            <p style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.375rem', lineHeight: 1.6 }}>{c.comment}</p>
                            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                              {c.user_email && <span>{c.user_email.split('@')[0]}</span>}
                              <span>{new Date(c.created_at).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment form */}
                    {user ? (
                      <form onSubmit={handleComment} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <input
                          className="form-control"
                          placeholder="Add a comment or update…"
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn btn-primary" disabled={submittingComment || !commentText.trim()} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Send size={14} /> Post
                        </button>
                      </form>
                    ) : (
                      <p style={{ fontSize: '0.8125rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '0.875rem', marginTop: '0.75rem' }}>
                        <a href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</a> to add a comment.
                      </p>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Contact card */}
                  {(selected.name || selected.contact_number) && (
                    <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #f1f5f9', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                      <h4 style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', marginBottom: '0.875rem' }}>Contact Details</h4>
                      {selected.name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.625rem', fontSize: '0.875rem', color: '#374151' }}>
                          <User size={14} style={{ color: '#94a3b8' }} /> {selected.name}
                        </div>
                      )}
                      {selected.contact_number && (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.875rem', fontSize: '0.875rem', color: '#374151' }}>
                            <Phone size={14} style={{ color: '#94a3b8' }} /> {selected.contact_number}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <a
                              href={`tel:${selected.contact_number}`}
                              className="btn btn-sm btn-outline"
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                            >
                              <Phone size={13} /> Call
                            </a>
                            <button
                              onClick={() => openWhatsApp(selected.contact_number)}
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#25D366', color: 'white', border: 'none', borderRadius: 8, padding: '0.375rem 0.75rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              WhatsApp
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Issue meta */}
                  <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #f1f5f9', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', marginBottom: '0.875rem' }}>Issue Info</h4>
                    {[
                      ['Status', <StatusBadge status={selected.status} />],
                      ['Category', selected.category || '—'],
                      ['Location', selected.location || '—'],
                      ['Forum', selected.forum_name || '—'],
                      ['Posted', new Date(selected.created_at).toLocaleDateString('en-IN')],
                      ['Comments', comments.length],
                    ].map(([label, val]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.375rem 0', borderBottom: '1px solid #f8fafc', fontSize: '0.8125rem' }}>
                        <span style={{ color: '#64748b' }}>{label}</span>
                        <span style={{ fontWeight: 500, color: '#0f172a' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ── Toolbar ── */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                  <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    className="form-control"
                    placeholder="Search issues or names…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>
                <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  {['Pending','Under Review','Resolved','Closed'].map(s => <option key={s}>{s}</option>)}
                </select>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ whiteSpace: 'nowrap' }}>
                  {showForm ? 'Cancel' : '+ Raise an Issue'}
                </button>
              </div>

              {/* ── Category Tabs ── */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCatFilter(cat)}
                    style={{
                      padding: '0.375rem 0.875rem', borderRadius: 20, border: 'none', cursor: 'pointer',
                      fontSize: '0.8125rem', fontWeight: 500, transition: 'all 0.15s',
                      background: catFilter === cat ? 'var(--primary,#8B0000)' : '#f1f5f9',
                      color: catFilter === cat ? 'white' : '#64748b',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* ── Submit Issue Form ── */}
              {showForm && (
                <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '1.75rem', marginBottom: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Report a Community Issue</h3>
                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '0 1.25rem' }}>
                      <div className="form-group">
                        <label className="form-label">Your Name <span style={{ color: '#ef4444' }}>*</span></label>
                        <input className="form-control" value={form.name} onChange={set('name')} required placeholder="Full name" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Contact Number</label>
                        <input className="form-control" value={form.contactNumber} onChange={set('contactNumber')} placeholder="Mobile number" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Forum / Area Name</label>
                        <input className="form-control" value={form.forumName} onChange={set('forumName')} placeholder="e.g. Madurai Sourashtra Forum" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Location</label>
                        <input className="form-control" value={form.location} onChange={set('location')} placeholder="City / Area" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Category <span style={{ color: '#ef4444' }}>*</span></label>
                        <select className="form-control" value={form.category} onChange={set('category')} required>
                          <option value="">Select category</option>
                          {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Attach Photo</label>
                        <input type="file" className="form-control" accept="image/*" onChange={e => setPicture(e.target.files[0])} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Issue Title <span style={{ color: '#ef4444' }}>*</span></label>
                      <input className="form-control" value={form.issueTitle} onChange={set('issueTitle')} required placeholder="Brief title of the issue" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Issue Description <span style={{ color: '#ef4444' }}>*</span></label>
                      <textarea className="form-control" rows={4} value={form.issueDescription} onChange={set('issueDescription')} required placeholder="Describe the issue in detail…" style={{ resize: 'vertical' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Submitting…' : 'Submit Issue'}
                    </button>
                  </form>
                </div>
              )}

              {/* ── Issues List ── */}
              {loading ? (
                <div className="loading-center"><div className="spinner" /></div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
                  <Filter size={40} style={{ margin: '0 auto 1rem', display: 'block', color: '#e2e8f0' }} />
                  <p style={{ fontWeight: 500 }}>No issues found</p>
                  <p style={{ fontSize: '0.875rem', marginTop: 4 }}>Try a different filter or be the first to raise one</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {filtered.map(issue => {
                    const catColor = CAT_COLORS[issue.category] || '#8B0000';
                    return (
                      <div
                        key={issue.id}
                        onClick={() => openIssue(issue)}
                        style={{
                          background: 'white', borderRadius: 14,
                          border: '1.5px solid #f1f5f9',
                          boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                          cursor: 'pointer', transition: 'all 0.15s',
                          overflow: 'hidden',
                          display: 'flex',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.10)'; e.currentTarget.style.borderColor = 'var(--primary,#8B0000)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                      >
                        {/* Category stripe */}
                        <div style={{ width: 4, background: catColor, flexShrink: 0 }} />

                        {/* Content */}
                        <div style={{ flex: 1, padding: '1rem 1.25rem', minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                            <StatusBadge status={issue.status} />
                            {issue.category && (
                              <span style={{ background: `${catColor}18`, color: catColor, fontSize: '0.6875rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                                {issue.category}
                              </span>
                            )}
                          </div>
                          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.375rem', lineHeight: 1.4 }}>
                            {issue.issue_title}
                          </h3>
                          <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', fontSize: '0.78rem', color: '#64748b' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <User size={11} /> {issue.name}
                            </span>
                            {issue.location && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <MapPin size={11} /> {issue.location}
                              </span>
                            )}
                            {issue.contact_number && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Phone size={11} /> {issue.contact_number}
                              </span>
                            )}
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <MessageCircle size={11} /> {issue.comment_count || 0} comments
                            </span>
                          </div>
                        </div>

                        {/* Right: image + date */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', padding: '1rem 1.25rem 1rem 0', flexShrink: 0 }}>
                          {issue.picture_url ? (
                            <img src={issue.picture_url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, marginBottom: '0.5rem' }} />
                          ) : (
                            <div style={{ width: 64, height: 64, borderRadius: 8, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                              <ImageIcon size={20} color="#d1d5db" />
                            </div>
                          )}
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                            {new Date(issue.created_at).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .forum-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PublicLayout>
  );
};

export default Forum;
