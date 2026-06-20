import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Pencil, Trash2, X, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { IconComponent, ICON_NAMES } from '../../utils/iconMap';
import api from '../../services/api';

const TARGETS     = ['admin', 'public'];
const GROUP_OPTS  = ['Main', 'Content', 'Business', 'System', ''];

const EMPTY_FORM = { label: '', path: '', icon: '', target: 'admin', group_label: '', sort_order: 0, is_active: true };

const AdminMenus = () => {
  const [menus, setMenus]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterTarget, setFilter] = useState('');
  const [modal, setModal]         = useState(null);  // null | 'create' | menu-object
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [reseeding, setReseeding] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = filterTarget ? `?target=${filterTarget}` : '';
    api.get(`/menus${params}`)
      .then(r => setMenus(r.data))
      .catch(err => { console.error(err); toast.error('Failed to load menus'); })
      .finally(() => setLoading(false));
  }, [filterTarget]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create'); };
  const openEdit   = (m)  => {
    setForm({
      label:       m.label,
      path:        m.path,
      icon:        m.icon || '',
      target:      m.target,
      group_label: m.group_label || '',
      sort_order:  m.sort_order,
      is_active:   m.is_active,
    });
    setModal(m);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        await api.post('/menus', form);
        toast.success('Menu created');
      } else {
        await api.put(`/menus/${modal.id}`, form);
        toast.success('Menu updated');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (menu) => {
    if (!window.confirm(`Delete menu "${menu.label}"? This will remove it from all role assignments.`)) return;
    try {
      await api.delete(`/menus/${menu.id}`);
      toast.success('Menu deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleToggleActive = async (menu) => {
    try {
      await api.put(`/menus/${menu.id}`, { is_active: !menu.is_active });
      toast.success(menu.is_active ? 'Menu hidden' : 'Menu shown');
      load();
    } catch (err) {
      toast.error('Toggle failed');
    }
  };

  const handleReseed = async () => {
    if (!window.confirm('This will re-seed default menus and role assignments. Custom roles\' assignments are preserved. Continue?')) return;
    setReseeding(true);
    try {
      await api.post('/menus/reseed');
      toast.success('Seed completed');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reseed failed');
    } finally {
      setReseeding(false);
    }
  };

  // Group menus by target + group_label for display
  const grouped = menus.reduce((acc, m) => {
    const key = `${m.target}:${m.group_label || 'Other'}`;
    if (!acc[key]) acc[key] = { target: m.target, group: m.group_label || 'Other', items: [] };
    acc[key].items.push(m);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Menus</h1>
          <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>Manage navigation menu items for admin and public sections</p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
          <button onClick={handleReseed} disabled={reseeding} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.8125rem', color: '#4b5563', fontWeight: 500 }}>
            <RefreshCw size={14} className={reseeding ? 'spin' : ''} /> {reseeding ? 'Reseeding…' : 'Reseed Defaults'}
          </button>
          <button onClick={openCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <PlusCircle size={15} /> New Menu
          </button>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {['', 'admin', 'public'].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{ padding: '0.375rem 0.875rem', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, background: filterTarget === t ? 'var(--primary)' : '#f1f5f9', color: filterTarget === t ? 'white' : '#475569' }}>
            {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {Object.values(grouped).sort((a, b) => a.target.localeCompare(b.target)).map(group => (
            <div key={`${group.target}:${group.group}`} className="card">
              <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 8px', borderRadius: 20, background: group.target === 'admin' ? 'rgba(139,0,0,0.08)' : '#dbeafe', color: group.target === 'admin' ? 'var(--primary)' : '#1e40af' }}>
                  {group.target}
                </span>
                <span style={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>{group.group}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({group.items.length} items)</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>Icon</th>
                      <th>Label</th>
                      <th>Path</th>
                      <th>Sort</th>
                      <th>Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map(m => (
                      <tr key={m.id} style={{ opacity: m.is_active ? 1 : 0.5 }}>
                        <td>
                          <div style={{ width: 30, height: 30, borderRadius: 7, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            <IconComponent name={m.icon} size={14} />
                          </div>
                        </td>
                        <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{m.label}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b' }}>{m.path}</td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{m.sort_order}</td>
                        <td>
                          <button onClick={() => handleToggleActive(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: m.is_active ? '#059669' : '#94a3b8', display: 'flex', alignItems: 'center' }}>
                            {m.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.375rem' }}>
                            <button onClick={() => openEdit(m)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#4b5563', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}>
                              <Pencil size={12} /> Edit
                            </button>
                            <button onClick={() => handleDelete(m)} style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: '#fff1f2', cursor: 'pointer', color: '#be123c', display: 'flex', alignItems: 'center' }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem', overflowY: 'auto' }} onClick={() => setModal(null)}>
          <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', margin: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', margin: 0 }}>
                {modal === 'create' ? 'Create Menu Item' : `Edit — ${modal.label}`}
              </h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: '1.5rem', display: 'grid', gap: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Label *</label>
                  <input className="form-control" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required placeholder="e.g. Dashboard" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Target</label>
                  <select className="form-control" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}>
                    {TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Path *</label>
                <input className="form-control" value={form.path} onChange={e => setForm(f => ({ ...f, path: e.target.value }))} required placeholder="/admin/page-name" style={{ fontFamily: 'monospace' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Group</label>
                  <select className="form-control" value={form.group_label} onChange={e => setForm(f => ({ ...f, group_label: e.target.value }))}>
                    {GROUP_OPTS.map(g => <option key={g} value={g}>{g || '(none)'}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Sort Order</label>
                  <input type="number" className="form-control" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} />
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Icon
                  {form.icon && <IconComponent name={form.icon} size={16} style={{ color: 'var(--primary)' }} />}
                </label>
                <select className="form-control" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}>
                  <option value="">(no icon)</option>
                  {ICON_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="chk-active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                <label htmlFor="chk-active" style={{ fontSize: '0.875rem', color: '#374151', cursor: 'pointer' }}>Active (visible in navigation)</label>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Menu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminMenus;
