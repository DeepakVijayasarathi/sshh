import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { X, Image, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../../services/api';

const EMPTY_FORM = {
  title: '', subtitle: '', description: '',
  buttonText: '', buttonLink: '',
  bgColor: '#1a1a2e', textColor: '#ffffff',
  sortOrder: 0, isActive: 'true',
};

const Banners = () => {
  const [banners, setBanners]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [image, setImage]       = useState(null);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/banners')
      .then(r => setBanners(r.data || []))
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImage(null);
    setShowForm(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      description: b.description || '',
      buttonText: b.button_text || '',
      buttonLink: b.button_link || '',
      bgColor: b.bg_color || '#1a1a2e',
      textColor: b.text_color || '#ffffff',
      sortOrder: b.sort_order || 0,
      isActive: b.is_active ? 'true' : 'false',
    });
    setImage(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      if (image) fd.append('image', image);
      if (editing) {
        await api.put(`/banners/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Banner updated');
      } else {
        await api.post('/banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Banner created');
      }
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      setImage(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (b) => {
    try {
      const fd = new FormData();
      fd.append('title', b.title);
      fd.append('subtitle', b.subtitle || '');
      fd.append('description', b.description || '');
      fd.append('buttonText', b.button_text || '');
      fd.append('buttonLink', b.button_link || '');
      fd.append('bgColor', b.bg_color || '#1a1a2e');
      fd.append('textColor', b.text_color || '#ffffff');
      fd.append('sortOrder', b.sort_order || 0);
      fd.append('isActive', !b.is_active);
      await api.put(`/banners/${b.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(b.is_active ? 'Banner hidden' : 'Banner activated');
      load();
    } catch { toast.error('Failed to update'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try { await api.delete(`/banners/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Banners / Slider</h1>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Add Banner</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600, margin: 0 }}>{editing ? 'Edit Banner' : 'Add Banner'}</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 1rem' }}>
              <div className="form-group"><label className="form-label">Title *</label><input className="form-control" required value={form.title} onChange={setF('title')} placeholder="Banner title" /></div>
              <div className="form-group"><label className="form-label">Subtitle</label><input className="form-control" value={form.subtitle} onChange={setF('subtitle')} placeholder="Short subtitle" /></div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Description</label><textarea className="form-control" rows={2} value={form.description} onChange={setF('description')} placeholder="Banner description text" /></div>
              <div className="form-group"><label className="form-label">Button Text</label><input className="form-control" value={form.buttonText} onChange={setF('buttonText')} placeholder="e.g. Learn More" /></div>
              <div className="form-group"><label className="form-label">Button Link</label><input className="form-control" value={form.buttonLink} onChange={setF('buttonLink')} placeholder="e.g. /about" /></div>
              <div className="form-group"><label className="form-label">Background Colour</label><input type="color" className="form-control" style={{ height: 40 }} value={form.bgColor} onChange={setF('bgColor')} /></div>
              <div className="form-group"><label className="form-label">Text Colour</label><input type="color" className="form-control" style={{ height: 40 }} value={form.textColor} onChange={setF('textColor')} /></div>
              <div className="form-group"><label className="form-label">Sort Order</label><input type="number" className="form-control" value={form.sortOrder} onChange={setF('sortOrder')} min={0} /></div>
              <div className="form-group"><label className="form-label">Status</label>
                <select className="form-control" value={form.isActive} onChange={setF('isActive')}>
                  <option value="true">Active</option>
                  <option value="false">Hidden</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Banner Image</label><input type="file" className="form-control" accept="image/*" onChange={e => setImage(e.target.files[0])} /></div>
              {editing?.image_url && !image && (
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Image size={14} color="#9ca3af" />
                  <img src={editing.image_url} alt="current" style={{ height: 40, borderRadius: 6, objectFit: 'cover' }} />
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Current image</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Banner' : 'Add Banner'}</button>
              <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
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
                  <th>Preview</th>
                  <th>Title</th>
                  <th>Subtitle</th>
                  <th>Button</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-light)' }}>No banners yet. Click "Add Banner" to create one.</td></tr>
                ) : banners.map(b => (
                  <tr key={b.id}>
                    <td>
                      {b.image_url
                        ? <img src={b.image_url} alt={b.title} style={{ width: 80, height: 44, objectFit: 'cover', borderRadius: 6 }} />
                        : <div style={{ width: 80, height: 44, borderRadius: 6, background: b.bg_color || '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Image size={18} color={b.text_color || '#ffffff'} />
                          </div>
                      }
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{b.title}</td>
                    <td style={{ fontSize: '0.8125rem', color: '#6b7280', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.subtitle || '—'}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{b.button_text ? `${b.button_text} → ${b.button_link}` : '—'}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{b.sort_order}</td>
                    <td>
                      <span className={`badge ${b.is_active ? 'badge-success' : 'badge-secondary'}`}>
                        {b.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'nowrap', alignItems: 'center' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(b)}>Edit</button>
                        <button className="btn btn-sm btn-outline" onClick={() => toggleActive(b)}>
                          {b.is_active ? 'Hide' : 'Show'}
                        </button>
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
    </div>
  );
};

export default Banners;
