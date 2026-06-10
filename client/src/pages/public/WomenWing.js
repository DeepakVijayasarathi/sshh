import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Briefcase, Heart, BookOpen, Users, MapPin } from 'lucide-react';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';

const PROGRAM_ICONS = { Briefcase, Heart, BookOpen, Users };

const defaultForm = { fullName: '', mobileNumber: '', email: '', dateOfBirth: '', address: '', district: '', city: '', occupation: '', programInterest: '' };

const WomenWing = () => {
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
    api.get(`/women?${params}`).then(r => setMembers(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [debSearch]);
  useEffect(() => { api.get('/women/stats').then(r => setStats(r.data)).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/women', form);
      toast.success('Registration successful! Welcome to Women Wing.');
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
    { icon: 'Briefcase', title: 'Entrepreneurship', desc: 'Business training, mentoring and startup support for women entrepreneurs.' },
    { icon: 'Heart',     title: 'Women Welfare',   desc: 'Health awareness, counseling and welfare support programs.' },
    { icon: 'BookOpen',  title: 'Skill Development', desc: 'Vocational training and professional skill enhancement courses.' },
    { icon: 'Users',     title: 'Networking',      desc: 'Connect with successful women professionals from the community.' },
  ];

  return (
    <PublicLayout>
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #8B0000 0%, #c2185b 100%)' }}>
        <div className="container">
          <h1>Women Wing</h1>
          <p>Empowering Sourashtra women through education, entrepreneurship and welfare</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '1rem', marginBottom: '3rem' }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <div className="card-body">
                  <div style={{ fontSize: '2rem', marginBottom: '0.25rem', color: '#c2185b' }}>{stats.totalActive}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>Active Members</div>
                </div>
              </div>
              {stats.byDistrict?.slice(0, 3).map(d => (
                <div key={d.district} className="card" style={{ textAlign: 'center' }}>
                  <div className="card-body">
                    <div style={{ fontSize: '2rem', marginBottom: '0.25rem', color: '#c2185b' }}>{d.count}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>{d.district}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-4" style={{ marginBottom: '3rem' }}>
            {programs.map(p => (
              <div key={p.title} className="card" style={{ textAlign: 'center', borderTop: '3px solid #c2185b' }}>
                <div className="card-body">
                  {(() => { const I = PROGRAM_ICONS[p.icon]; return I ? <div style={{ width:44,height:44,borderRadius:10,background:'rgba(194,24,91,0.08)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 0.75rem'}}><I size={22} color="#c2185b" strokeWidth={1.75}/></div> : null; })()}
                  <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9375rem' }}>{p.title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-light)', lineHeight: 1.5 }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Women Members</h2>
              <p className="text-muted">{members.length} registered</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input className="form-control" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
              <button className="btn btn-primary" style={{ background: '#c2185b', borderColor: '#c2185b' }} onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : '+ Join Women Wing'}
              </button>
            </div>
          </div>

          {showForm && (
            <div className="card mb-4">
              <div className="card-header">Women Wing Registration</div>
              <form onSubmit={handleSubmit} className="card-body">
                <div className="grid grid-2">
                  <div className="form-group"><label className="form-label">Full Name *</label><input className="form-control" value={form.fullName} onChange={set('fullName')} required /></div>
                  <div className="form-group"><label className="form-label">Mobile *</label><input className="form-control" value={form.mobileNumber} onChange={set('mobileNumber')} required /></div>
                  <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={set('email')} /></div>
                  <div className="form-group"><label className="form-label">Date of Birth</label><input type="date" className="form-control" value={form.dateOfBirth} onChange={set('dateOfBirth')} /></div>
                  <div className="form-group"><label className="form-label">District</label><input className="form-control" value={form.district} onChange={set('district')} /></div>
                  <div className="form-group"><label className="form-label">City</label><input className="form-control" value={form.city} onChange={set('city')} /></div>
                  <div className="form-group"><label className="form-label">Occupation</label><input className="form-control" value={form.occupation} onChange={set('occupation')} /></div>
                  <div className="form-group"><label className="form-label">Program Interest</label><input className="form-control" value={form.programInterest} onChange={set('programInterest')} placeholder="e.g. Entrepreneurship, Skill Development..." /></div>
                </div>
                <div className="form-group"><label className="form-label">Address</label><textarea className="form-control" rows={2} value={form.address} onChange={set('address')} /></div>
                <button type="submit" className="btn btn-primary" style={{ background: '#c2185b' }} disabled={saving}>{saving ? 'Registering...' : 'Register'}</button>
              </form>
            </div>
          )}

          {loading ? <div className="loading-center"><div className="spinner" /></div> :
            members.length === 0 ? <div className="text-center text-muted" style={{ padding: '3rem' }}>No members found.</div> :
              <div className="grid grid-4">
                {members.map(m => (
                  <div key={m.id} className="card" style={{ textAlign: 'center' }}>
                    <div className="card-body">
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#c2185b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem', margin: '0 auto 0.75rem' }}>
                        {m.full_name.charAt(0)}
                      </div>
                      <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.125rem' }}>{m.full_name}</h3>
                      {m.district && <p className="text-muted" style={{ fontSize: '0.8rem', display:'flex', alignItems:'center', gap:3 }}><MapPin size={11}/> {m.district}</p>}
                      {m.occupation && <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{m.occupation}</p>}
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

export default WomenWing;
