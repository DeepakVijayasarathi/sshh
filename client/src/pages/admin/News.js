import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const CATEGORIES = ['Community News', 'Emergency Announcement', 'Events', 'Education', 'Jobs'];
const defaultForm = { title: '', content: '', category: 'Community News', videoUrl: '', isPublished: false, isFeatured: false };

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState(null);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/news?published=false&limit=50')
      .then(r => setNews(r.data.data || []))
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(defaultForm); setEditing(null); setImage(null); setShowForm(true); };
  const openEdit = (n) => {
    setForm({ title: n.title, content: n.content, category: n.category, videoUrl: n.video_url || '', isPublished: n.is_published, isFeatured: n.is_featured });
    setEditing(n.id); setImage(null); setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      const opts = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editing) await api.put(`/news/${editing}`, fd, opts);
      else await api.post('/news', fd, opts);
      toast.success(editing ? 'News updated' : 'News created');
      setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this news?')) return;
    try { await api.delete(`/news/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: (f === 'isPublished' || f === 'isFeatured') ? e.target.checked : e.target.value });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>News Management</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add News</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>{editing ? 'Edit News' : 'Create News'}</h3>
          <form onSubmit={save}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-control" value={form.title} onChange={set('title')} required />
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-control" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Image</label>
                <input type="file" className="form-control" accept="image/*" onChange={e => setImage(e.target.files[0])} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Content *</label>
              <textarea className="form-control" rows={6} value={form.content} onChange={set('content')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Video URL</label>
              <input className="form-control" value={form.videoUrl} onChange={set('videoUrl')} placeholder="Video URL (optional)" />
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isPublished} onChange={set('isPublished')} />
                Publish
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} />
                Feature on homepage
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-responsive">
            <table>
              <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {news.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>No news yet</td></tr> :
                  news.map(n => (
                    <tr key={n.id}>
                      <td style={{ fontWeight: 500 }}>{n.title.substring(0, 50)}{n.title.length > 50 ? '...' : ''}</td>
                      <td><span className="badge badge-info">{n.category}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <span className={`badge ${n.is_published ? 'badge-success' : 'badge-warning'}`}>{n.is_published ? 'Published' : 'Draft'}</span>
                          {n.is_featured && <span className="badge badge-secondary">Featured</span>}
                        </div>
                      </td>
                      <td>{new Date(n.publish_date).toLocaleDateString('en-IN')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <button className="btn btn-sm btn-outline" onClick={() => openEdit(n)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => remove(n.id)}>Delete</button>
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

export default News;
