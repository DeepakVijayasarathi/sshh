import React, { useState, useEffect, useCallback } from 'react';
import { Save, CheckSquare, Square, Minus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import { IconComponent } from '../../utils/iconMap';
import api from '../../services/api';

const AdminRoleMenus = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [roles, setRoles]           = useState([]);
  const [allMenus, setAllMenus]     = useState([]);
  const [assigned, setAssigned]     = useState(new Set());   // Set of menu IDs
  const [selectedRole, setRole]     = useState(searchParams.get('role') || '');
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [targetFilter, setTarget]   = useState('admin');

  // Load roles and all menus once
  useEffect(() => {
    Promise.all([api.get('/roles'), api.get('/menus')])
      .then(([r, m]) => {
        setRoles(r.data);
        setAllMenus(m.data);
        if (!selectedRole && r.data.length) setRole(r.data[0].id);
      })
      .catch(() => toast.error('Failed to load data'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load assigned menus whenever selected role changes
  const loadAssigned = useCallback(() => {
    if (!selectedRole) return;
    setLoading(true);
    api.get(`/roles/${selectedRole}/menus`)
      .then(r => setAssigned(new Set(r.data.map(m => m.id))))
      .catch(err => { console.error(err); toast.error('Failed to load role menus'); })
      .finally(() => setLoading(false));
  }, [selectedRole]);

  useEffect(() => { loadAssigned(); }, [loadAssigned]);

  // Sync URL param
  const handleRoleChange = (id) => {
    setRole(id);
    setSearchParams(id ? { role: id } : {});
  };

  const toggle = (menuId) => {
    setAssigned(prev => {
      const next = new Set(prev);
      if (next.has(menuId)) next.delete(menuId);
      else next.add(menuId);
      return next;
    });
  };

  const toggleGroup = (items) => {
    const ids = items.map(m => m.id);
    const allChecked = ids.every(id => assigned.has(id));
    setAssigned(prev => {
      const next = new Set(prev);
      if (allChecked) ids.forEach(id => next.delete(id));
      else ids.forEach(id => next.add(id));
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      await api.put(`/roles/${selectedRole}/menus`, { menu_ids: [...assigned] });
      toast.success('Menu assignments saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // Group menus by group_label for display
  const filtered = allMenus.filter(m => !targetFilter || m.target === targetFilter);
  const grouped  = filtered.reduce((acc, m) => {
    const key = m.group_label || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const totalFiltered  = filtered.length;
  const totalAssigned  = filtered.filter(m => assigned.has(m.id)).length;
  const currentRole    = roles.find(r => r.id === selectedRole);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Role Menus</h1>
          <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
            Assign which menu items are visible to each role
          </p>
        </div>
        <button onClick={handleSave} disabled={saving || !selectedRole} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Save size={15} /> {saving ? 'Saving…' : 'Save Assignments'}
        </button>
      </div>

      {/* Role selector */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: '1 1 220px' }}>
            <label className="form-label">Select Role</label>
            <select className="form-control" value={selectedRole} onChange={e => handleRoleChange(e.target.value)}>
              <option value="">-- Choose a role --</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name} {r.is_system ? '(System)' : ''}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label className="form-label">Show Target</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[['admin', 'Admin'], ['public', 'Public'], ['', 'Both']].map(([val, lbl]) => (
                <button key={val} onClick={() => setTarget(val)}
                  style={{ padding: '0.375rem 0.875rem', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, background: targetFilter === val ? 'var(--primary)' : '#f1f5f9', color: targetFilter === val ? 'white' : '#475569' }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          {currentRole && (
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{currentRole.name}</p>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                {totalAssigned} / {totalFiltered} menus assigned
              </p>
            </div>
          )}
        </div>
      </div>

      {!selectedRole ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Select a role to manage its menu access</div>
      ) : loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(grouped).map(([groupLabel, items]) => {
            const groupIds      = items.map(m => m.id);
            const allChecked    = groupIds.every(id => assigned.has(id));
            const someChecked   = groupIds.some(id => assigned.has(id));
            const GroupCheckIcon = allChecked ? CheckSquare : someChecked ? Minus : Square;

            return (
              <div key={groupLabel} className="card">
                {/* Group header */}
                <div
                  style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', background: '#fafafa', borderRadius: '12px 12px 0 0' }}
                  onClick={() => toggleGroup(items)}
                >
                  <GroupCheckIcon size={17} color={allChecked ? 'var(--primary)' : someChecked ? '#f59e0b' : '#cbd5e1'} />
                  <span style={{ fontWeight: 700, color: '#374151', fontSize: '0.875rem' }}>{groupLabel}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: 'auto' }}>
                    {groupIds.filter(id => assigned.has(id)).length}/{items.length}
                  </span>
                </div>

                {/* Menu items */}
                <div style={{ padding: '0.5rem 0' }}>
                  {items.map(menu => {
                    const checked = assigned.has(menu.id);
                    return (
                      <label
                        key={menu.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.625rem 1.25rem', cursor: 'pointer', transition: 'background 0.12s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(menu.id)}
                          style={{ width: 15, height: 15, accentColor: 'var(--primary)', cursor: 'pointer' }}
                        />
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: checked ? 'rgba(139,0,0,0.08)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: checked ? 'var(--primary)' : '#94a3b8', transition: 'all 0.15s' }}>
                          <IconComponent name={menu.icon} size={14} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: checked ? 600 : 400, color: checked ? '#0f172a' : '#475569', fontSize: '0.875rem' }}>{menu.label}</p>
                          <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>{menu.path}</p>
                        </div>
                        <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 10, fontWeight: 600, textTransform: 'uppercase', background: menu.target === 'admin' ? 'rgba(139,0,0,0.08)' : '#dbeafe', color: menu.target === 'admin' ? 'var(--primary)' : '#1e40af' }}>
                          {menu.target}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky save bar */}
      {selectedRole && (
        <div style={{ position: 'sticky', bottom: 24, marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 8px 24px rgba(139,0,0,0.25)' }}>
            <Save size={15} /> {saving ? 'Saving…' : `Save ${currentRole?.name || ''} Menus`}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminRoleMenus;
