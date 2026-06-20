import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Pencil, Trash2, ShieldCheck, Shield, X, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AdminRoles = () => {
  const [roles, setRoles]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);   // null | 'create' | role-object
  const [form, setForm]         = useState({ name: '', description: '' });
  const [saving, setSaving]     = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/roles')
      .then(r => setRoles(r.data))
      .catch(err => { console.error(err); toast.error('Failed to load roles'); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm({ name: '', description: '' }); setModal('create'); };
  const openEdit   = (r)  => { setForm({ name: r.name, description: r.description || '' }); setModal(r); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Role name is required'); return; }
    setSaving(true);
    try {
      if (modal === 'create') {
        await api.post('/roles', form);
        toast.success('Role created');
      } else {
        await api.put(`/roles/${modal.id}`, form);
        toast.success('Role updated');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role) => {
    if (role.is_system) { toast.error('System roles cannot be deleted'); return; }
    if (!window.confirm(`Delete role "${role.name}"? This will remove all menu assignments for this role.`)) return;
    try {
      await api.delete(`/roles/${role.id}`);
      toast.success('Role deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Roles</h1>
          <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
            Manage roles and assign menus via <Link to="/admin/role-menus" style={{ color: 'var(--primary)', fontWeight: 600 }}>Role Menus</Link>
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <PlusCircle size={15} /> New Role
        </button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {roles.map(role => (
            <div key={role.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: role.is_system ? 'rgba(139,0,0,0.1)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {role.is_system ? <ShieldCheck size={18} color="var(--primary)" /> : <Shield size={18} color="#64748b" />}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#0f172a', margin: 0, fontSize: '0.9375rem' }}>{role.name}</p>
                    {role.is_system && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(139,0,0,0.08)', color: 'var(--primary)', padding: '1px 6px', borderRadius: 10 }}>System</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button onClick={() => openEdit(role)} title="Edit" style={{ padding: '4px 6px', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#4b5563' }}>
                    <Pencil size={13} />
                  </button>
                  {!role.is_system && (
                    <button onClick={() => handleDelete(role)} title="Delete" style={{ padding: '4px 6px', borderRadius: 6, border: 'none', background: '#fff1f2', cursor: 'pointer', color: '#be123c' }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {role.description && (
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.75rem', lineHeight: 1.5 }}>{role.description}</p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  {role.menu_count ?? 0} menus assigned
                </span>
                <Link
                  to={`/admin/role-menus?role=${role.id}`}
                  style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <CheckCircle size={12} /> Manage Menus
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }} onClick={() => setModal(null)}>
          <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', margin: 0 }}>
                {modal === 'create' ? 'Create Role' : `Edit Role — ${modal.name}`}
              </h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Role Name *</label>
                <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Moderator" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What can this role do?" style={{ resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Role'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoles;
