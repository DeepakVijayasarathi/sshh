import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; // eslint-disable-line no-unused-vars
import PublicLayout from '../../components/common/PublicLayout';
import ImageUploadPreview from '../../components/common/ImageUploadPreview';
import MembershipCard from '../../components/common/MembershipCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    if (!user) return;
    api.get('/users/profile')
      .then(r => {
        setProfile(r.data);
        setForm({
          fullName: r.data.full_name || '',
          mobileNumber: r.data.mobile_number || '',
          address: r.data.address || '',
          district: r.data.district || '',
          city: r.data.city || '',
          pincode: r.data.pincode || '',
          occupation: r.data.occupation || '',
          education: r.data.education || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const fetchCard = async () => {
    try {
      const res = await api.get('/users/membership-card');
      setCardData(res.data);
      setShowCard(true);
    } catch {
      toast.error('No active membership card found.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (photo) fd.append('photo', photo);
      const res = await api.put('/users/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile(prev => ({ ...prev, ...res.data }));
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <PublicLayout>
        <section className="section">
          <div className="container text-center">
            <p>Please <a href="/login" className="text-primary">login</a> to view your profile.</p>
          </div>
        </section>
      </PublicLayout>
    );
  }

  if (loading) return <PublicLayout><div className="loading-center"><div className="spinner" /></div></PublicLayout>;

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  return (
    <PublicLayout>
      <div className="page-header">
        <div className="container">
          <h1>My Profile</h1>
          <p>Manage your Sourashtra community membership</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          {/* Profile header */}
          <div className="card mb-4">
            <div className="card-body" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                {profile?.photo_url ? (
                  <img src={profile.photo_url} alt={profile.full_name} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
                ) : (
                  <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.25rem', fontWeight: 700, border: '3px solid var(--primary)' }}>
                    {profile?.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.25rem' }}>{profile?.full_name || user.email}</h2>
                <p className="text-muted" style={{ marginBottom: '0.25rem' }}>{user.email}</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-info">{user.role}</span>
                  {profile?.member_status && (
                    <span className={`badge ${profile.member_status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{profile.member_status}</span>
                  )}
                  {profile?.membership_number && (
                    <span className="badge badge-secondary">{profile.membership_number}</span>
                  )}
                  {profile?.membership_type && (
                    <span className="badge badge-secondary">{profile.membership_type}</span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {profile?.member_status === 'Active' && (
                  <button className="btn btn-secondary btn-sm" onClick={fetchCard}>🪪 View ID Card</button>
                )}
                <button className="btn btn-primary btn-sm" onClick={() => setEditing(!editing)}>
                  {editing ? 'Cancel' : '✏️ Edit Profile'}
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: '1.5rem' }}>
            {['profile', 'security'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', fontWeight: 500, fontSize: '0.9375rem', cursor: 'pointer', color: tab === t ? 'var(--primary)' : 'var(--text-light)', borderBottom: `2px solid ${tab === t ? 'var(--primary)' : 'transparent'}`, marginBottom: -2, transition: 'all 0.2s', textTransform: 'capitalize' }}>
                {t === 'profile' ? '👤 Profile Info' : '🔒 Security'}
              </button>
            ))}
          </div>

          {tab === 'profile' && (
            editing ? (
              <div className="card">
                <div className="card-header">Edit Profile Information</div>
                <form onSubmit={handleSave} className="card-body">
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-control" value={form.fullName} onChange={set('fullName')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mobile Number</label>
                      <input className="form-control" value={form.mobileNumber} onChange={set('mobileNumber')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">District</label>
                      <input className="form-control" value={form.district} onChange={set('district')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input className="form-control" value={form.city} onChange={set('city')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pincode</label>
                      <input className="form-control" value={form.pincode} onChange={set('pincode')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Occupation</label>
                      <input className="form-control" value={form.occupation} onChange={set('occupation')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Education</label>
                      <input className="form-control" value={form.education} onChange={set('education')} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <textarea className="form-control" rows={2} value={form.address} onChange={set('address')} />
                  </div>
                  <ImageUploadPreview
                    label="Profile Photo"
                    name="photo"
                    currentUrl={profile?.photo_url}
                    onChange={(file) => setPhoto(file)}
                  />
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                    <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="card">
                <div className="card-body">
                  <div className="grid grid-2" style={{ gap: '1.25rem' }}>
                    {[
                      ['Full Name', profile?.full_name],
                      ['Email', user.email],
                      ['Mobile', profile?.mobile_number],
                      ['Gender', profile?.gender],
                      ['Date of Birth', profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-IN') : null],
                      ['District', profile?.district],
                      ['City', profile?.city],
                      ['Pincode', profile?.pincode],
                      ['Occupation', profile?.occupation],
                      ['Education', profile?.education],
                    ].map(([label, value]) => value && (
                      <div key={label}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</p>
                        <p style={{ fontWeight: 500 }}>{value}</p>
                      </div>
                    ))}
                    {profile?.address && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Address</p>
                        <p style={{ fontWeight: 500 }}>{profile.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          )}

          {tab === 'security' && <ChangePasswordForm />}
        </div>
      </section>

      {showCard && cardData && (
        <MembershipCard member={cardData} onClose={() => setShowCard(false)} />
      )}
    </PublicLayout>
  );
};

const ChangePasswordForm = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 440 }}>
      <div className="card-header">Change Password</div>
      <form onSubmit={handleSubmit} className="card-body">
        <div className="form-group">
          <label className="form-label">Current Password</label>
          <input type="password" className="form-control" value={form.currentPassword} onChange={e => setForm({...form, currentPassword: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input type="password" className="form-control" value={form.newPassword} onChange={e => setForm({...form, newPassword: e.target.value})} required minLength={8} />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input type="password" className="form-control" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Updating...' : 'Update Password'}</button>
      </form>
    </div>
  );
};

export default Profile;
