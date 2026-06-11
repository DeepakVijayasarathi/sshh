import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Plus, Pencil, Trash2, X, Users, IndianRupee,
  Clock, ToggleLeft, ToggleRight, BadgeCheck, Crown,
} from 'lucide-react';

const EMPTY = {
  name: '', description: '', fee: '', duration_months: '12',
  display_order: '0', is_active: true, benefits: '',
};

const DURATION_PRESETS = [
  { label: '1 Month',  value: '1'  },
  { label: '3 Months', value: '3'  },
  { label: '6 Months', value: '6'  },
  { label: '1 Year',   value: '12' },
  { label: '2 Years',  value: '24' },
  { label: 'Lifetime', value: ''   },
];

const planColor = (i) => {
  const palettes = [
    { bg: 'rgba(139,0,0,0.07)',   border: 'rgba(139,0,0,0.18)',   accent: '#8B0000' },
    { bg: 'rgba(212,175,55,0.07)',border: 'rgba(212,175,55,0.25)', accent: '#b45309' },
    { bg: 'rgba(37,99,235,0.07)', border: 'rgba(37,99,235,0.18)', accent: '#2563eb' },
    { bg: 'rgba(5,150,105,0.07)', border: 'rgba(5,150,105,0.18)', accent: '#059669' },
    { bg: 'rgba(124,58,237,0.07)',border: 'rgba(124,58,237,0.18)',accent: '#7c3aed' },
  ];
  return palettes[i % palettes.length];
};

export default function MembershipPlans() {
  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(EMPTY);
  const [editId,  setEditId]  = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState('');

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/members/types/all'); setPlans(r.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setErr(''); setModal(true); };
  const openEdit = (p) => {
    setForm({
      name: p.name, description: p.description || '',
      fee: String(p.fee), duration_months: p.duration_months ? String(p.duration_months) : '',
      display_order: String(p.display_order || 0),
      is_active: p.is_active, benefits: p.benefits || '',
    });
    setEditId(p.id); setErr(''); setModal(true);
  };

  const save = async () => {
    if (!form.name.trim()) { setErr('Name is required'); return; }
    if (form.fee === '' || isNaN(parseFloat(form.fee))) { setErr('Valid fee is required'); return; }
    setSaving(true); setErr('');
    try {
      const payload = { ...form };
      if (editId) await api.put(`/members/types/${editId}`, payload);
      else        await api.post('/members/types', payload);
      setModal(false); load();
    } catch (e) {
      setErr(e.response?.data?.message || 'Error saving plan');
    } finally { setSaving(false); }
  };

  const toggleActive = async (p) => {
    try {
      await api.put(`/members/types/${p.id}`, {
        name: p.name, description: p.description || '', fee: p.fee,
        duration_months: p.duration_months, display_order: p.display_order || 0,
        is_active: !p.is_active, benefits: p.benefits || '',
      });
      load();
    } catch (e) { alert(e.response?.data?.message || 'Error updating'); }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try { await api.delete(`/members/types/${p.id}`); load(); }
    catch (e) { alert(e.response?.data?.message || 'Error deleting'); }
  };

  const totalActive   = plans.filter(p => p.is_active).length;
  const totalMembers  = plans.reduce((s, p) => s + parseInt(p.active_member_count || 0), 0);

  return (
    <>
      <div style={{ padding: '1.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Membership Plans</h1>
            <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '4px 0 0' }}>
              Create and manage the plans shown on the public Membership page
            </p>
          </div>
          <button onClick={openAdd} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--primary,#8B0000)', color: '#fff',
            border: 'none', borderRadius: 8, padding: '0.5rem 1rem',
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0,
          }}>
            <Plus size={15} /> New Plan
          </button>
        </div>

        {/* Summary strip */}
        <div style={{ display: 'flex', gap: 12, marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Plans',    value: plans.length,  Icon: Crown,       color: '#8B0000' },
            { label: 'Active Plans',   value: totalActive,   Icon: BadgeCheck,  color: '#059669' },
            { label: 'Active Members', value: totalMembers,  Icon: Users,       color: '#2563eb' },
          ].map(({ label, value, Icon, color }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#fff', border: '1.5px solid #f1f5f9',
              borderRadius: 10, padding: '0.75rem 1.125rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}14`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={17} color={color} />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading…</div>
        ) : plans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <Crown size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>No membership plans yet.</p>
            <button onClick={openAdd} style={{ marginTop: 12, background: 'var(--primary,#8B0000)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              Create First Plan
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {plans.map((p, i) => {
              const { bg, border, accent } = planColor(i);
              return (
                <div key={p.id} style={{
                  background: p.is_active ? '#fff' : '#f8fafc',
                  border: `1.5px solid ${p.is_active ? border : '#e2e8f0'}`,
                  borderRadius: 14, overflow: 'hidden',
                  opacity: p.is_active ? 1 : 0.72,
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
                >
                  {/* Card top accent bar */}
                  <div style={{ height: 4, background: p.is_active ? accent : '#e2e8f0' }} />

                  <div style={{ padding: '1.25rem' }}>
                    {/* Plan header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Crown size={18} color={accent} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>{p.name}</h3>
                          <span style={{
                            display: 'inline-block', marginTop: 3, fontSize: '0.6rem', fontWeight: 700,
                            padding: '1px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.06em',
                            background: p.is_active ? 'rgba(5,150,105,0.1)' : 'rgba(100,116,139,0.1)',
                            color: p.is_active ? '#059669' : '#64748b',
                          }}>
                            {p.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      {/* Display order badge */}
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', background: '#f1f5f9', borderRadius: 6, padding: '2px 6px' }}>
                        Order #{p.display_order || 0}
                      </span>
                    </div>

                    {p.description && (
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.875rem', lineHeight: 1.5 }}>
                        {p.description}
                      </p>
                    )}

                    {/* Fee + Duration */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <IndianRupee size={14} color={accent} />
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: accent }}>
                          {parseFloat(p.fee).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                        <Clock size={12} color="#94a3b8" />
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {p.duration_months ? `${p.duration_months} month${p.duration_months > 1 ? 's' : ''}` : 'Lifetime'}
                        </span>
                      </div>
                    </div>

                    {/* Benefits preview */}
                    {p.benefits && (
                      <div style={{ marginBottom: '0.875rem', background: bg, borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                        <p style={{ fontSize: '0.72rem', color: accent, fontWeight: 600, margin: '0 0 0.25rem' }}>Benefits</p>
                        <p style={{ fontSize: '0.72rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                          {p.benefits.split('\n').slice(0, 3).map((b, j) => (
                            <span key={j} style={{ display: 'block' }}>• {b.replace(/^[-•]\s*/, '')}</span>
                          ))}
                          {p.benefits.split('\n').length > 3 && (
                            <span style={{ color: '#94a3b8' }}>+{p.benefits.split('\n').length - 3} more…</span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Members count */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1rem',
                                  padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: 8 }}>
                      <Users size={13} color="#64748b" />
                      <span style={{ fontSize: '0.78rem', color: '#475569' }}>
                        <strong>{p.active_member_count || 0}</strong> active members
                        {parseInt(p.total_member_count || 0) > parseInt(p.active_member_count || 0) && (
                          <span style={{ color: '#94a3b8' }}> ({p.total_member_count} total)</span>
                        )}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(p)} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
                        padding: '0.4375rem', fontSize: '0.78rem', fontWeight: 600, color: '#475569', cursor: 'pointer',
                      }}>
                        <Pencil size={13} /> Edit
                      </button>
                      <button onClick={() => toggleActive(p)} title={p.is_active ? 'Deactivate' : 'Activate'} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: p.is_active ? 'rgba(5,150,105,0.08)' : 'rgba(100,116,139,0.08)',
                        border: `1px solid ${p.is_active ? 'rgba(5,150,105,0.2)' : 'rgba(100,116,139,0.2)'}`,
                        borderRadius: 8, padding: '0.4375rem 0.625rem', cursor: 'pointer',
                        color: p.is_active ? '#059669' : '#64748b',
                      }}>
                        {p.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button onClick={() => remove(p)} title="Delete" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                        borderRadius: 8, padding: '0.4375rem 0.625rem', cursor: 'pointer', color: '#ef4444',
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 540, maxHeight: '92vh',
                        overflow: 'auto', padding: '1.75rem', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.375rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                {editId ? 'Edit Plan' : 'New Membership Plan'}
              </h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            {err && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 8, padding: '0.625rem 0.875rem', marginBottom: '1rem',
                            fontSize: '0.825rem', color: '#ef4444' }}>
                {err}
              </div>
            )}

            <div style={{ display: 'grid', gap: '0.875rem' }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>Plan Name *</label>
                <input type="text" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Individual Member"
                  style={inputStyle} />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea rows={2} value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Short description shown on the membership card"
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              {/* Fee + Duration row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Fee (₹) *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.875rem' }}>₹</span>
                    <input type="number" min="0" step="0.01" value={form.fee}
                      onChange={e => setForm(p => ({ ...p, fee: e.target.value }))}
                      placeholder="500"
                      style={{ ...inputStyle, paddingLeft: '1.75rem' }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Duration</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {DURATION_PRESETS.map(d => (
                      <button key={d.label} type="button"
                        onClick={() => setForm(p => ({ ...p, duration_months: d.value }))}
                        style={{
                          padding: '4px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                          cursor: 'pointer', border: '1.5px solid',
                          background: form.duration_months === d.value ? 'var(--primary,#8B0000)' : 'transparent',
                          color: form.duration_months === d.value ? '#fff' : '#475569',
                          borderColor: form.duration_months === d.value ? 'var(--primary,#8B0000)' : '#e2e8f0',
                        }}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <label style={labelStyle}>Benefits (one per line)</label>
                <textarea rows={4} value={form.benefits}
                  onChange={e => setForm(p => ({ ...p, benefits: e.target.value }))}
                  placeholder={"Community Directory Access\nDigital Membership Card\nEvent Participation\nJob Opportunities"}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              </div>

              {/* Display order + Active */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'end' }}>
                <div>
                  <label style={labelStyle}>Display Order</label>
                  <input type="number" min="0" value={form.display_order}
                    onChange={e => setForm(p => ({ ...p, display_order: e.target.value }))}
                    style={{ ...inputStyle, width: 80 }} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer', paddingBottom: 8 }}>
                  <input type="checkbox" checked={form.is_active}
                    onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                  Active (visible to public)
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: '1.375rem' }}>
              <button onClick={() => setModal(false)} style={{
                padding: '0.5rem 1.25rem', border: '1.5px solid #e2e8f0', borderRadius: 8,
                background: '#fff', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{
                padding: '0.5rem 1.5rem', background: 'var(--primary,#8B0000)', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
              }}>{saving ? 'Saving…' : editId ? 'Update Plan' : 'Create Plan'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const labelStyle = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600,
  color: '#374151', marginBottom: 4,
};
const inputStyle = {
  width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8,
  border: '1.5px solid #e2e8f0', fontSize: '0.875rem',
  boxSizing: 'border-box', outline: 'none',
};
