import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { X, Icon as IconIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import api from '../../services/api';
import { ABOUT_ICON_NAMES } from '../../constants/aboutIcons';

const EMPTY_FORM = {
  sectionKey: '', type: 'card', icon: 'Info', color: '#8B0000',
  title: '', content: '', sortOrder: 0, isActive: true,
};

const IconPreview = ({ name, size = 18, color }) => {
  const Cmp = Icons[name] || IconIcon;
  return <Cmp size={size} color={color} strokeWidth={1.75} />;
};

const AboutUs = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/about')
      .then(r => setSections(r.data || []))
      .catch(() => setSections([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sortOrder: (sections.length + 1) * 10 });
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      sectionKey: s.section_key || '',
      type: s.type || 'card',
      icon: s.icon || 'Info',
      color: s.color || '#8B0000',
      title: s.title || '',
      content: s.content || '',
      sortOrder: s.sort_order || 0,
      isActive: !!s.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, sectionKey: form.sectionKey || null };
      if (editing) {
        await api.put(`/about/${editing.id}`, payload);
        toast.success('Section updated');
      } else {
        await api.post('/about', payload);
        toast.success('Section added');
      }
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s) => {
    try {
      await api.put(`/about/${s.id}`, { isActive: !s.is_active });
      toast.success(s.is_active ? 'Section hidden' : 'Section activated');
      load();
    } catch { toast.error('Failed to update'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this section?')) return;
    try { await api.delete(`/about/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>About Us Page</h1>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Add Section</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600, margin: 0 }}>{editing ? 'Edit Section' : 'Add Section'}</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 1rem' }}>
              <div className="form-group"><label className="form-label">Title *</label><input className="form-control" required value={form.title} onChange={setF('title')} placeholder="e.g. Our Mission" /></div>
              <div className="form-group">
                <label className="form-label">Display Type</label>
                <select className="form-control" value={form.type} onChange={setF('type')}>
                  <option value="intro">Intro (full-width text block)</option>
                  <option value="card">Card (icon + short text)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Icon</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <select className="form-control" value={form.icon} onChange={setF('icon')}>
                    {ABOUT_ICON_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconPreview name={form.icon} color={form.color} />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Icon Colour</label>
                <input type="color" className="form-control" style={{ height: 40 }} value={form.color} onChange={setF('color')} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Content</label>
                <textarea className="form-control" rows={form.type === 'intro' ? 6 : 3} value={form.content} onChange={setF('content')} placeholder="Section text shown on the About Us page" />
              </div>
              <div className="form-group"><label className="form-label">Sort Order</label><input type="number" className="form-control" value={form.sortOrder} onChange={setF('sortOrder')} min={0} /></div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.isActive ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}>
                  <option value="true">Active</option>
                  <option value="false">Hidden</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Section' : 'Add Section'}</button>
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
                  <th>Icon</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Content</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sections.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-light)' }}>No sections yet. Click "Add Section" to create one.</td></tr>
                ) : sections.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconPreview name={s.icon} size={16} color={s.color} />
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{s.title}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{s.type}</td>
                    <td style={{ fontSize: '0.8125rem', color: '#6b7280', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.content || '—'}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{s.sort_order}</td>
                    <td>
                      <span className={`badge ${s.is_active ? 'badge-success' : 'badge-secondary'}`}>
                        {s.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'nowrap', alignItems: 'center' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(s)}>Edit</button>
                        <button className="btn btn-sm btn-outline" onClick={() => toggleActive(s)}>
                          {s.is_active ? 'Hide' : 'Show'}
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => remove(s.id)}>Delete</button>
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

export default AboutUs;
