import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { User, Phone, Mail, Lock, MapPin, Briefcase, GraduationCap, Camera, ArrowRight, CheckCircle, Users, Plus, Trash2 } from 'lucide-react';
import PublicLayout from '../../components/common/PublicLayout';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import api from '../../services/api';

const STEPS = [
  { id: 1, title: 'Account',  subtitle: 'Login credentials' },
  { id: 2, title: 'Personal', subtitle: 'Your information' },
  { id: 3, title: 'Location', subtitle: 'Where you live' },
];

const FieldGroup = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 1.25rem' }}>
    {children}
  </div>
);

const StepIndicator = ({ step, current }) => {
  const done   = step.id < current;
  const active = step.id === current;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s',
        background: done ? '#059669' : active ? 'var(--primary)' : '#f3f4f6',
        color: done || active ? 'white' : '#9ca3af',
        boxShadow: active ? '0 0 0 4px rgba(var(--primary-rgb),0.15)' : 'none',
      }}>
        {done ? <CheckCircle size={16} /> : step.id}
      </div>
      <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: active ? 'var(--primary)' : done ? '#059669' : '#9ca3af', marginTop: 5, marginBottom: 0 }}>
        {step.title}
      </p>
    </div>
  );
};

const Register = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: '', password: '', mobileNumber: '',
    fullName: '', gender: '', dateOfBirth: '',
    gotra: '', ghernov: '', fatherName: '', motherName: '', spouseName: '', wifeAge: '',
    childrenCount: '',
    occupation: '', education: '',
    address: '', district: '', city: '', pincode: '', state: '', referenceBy: '',
  });
  const [children, setChildren] = useState([]);
  const [photo, setPhoto]         = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [refMember, setRefMember]   = useState(null);
  const [refLoading, setRefLoading] = useState(false);
  const [loading, setLoading]     = useState(false);
  const navigate  = useNavigate();
  const settings  = useSiteSettings();
  const siteName  = settings.site_name || 'Saurashtra Heritage Chair';

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  // Sync children array length with childrenCount
  useEffect(() => {
    const count = Math.max(0, parseInt(form.childrenCount) || 0);
    setChildren(prev => {
      if (count > prev.length) {
        return [...prev, ...Array(count - prev.length).fill({ name: '', age: '' })];
      }
      return prev.slice(0, count);
    });
  }, [form.childrenCount]);

  const updateChild = (idx, field, val) => {
    setChildren(prev => prev.map((c, i) => i === idx ? { ...c, [field]: val } : c));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const lookupMemberId = async (memberId) => {
    if (!memberId) { setRefMember(null); return; }
    setRefLoading(true);
    try {
      const r = await api.get(`/members?search=${encodeURIComponent(memberId)}&limit=1`);
      const m = (r.data.data || [])[0];
      setRefMember(m || null);
    } catch {
      setRefMember(null);
    } finally {
      setRefLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (children.length) fd.append('childrenDetails', JSON.stringify(children));
      if (photo) fd.append('photo', photo);
      await api.post('/members', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Registration submitted! Your application is pending approval. You can login once approved.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = (e) => { e.preventDefault(); setStep(s => Math.min(s + 1, 3)); };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <PublicLayout>
      <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 68px)', padding: '2.5rem 1rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 640 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, background: 'var(--primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1rem', margin: '0 auto 0.875rem',
              boxShadow: '0 4px 16px rgba(var(--primary-rgb),0.3)',
            }}>
              {settings.logo_url
                ? <img src={settings.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 10 }} />
                : siteName.slice(0, 2).toUpperCase()
              }
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 0.375rem' }}>Join Our Community</h1>
            <p style={{ fontSize: '0.9375rem', color: '#9ca3af', margin: 0 }}>Register as a {siteName} member</p>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.75rem', position: 'relative' }}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <StepIndicator step={s} current={step} />
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: 2, background: step > s.id ? '#059669' : '#f3f4f6',
                    transition: 'background 0.3s', marginTop: -18,
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Card */}
          <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 4px 24px -4px rgba(0,0,0,0.10)', border: '1px solid #f1f5f9', padding: '2rem' }}>
            <form onSubmit={step < 3 ? nextStep : handleSubmit}>

              {/* Step 1: Account */}
              {step === 1 && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: '0 0 1.25rem' }}>Account Credentials</h3>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-email">Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                      <input id="reg-email" type="email" className="form-control" value={form.email} onChange={set('email')} required placeholder="your@email.com" style={{ paddingLeft: '2.5rem' }} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-password">Password <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                      <input id="reg-password" type="password" className="form-control" value={form.password} onChange={set('password')} required placeholder="Min 8 characters" minLength={8} style={{ paddingLeft: '2.5rem' }} />
                    </div>
                    <p className="form-hint">Use at least 8 characters with a mix of letters and numbers.</p>
                  </div>
                </div>
              )}

              {/* Step 2: Personal */}
              {step === 2 && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: '0 0 1.25rem' }}>Personal Information</h3>
                  <FieldGroup>
                    <div className="form-group">
                      <label className="form-label">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <User size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                        <input className="form-control" value={form.fullName} onChange={set('fullName')} required placeholder="Your full name" style={{ paddingLeft: '2.5rem' }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Contact Number <span style={{ color: '#ef4444' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                        <input className="form-control" value={form.mobileNumber} onChange={set('mobileNumber')} required placeholder="10-digit mobile number" style={{ paddingLeft: '2.5rem' }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select className="form-control" value={form.gender} onChange={set('gender')}>
                        <option value="">Select gender</option>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date of Birth</label>
                      <input type="date" className="form-control" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gothtra (Gotra / Clan)</label>
                      <input className="form-control" value={form.gotra} onChange={set('gotra')} placeholder="Your gotra / clan lineage" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Ghernov (Family Group)</label>
                      <input className="form-control" value={form.ghernov} onChange={set('ghernov')} placeholder="Your family / house group" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Father's Name</label>
                      <input className="form-control" value={form.fatherName} onChange={set('fatherName')} placeholder="Father's full name" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mother's Name</label>
                      <input className="form-control" value={form.motherName} onChange={set('motherName')} placeholder="Mother's full name" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Wife / Husband Name</label>
                      <div style={{ position: 'relative' }}>
                        <Users size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                        <input className="form-control" value={form.spouseName} onChange={set('spouseName')} placeholder="Spouse's full name" style={{ paddingLeft: '2.5rem' }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Wife Age</label>
                      <input type="number" min="1" max="120" className="form-control" value={form.wifeAge} onChange={set('wifeAge')} placeholder="Wife's age" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Occupation</label>
                      <div style={{ position: 'relative' }}>
                        <Briefcase size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                        <input className="form-control" value={form.occupation} onChange={set('occupation')} placeholder="Your occupation" style={{ paddingLeft: '2.5rem' }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Education</label>
                      <div style={{ position: 'relative' }}>
                        <GraduationCap size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                        <input className="form-control" value={form.education} onChange={set('education')} placeholder="Highest qualification" style={{ paddingLeft: '2.5rem' }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Number of Children</label>
                      <input type="number" min="0" max="20" className="form-control" value={form.childrenCount} onChange={set('childrenCount')} placeholder="0" />
                    </div>
                  </FieldGroup>

                  {/* Dynamic children details */}
                  {children.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151', marginBottom: '0.75rem' }}>Children Details</p>
                      {children.map((child, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '0.625rem' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.8rem' }}>Child {idx + 1} Name</label>
                            <input className="form-control" value={child.name} onChange={e => updateChild(idx, 'name', e.target.value)} placeholder={`Child ${idx + 1} name`} />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0, minWidth: 90 }}>
                            <label className="form-label" style={{ fontSize: '0.8rem' }}>Age</label>
                            <input type="number" min="0" max="60" className="form-control" value={child.age} onChange={e => updateChild(idx, 'age', e.target.value)} placeholder="Age" />
                          </div>
                          <div style={{ paddingBottom: '0.25rem' }}>
                            <button type="button" onClick={() => { setChildren(p => p.filter((_, i) => i !== idx)); setForm(f => ({ ...f, childrenCount: String(children.length - 1) })); }}
                              style={{ background: '#fef2f2', border: 'none', color: '#dc2626', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Photo Upload */}
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label">Profile Photo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: 72, height: 72, borderRadius: 12,
                        background: photoPreview ? 'transparent' : '#f3f4f6',
                        overflow: 'hidden', flexShrink: 0, border: '2px dashed #e5e7eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {photoPreview
                          ? <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <Camera size={22} style={{ color: '#d1d5db' }} />
                        }
                      </div>
                      <div>
                        <label htmlFor="photo-upload" className="btn btn-sm btn-ghost" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Camera size={14} /> {photoPreview ? 'Change Photo' : 'Upload Photo'}
                        </label>
                        <input id="photo-upload" type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                        <p className="form-hint" style={{ marginTop: 4 }}>JPG, PNG up to 2MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Location */}
              {step === 3 && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: '0 0 1.25rem' }}>Location Details</h3>
                  <FieldGroup>
                    <div className="form-group">
                      <label className="form-label">District</label>
                      <div style={{ position: 'relative' }}>
                        <MapPin size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                        <input className="form-control" value={form.district} onChange={set('district')} placeholder="Your district" style={{ paddingLeft: '2.5rem' }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">City / Town</label>
                      <div style={{ position: 'relative' }}>
                        <MapPin size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                        <input className="form-control" value={form.city} onChange={set('city')} placeholder="Your city" style={{ paddingLeft: '2.5rem' }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pincode</label>
                      <input className="form-control" value={form.pincode} onChange={set('pincode')} placeholder="6-digit pincode" maxLength={6} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input className="form-control" value={form.state} onChange={set('state')} placeholder="State name" />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Full Address</label>
                      <textarea className="form-control" rows={3} value={form.address} onChange={set('address')} placeholder="House / Street / Area" style={{ resize: 'vertical' }} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Reference By (Member ID)</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          className="form-control"
                          value={form.referenceBy}
                          onChange={e => { set('referenceBy')(e); setRefMember(null); }}
                          placeholder="Enter member ID (e.g. SCP20240001)"
                        />
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => lookupMemberId(form.referenceBy)}
                          disabled={!form.referenceBy || refLoading}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {refLoading ? '…' : 'Verify'}
                        </button>
                      </div>
                      {refMember && (
                        <p style={{ fontSize: '0.8rem', color: '#059669', marginTop: '0.375rem' }}>
                          ✓ {refMember.full_name} ({refMember.membership_number})
                        </p>
                      )}
                      {form.referenceBy && !refLoading && refMember === null && form.referenceBy.length > 3 && (
                        <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.375rem' }}>
                          Member ID not found. You can still submit.
                        </p>
                      )}
                    </div>
                  </FieldGroup>
                </div>
              )}

              {/* Navigation buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
                {step > 1 && (
                  <button type="button" className="btn btn-ghost" onClick={prevStep} style={{ flex: 1 }}>
                    ← Back
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ flex: step > 1 ? 2 : 1, justifyContent: 'center' }}
                >
                  {loading ? (
                    <><span className="spinner-sm" style={{ borderTopColor: 'white' }} /> Submitting…</>
                  ) : step < 3 ? (
                    <>Continue <ArrowRight size={15} /></>
                  ) : (
                    <>Submit Registration <ArrowRight size={15} /></>
                  )}
                </button>
              </div>
            </form>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                Already a member?{' '}
                <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in →</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Register;
