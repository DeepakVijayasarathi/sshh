import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import { Plus, Pencil, Trash2, User, UploadCloud, X, Star, Users, Phone } from 'lucide-react';

const EMPTY_PATRON = { name: '', role: 'Chief Patron', designation: '', division: 'Patron', quote: '', contact_number: '', display_order: 0, is_active: true };
const EMPTY_TEAM   = { name: '', role: 'Coordinator',  designation: '', division: '',       quote: '', contact_number: '', display_order: 0, is_active: true };

const PATRON_ROLES = ['Inspiration Behind SHC TN', 'Chief Patron', 'Patron of SHC', 'Honorary Patron', 'Patron'];

export default function TeamMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('patrons'); // 'patrons' | 'team'
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(EMPTY_TEAM);
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef               = useRef();

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/team/admin'); setMembers(r.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const patrons      = members.filter(m => m.division === 'Patron');
  const coordinators = members.filter(m => m.division !== 'Patron');
  const divisions    = [...new Set(coordinators.map(m => m.division).filter(Boolean))];

  const openAdd = () => {
    setForm(tab === 'patrons' ? EMPTY_PATRON : EMPTY_TEAM);
    setEditId(null); setPreview(null); setModal(true);
  };
  const openEdit = (m) => {
    setForm({ name: m.name, role: m.role, designation: m.designation || '',
              division: m.division || '', quote: m.quote || '',
              contact_number: m.contact_number || '',
              display_order: m.display_order, is_active: m.is_active });
    setEditId(m.id); setPreview(m.photo_url || null); setModal(true);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!form.name.trim()) return alert('Name is required');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (fileRef.current?.files[0]) fd.append('photo', fileRef.current.files[0]);
      if (editId) await api.put(`/team/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      else        await api.post('/team', fd,          { headers: { 'Content-Type': 'multipart/form-data' } });
      setModal(false); load();
    } catch (e) { alert(e.response?.data?.message || 'Error saving'); }
    finally { setSaving(false); }
  };

  const remove = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try { await api.delete(`/team/${id}`); load(); }
    catch { alert('Error deleting'); }
  };

  const isPatronTab = tab === 'patrons';

  return (
    <>
      <div style={{ padding: '1.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Team Members</h1>
            <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '4px 0 0' }}>
              Manage patrons & team shown on the home page
            </p>
          </div>
          <button onClick={openAdd} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--primary,#8B0000)', color: '#fff',
            border: 'none', borderRadius: 8, padding: '0.5rem 1rem',
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          }}>
            <Plus size={15} /> {isPatronTab ? 'Add Patron' : 'Add Member'}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: 0 }}>
          {[
            { key: 'patrons', label: `Patrons & Inspiration`, Icon: Star, count: patrons.length },
            { key: 'team',    label: `Team Coordinators`,     Icon: Users, count: coordinators.length },
          ].map(({ key, label, Icon, count }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.625rem 1rem', border: 'none', background: 'none',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              color: tab === key ? 'var(--primary,#8B0000)' : '#64748b',
              borderBottom: tab === key ? '2px solid var(--primary,#8B0000)' : '2px solid transparent',
              marginBottom: -2,
            }}>
              <Icon size={14} /> {label}
              <span style={{
                background: tab === key ? 'rgba(139,0,0,0.1)' : '#f1f5f9',
                color: tab === key ? 'var(--primary,#8B0000)' : '#64748b',
                borderRadius: 20, padding: '1px 7px', fontSize: '0.7rem',
              }}>{count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading…</div>
        ) : isPatronTab ? (
          /* ── Patrons grid ── */
          patrons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              No patrons yet. Click "Add Patron" to add one.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {patrons.map(p => (
                <div key={p.id} style={{
                  background: 'linear-gradient(135deg, #fffbf0 0%, #fff 100%)',
                  border: '1.5px solid #e8d98a', borderRadius: 14, padding: '1.5rem',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem',
                }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
                    border: '3px solid #D4AF37', flexShrink: 0,
                    background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {p.photo_url
                      ? <img src={p.photo_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                      : <User size={28} color="#94a3b8" />
                    }
                  </div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
                                letterSpacing: '0.08em', color: '#b45309' }}>{p.role}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                  {p.designation && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.designation}</div>}
                  {p.contact_number && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#475569' }}>
                      <Phone size={11} /> {p.contact_number}
                    </div>
                  )}
                  {p.quote && <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic',
                                            borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                    "{p.quote.substring(0, 80)}{p.quote.length > 80 ? '…' : ''}"
                  </div>}
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <button onClick={() => openEdit(p)} style={{
                      background: '#f8fafc', border: '1px solid #e2e8f0',
                      borderRadius: 7, padding: '5px 10px', cursor: 'pointer',
                      fontSize: '0.75rem', color: '#475569',
                    }}><Pencil size={12} style={{ marginRight: 4 }} />Edit</button>
                    <button onClick={() => remove(p.id, p.name)} style={{
                      background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                      borderRadius: 7, padding: '5px 10px', cursor: 'pointer',
                      fontSize: '0.75rem', color: '#ef4444',
                    }}><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ── Team coordinators grouped by division ── */
          coordinators.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              No team members yet. Click "Add Member".
            </div>
          ) : (
            (divisions.length > 0 ? divisions : ['Uncategorized']).map(div => {
              const group = coordinators.filter(m => (m.division || 'Uncategorized') === div);
              return (
                <div key={div} style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase',
                               letterSpacing: '0.07em', color: '#64748b', margin: '0 0 0.75rem',
                               paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                    {div}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {group.map(m => (
                      <div key={m.id} style={{
                        background: '#fff', border: '1.5px solid #f1f5f9', borderRadius: 12,
                        padding: '1.125rem', display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
                      }}>
                        <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                                      background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      border: '2px solid var(--secondary,#D4AF37)' }}>
                          {m.photo_url
                            ? <img src={m.photo_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                            : <User size={20} color="#94a3b8" />
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.56rem', fontWeight: 700, textTransform: 'uppercase',
                                        letterSpacing: '0.08em', color: 'var(--primary,#8B0000)', marginBottom: 2 }}>{m.role}</div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{m.name}</div>
                          {m.designation && <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{m.designation}</div>}
                          {m.contact_number && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#475569', marginTop: 3 }}>
                              <Phone size={11} /> {m.contact_number}
                            </div>
                          )}
                          <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: 6, padding: '2px 8px',
                                        background: m.is_active ? 'rgba(5,150,105,0.08)' : 'rgba(239,68,68,0.08)',
                                        borderRadius: 20, fontSize: '0.65rem', fontWeight: 600,
                                        color: m.is_active ? '#059669' : '#ef4444' }}>
                            {m.is_active ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button onClick={() => openEdit(m)} style={{
                            background: '#f8fafc', border: '1px solid #e2e8f0',
                            borderRadius: 7, padding: '5px 7px', cursor: 'pointer' }}>
                            <Pencil size={13} color="#475569" />
                          </button>
                          <button onClick={() => remove(m.id, m.name)} style={{
                            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                            borderRadius: 7, padding: '5px 7px', cursor: 'pointer' }}>
                            <Trash2 size={13} color="#ef4444" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh',
                        overflow: 'auto', padding: '1.75rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                {editId ? 'Edit' : 'Add'} {isPatronTab ? 'Patron' : 'Member'}
              </h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            {/* Photo upload */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: 90, height: 90, borderRadius: '50%', overflow: 'hidden', background: '#f1f5f9',
                            border: `3px solid ${isPatronTab ? '#D4AF37' : 'var(--primary,#8B0000)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.625rem' }}>
                {preview
                  ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                  : <User size={32} color="#94a3b8" />
                }
              </div>
              <button onClick={() => fileRef.current?.click()} style={{
                display: 'flex', alignItems: 'center', gap: 5, background: '#f8fafc',
                border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.375rem 0.875rem',
                fontSize: '0.78rem', fontWeight: 600, color: '#475569', cursor: 'pointer',
              }}>
                <UploadCloud size={14} /> Upload Photo
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            </div>

            {/* Name */}
            <div style={{ marginBottom: '0.875rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Full Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }} />
            </div>

            {/* Role */}
            <div style={{ marginBottom: '0.875rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Role / Title</label>
              {isPatronTab ? (
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none', background: '#fff' }}>
                  {PATRON_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              ) : (
                <input type="text" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }} />
              )}
            </div>

            {/* Designation */}
            <div style={{ marginBottom: '0.875rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Designation</label>
              <input type="text" value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))}
                placeholder={isPatronTab ? 'e.g. Honorable Prime Minister of India' : 'e.g. Salem Sourashtra Sabha'}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }} />
            </div>

            {/* Division — hidden for patrons (always 'Patron') */}
            {!isPatronTab && (
              <div style={{ marginBottom: '0.875rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Division</label>
                <input type="text" value={form.division} onChange={e => setForm(p => ({ ...p, division: e.target.value }))}
                  placeholder="e.g. Salem Division"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }} />
              </div>
            )}

            {/* Quote */}
            <div style={{ marginBottom: '0.875rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Quote</label>
              <textarea rows={3} value={form.quote} onChange={e => setForm(p => ({ ...p, quote: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', boxSizing: 'border-box', resize: 'vertical', outline: 'none' }} />
            </div>

            {/* Contact Number */}
            <div style={{ marginBottom: '0.875rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Contact Number</label>
              <input type="tel" value={form.contact_number} onChange={e => setForm(p => ({ ...p, contact_number: e.target.value }))}
                placeholder="e.g. 9876543210"
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }} />
            </div>

            {/* Display order */}
            <div style={{ marginBottom: '0.875rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Display Order</label>
              <input type="number" value={form.display_order} onChange={e => setForm(p => ({ ...p, display_order: e.target.value }))}
                style={{ width: 100, padding: '0.5rem 0.75rem', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', outline: 'none' }} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer', marginBottom: '1.25rem' }}>
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
              Active (visible on home page)
            </label>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(false)} style={{
                padding: '0.5rem 1.25rem', border: '1.5px solid #e2e8f0', borderRadius: 8,
                background: '#fff', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{
                padding: '0.5rem 1.25rem', background: 'var(--primary,#8B0000)', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
              }}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
