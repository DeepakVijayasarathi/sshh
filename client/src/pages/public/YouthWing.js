import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';

const defaultForm = { fullName: '', mobileNumber: '', email: '', dateOfBirth: '', address: '', district: '', city: '', skills: '', interests: '' };

const YouthWing = () => {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState('');
  const debSearch = useDebounce(search);
  const [saving, setSaving] = useState(false);
  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 20 });
    if (debSearch) params.set('search', debSearch);
    api.get(`/youth?${params}`).then(r => setMembers(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [debSearch]);
  useEffect(() => { api.get('/youth/stats').then(r => setStats(r.data)).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/youth', form);
      toast.success('Registration successful! Welcome to Youth Wing.');
      setShowForm(false);
      setForm(defaultForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSaving(false);
    }
  };

  const programs = [
    { icon: '🎯', title: 'Leadership Programs', desc: 'Develop leadership skills through workshops, seminars and mentoring.' },
    { icon: '🤝', title: 'Volunteer Activities', desc: 'Participate in community service and social welfare programs.' },
    { icon: '💡', title: 'Skill Development', desc: 'Technical and soft skill training for career advancement.' },
    { icon: '🏃', title: 'Sports & Culture', desc: 'Cultural events, sports tournaments and creative competitions.' },
  ];

  return (
    <PublicLayout>
      <div className="page-header">
        <div className="container">
          <h1>Youth Wing</h1>
          <p>Empowering the next generation of Sourashtra community leaders</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '1rem', marginBottom: '3rem' }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <div className="card-body">
                  <div style={{ fontSize: '2rem', marginBottom: '0.25rem', color: 'var(--primary)' }}>{stats.totalActive}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>Active Youth Members</div>
                </div>
              </div>
              {stats.byDistrict?.slice(0, 3).map(d => (
                <div key={d.district} className="card" style={{ textAlign: 'center' }}>
                  <div className="card-body">
                    <div style={{ fontSize: '2rem', marginBottom: '0.25rem', color: 'var(--primary)' }}>{d.count}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>{d.district}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-4" style={{ marginBottom: '3rem' }}>
            {programs.map(p => (
              <div key={p.title} className="card" style={{ textAlign: 'center' }}>
                <div className="card-body">
                  <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{p.icon}</div>
                  <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9375rem' }}>{p.title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-light)', lineHeight: 1.5 }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Youth Members</h2>
              <p className="text-muted">{members.length} registered members</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input className="form-control" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
              <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : '+ Join Youth Wing'}
              </button>
            </div>
          </div>

          {showForm && (
            <div className="card mb-4">
              <div className="card-header">Youth Wing Registration</div>
              <form onSubmit={handleSubmit} className="card-body">
                <div className="grid grid-2">
                  <div className="form-group"><label className="form-label">Full Name *</label><input className="form-control" value={form.fullName} onChange={set('fullName')} required /></div>
                  <div className="form-group"><label className="form-label">Mobile *</label><input className="form-control" value={form.mobileNumber} onChange={set('mobileNumber')} required /></div>
                  <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={set('email')} /></div>
                  <div className="form-group"><label className="form-label">Date of Birth</label><input type="date" className="form-control" value={form.dateOfBirth} onChange={set('dateOfBirth')} /></div>
                  <div className="form-group"><label className="form-label">District</label><input className="form-control" value={form.district} onChange={set('district')} /></div>
                  <div className="form-group"><label className="form-label">City</label><input className="form-control" value={form.city} onChange={set('city')} /></div>
                  <div className="form-group"><label className="form-label">Skills</label><input className="form-control" value={form.skills} onChange={set('skills')} placeholder="e.g. Public Speaking, Design..." /></div>
                  <div className="form-group"><label className="form-label">Interests</label><input className="form-control" value={form.interests} onChange={set('interests')} placeholder="e.g. Sports, Music, Technology..." /></div>
                </div>
                <div className="form-group"><label className="form-label">Address</label><textarea className="form-control" rows={2} value={form.address} onChange={set('address')} /></div>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Registering...' : 'Register'}</button>
              </form>
            </div>
          )}

          {loading ? <div className="loading-center"><div className="spinner" /></div> :
            members.length === 0 ? <div className="text-center text-muted" style={{ padding: '3rem' }}>No members found.</div> :
              <div className="grid grid-4">
                {members.map(m => (
                  <div key={m.id} className="card" style={{ textAlign: 'center' }}>
                    <div className="card-body">
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem', margin: '0 auto 0.75rem' }}>
                        {m.full_name.charAt(0)}
                      </div>
                      <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.125rem' }}>{m.full_name}</h3>
                      {m.district && <p className="text-muted" style={{ fontSize: '0.8rem' }}>📍 {m.district}</p>}
                      {m.skills && <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{m.skills.substring(0, 40)}</p>}
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </section>
    </PublicLayout>
  );
};

export default YouthWing;
