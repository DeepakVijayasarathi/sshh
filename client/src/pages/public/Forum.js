import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, Briefcase, Calendar, Users, CheckCircle2, Globe, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';

const CATEGORIES = ['Culture and Heritage', 'Community Welfare', 'Women Empowerment', 'Youth Development', 'Senior Citizen Support', 'Education', 'Employment'];
const STATUS_COLORS = { Pending: 'badge-warning', 'Under Review': 'badge-info', Resolved: 'badge-success', Closed: 'badge-secondary' };

const Forum = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ forumName: '', name: '', location: '', issueTitle: '', issueDescription: '', contactNumber: '', category: '' });
  const [picture, setPicture] = useState(null);

  const load = () => {
    api.get('/forums/issues?limit=20').then(r => setIssues(r.data.data || [])).catch(() => setIssues([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openIssue = async (issue) => {
    setSelected(issue);
    const res = await api.get(`/forums/issues/${issue.id}`);
    setComments(res.data.comments || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (picture) fd.append('picture', picture);
      await api.post('/forums/issues', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Issue submitted successfully!');
      setShowForm(false);
      setForm({ forumName: '', name: '', location: '', issueTitle: '', issueDescription: '', contactNumber: '', category: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit issue');
    }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

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
          {selected ? (
            <>
              <button className="btn btn-outline btn-sm mb-4" onClick={() => setSelected(null)}>← Back to Issues</button>
              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span className={`badge ${STATUS_COLORS[selected.status] || 'badge-secondary'} mb-2`}>{selected.status}</span>
                      <h2 style={{ fontSize: '1.375rem', fontWeight: 600 }}>{selected.issue_title}</h2>
                    </div>
                    {selected.category && <span className="badge badge-info">{selected.category}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-light)' }}>
                    <span>By: <strong>{selected.name}</strong></span>
                    {selected.location && <span style={{display:'inline-flex',alignItems:'center',gap:3}}><MapPin size={12}/> {selected.location}</span>}
                    {selected.contact_number && <span style={{display:'inline-flex',alignItems:'center',gap:3}}><Phone size={12}/> {selected.contact_number}</span>}
                  </div>
                  {selected.picture_url && <img src={selected.picture_url} alt="Issue" style={{ maxWidth: 400, borderRadius: 'var(--radius)', marginBottom: '1rem' }} />}
                  <p style={{ lineHeight: 1.8, color: 'var(--text-medium)' }}>{selected.issue_description}</p>
                  {comments.length > 0 && (
                    <div style={{ marginTop: '2rem' }}>
                      <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Comments ({comments.length})</h3>
                      {comments.map(c => (
                        <div key={c.id} style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: 'var(--radius)', marginBottom: '0.5rem' }}>
                          <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{c.comment}</p>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(c.created_at).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Community Issues</h2>
                  <p className="text-muted">{issues.length} issues reported</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                  {showForm ? 'Cancel' : '+ Raise an Issue'}
                </button>
              </div>

              {showForm && (
                <div className="card mb-4">
                  <div className="card-header">Report a Community Issue</div>
                  <form onSubmit={handleSubmit} className="card-body">
                    <div className="grid grid-2">
                      <div className="form-group">
                        <label className="form-label">Your Name *</label>
                        <input className="form-control" value={form.name} onChange={set('name')} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Contact Number</label>
                        <input className="form-control" value={form.contactNumber} onChange={set('contactNumber')} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Forum Name</label>
                        <input className="form-control" value={form.forumName} onChange={set('forumName')} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Location</label>
                        <input className="form-control" value={form.location} onChange={set('location')} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Category *</label>
                        <select className="form-control" value={form.category} onChange={set('category')} required>
                          <option value="">Select category</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Photo</label>
                        <input type="file" className="form-control" accept="image/*" onChange={e => setPicture(e.target.files[0])} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Issue Title *</label>
                      <input className="form-control" value={form.issueTitle} onChange={set('issueTitle')} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Issue Description *</label>
                      <textarea className="form-control" rows={4} value={form.issueDescription} onChange={set('issueDescription')} required />
                    </div>
                    <button type="submit" className="btn btn-primary">Submit Issue</button>
                  </form>
                </div>
              )}

              {loading ? <div className="loading-center"><div className="spinner" /></div> :
                issues.length === 0 ? <div className="text-center text-muted" style={{ padding: '3rem' }}>No issues reported yet.</div> :
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {issues.map(issue => (
                      <div key={issue.id} className="card" onClick={() => openIssue(issue)} style={{ cursor: 'pointer' }}>
                        <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                              <span className={`badge ${STATUS_COLORS[issue.status] || 'badge-secondary'}`}>{issue.status}</span>
                              {issue.category && <span className="badge badge-info">{issue.category}</span>}
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{issue.issue_title}</h3>
                            <p className="text-muted" style={{ fontSize: '0.85rem' }}>By {issue.name} {issue.location && `• ${issue.location}`} • {issue.comment_count} comments</p>
                          </div>
                          <span className="text-muted" style={{ fontSize: '0.8rem', flexShrink: 0 }}>
                            {new Date(issue.created_at).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default Forum;
