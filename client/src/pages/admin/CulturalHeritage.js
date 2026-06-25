import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Trash2, Eye, PlusCircle, Pencil, X, Image } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const CATEGORIES = ['Music', 'Dance', 'Food', 'Tradition', 'Language', 'Festival', 'History', 'Craft', 'Other'];

const STATUS_BADGE = {
  Pending:  { bg: '#fef9c3', color: '#854d0e' },
  Approved: { bg: '#dcfce7', color: '#166534' },
  Rejected: { bg: '#fee2e2', color: '#991b1b' },
};

const AdminCulturalHeritage = () => {
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [status, setStatus]       = useState('');
  const [search, setSearch]       = useState('');
  const [detail, setDetail]       = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating]   = useState(false);
  const [form, setForm]           = useState({ title: '', category: '', content: '', author_name: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imgPreview, setImgPreview] = useState('');
  const [editing, setEditing]     = useState(null);
  const [editForm, setEditForm]   = useState({ title: '', category: '', content: '', author_name: '' });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImgPreview, setEditImgPreview] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    params.set('limit', '50');
    api.get(`/cultural/admin/all?${params}`)
      .then(r => setPosts(r.data.data || []))
      .catch(err => { console.error('Cultural load error:', err); setPosts([]); })
      .finally(() => setLoading(false));
  }, [status, search]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id, publish) => {
    try {
      await api.put(`/cultural/${id}/approve`, { publish });
      toast.success(publish ? 'Post published!' : 'Post rejected');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this cultural post?')) return;
    try {
      await api.delete(`/cultural/${id}`);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const openEdit = (post) => {
    setEditing(post);
    setEditForm({
      title: post.title || '', category: post.category || '',
      content: post.content || '', author_name: post.author_name || '',
    });
    setEditImageFile(null);
    setEditImgPreview('');
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditImageFile(file);
    setEditImgPreview(URL.createObjectURL(file));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) { toast.error('Title is required'); return; }
    setSavingEdit(true);
    try {
      const fd = new FormData();
      fd.append('title',       editForm.title);
      fd.append('category',    editForm.category);
      fd.append('content',     editForm.content);
      fd.append('author_name', editForm.author_name);
      if (editImageFile) fd.append('image', editImageFile);
      await api.put(`/cultural/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Post updated');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setCreating(true);
    try {
      const fd = new FormData();
      fd.append('title',       form.title);
      fd.append('category',    form.category);
      fd.append('content',     form.content);
      fd.append('author_name', form.author_name);
      if (imageFile) fd.append('image', imageFile);
      await api.post('/cultural', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Post created and published!');
      setShowCreate(false);
      setForm({ title: '', category: '', content: '', author_name: '' });
      setImageFile(null);
      setImgPreview('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  const pendingCount = posts.filter(p => p.status === 'Pending').length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Cultural Heritage</h1>
          {pendingCount > 0 && (
            <p style={{ fontSize: '0.8125rem', color: '#d97706', margin: '0.25rem 0 0', fontWeight: 500 }}>
              {pendingCount} post{pendingCount > 1 ? 's' : ''} awaiting approval
            </p>
          )}
        </div>
        <button
          onClick={() => setShowCreate(s => !s)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <PlusCircle size={15} /> Add Post
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>New Cultural Post</span>
            <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={16} /></button>
          </div>
          <form onSubmit={handleCreate} className="card-body" style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Title *</label>
                <input className="form-control" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category</label>
                <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="">Select</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Author Name</label>
              <input className="form-control" value={form.author_name} onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Content</label>
              <textarea className="form-control" rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Image</label>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: '0.875rem' }} />
              {imgPreview && <img src={imgPreview} alt="preview" style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 6, marginTop: 6 }} />}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Creating…' : 'Create & Publish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          className="form-control"
          style={{ flex: '1 1 200px', maxWidth: 280 }}
          placeholder="Search title or author..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="form-control" style={{ width: 160 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No posts found.</td></tr>
              ) : posts.map(post => {
                const badge = STATUS_BADGE[post.status] || { bg: '#f1f5f9', color: '#64748b' };
                return (
                  <tr key={post.id}>
                    <td>
                      {post.image_url ? (
                        <img src={`${BASE}${post.image_url}`} alt="" style={{ width: 44, height: 36, objectFit: 'cover', borderRadius: 6 }} onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div style={{ width: 44, height: 36, background: '#f1f5f9', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Image size={14} style={{ color: '#cbd5e1' }} />
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, maxWidth: 200 }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.title}</span>
                    </td>
                    <td>{post.category || '—'}</td>
                    <td style={{ color: '#64748b', fontSize: '0.8125rem' }}>{post.author_name || '—'}</td>
                    <td>
                      <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, background: badge.bg, color: badge.color }}>
                        {post.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'nowrap' }}>
                        <button
                          onClick={() => setDetail(post)}
                          title="View"
                          style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#4b5563', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          onClick={() => openEdit(post)}
                          title="Edit"
                          style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#4b5563', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        {post.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(post.id, true)}
                              title="Approve & Publish"
                              style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: '#dcfce7', cursor: 'pointer', color: '#166534', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600 }}
                            >
                              <CheckCircle size={13} /> Approve
                            </button>
                            <button
                              onClick={() => handleApprove(post.id, false)}
                              title="Reject"
                              style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: '#fee2e2', cursor: 'pointer', color: '#991b1b', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600 }}
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </>
                        )}
                        {post.status === 'Approved' && (
                          <button
                            onClick={() => handleApprove(post.id, false)}
                            title="Unpublish"
                            style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: '#fef9c3', cursor: 'pointer', color: '#854d0e', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            <XCircle size={13} /> Unpublish
                          </button>
                        )}
                        {post.status === 'Rejected' && (
                          <button
                            onClick={() => handleApprove(post.id, true)}
                            title="Publish"
                            style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: '#dcfce7', cursor: 'pointer', color: '#166534', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            <CheckCircle size={13} /> Publish
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(post.id)}
                          title="Delete"
                          style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: '#fff1f2', cursor: 'pointer', color: '#be123c', display: 'flex', alignItems: 'center' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} onClick={() => setDetail(null)}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 620, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            {detail.image_url && (
              <img src={`${BASE}${detail.image_url}`} alt={detail.title} style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: '20px 20px 0 0' }} onError={e => { e.target.style.display = 'none'; }} />
            )}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  {detail.category && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', background: 'rgba(139,0,0,0.08)', padding: '3px 10px', borderRadius: 20, display: 'inline-block', marginBottom: '0.5rem' }}>
                      {detail.category}
                    </span>
                  )}
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.375rem', color: '#0f172a', margin: 0 }}>{detail.title}</h2>
                </div>
                <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', flexShrink: 0 }}><X size={20} /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.25rem' }}>
                <span><strong>Author:</strong> {detail.author_name || '—'}</span>
                <span><strong>Submitted by:</strong> {detail.submitter_email || '—'}</span>
                <span><strong>Status:</strong> {detail.status}</span>
                <span><strong>Published:</strong> {detail.is_published ? 'Yes' : 'No'}</span>
                <span style={{ gridColumn: '1 / -1' }}><strong>Date:</strong> {new Date(detail.created_at).toLocaleString('en-IN')}</span>
              </div>
              {detail.content && (
                <div style={{ lineHeight: 1.8, color: '#374151', fontSize: '0.9rem', whiteSpace: 'pre-wrap', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  {detail.content}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {detail.status === 'Pending' && (
                  <>
                    <button onClick={() => { handleApprove(detail.id, true); setDetail(null); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle size={14} /> Approve & Publish
                    </button>
                    <button onClick={() => { handleApprove(detail.id, false); setDetail(null); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#991b1b', fontWeight: 600, cursor: 'pointer' }}>
                      <XCircle size={14} /> Reject
                    </button>
                  </>
                )}
                <button onClick={() => setDetail(null)} className="btn btn-ghost">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} onClick={() => setEditing(null)}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 560, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Edit Post</h2>
              <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="card-body" style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Title *</label>
                  <input className="form-control" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Category</label>
                  <select className="form-control" value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="">Select</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Author Name</label>
                <input className="form-control" value={editForm.author_name} onChange={e => setEditForm(f => ({ ...f, author_name: e.target.value }))} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Content</label>
                <textarea className="form-control" rows={4} value={editForm.content} onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Replace Image (optional)</label>
                <input type="file" accept="image/*" onChange={handleEditFileChange} style={{ fontSize: '0.875rem' }} />
                {editImgPreview && <img src={editImgPreview} alt="preview" style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 6, marginTop: 6 }} />}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={savingEdit}>
                  {savingEdit ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCulturalHeritage;
