import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';
import './Auth.css';

const Register = () => {
  const [form, setForm] = useState({
    email: '', password: '', fullName: '', mobileNumber: '',
    gender: '', dateOfBirth: '', address: '', district: '',
    city: '', occupation: '', education: '', membershipTypeId: '',
  });
  const [photo, setPhoto] = useState(null);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/members/types').then(r => setTypes(r.data)).catch(() => {});
  }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (photo) fd.append('photo', photo);
      await api.post('/members', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Registration submitted! Awaiting admin approval.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="auth-page" style={{ alignItems: 'flex-start', padding: '3rem 1rem' }}>
        <div className="auth-card card" style={{ maxWidth: 600 }}>
          <div className="auth-header">
            <div className="auth-logo">SC</div>
            <h2>Join Our Community</h2>
            <p>Register as a Sourashtra Community Member</p>
          </div>
          <form onSubmit={handleSubmit} className="card-body">
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" value={form.fullName} onChange={set('fullName')} required placeholder="Your full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input className="form-control" value={form.mobileNumber} onChange={set('mobileNumber')} required placeholder="10-digit mobile" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input type="email" className="form-control" value={form.email} onChange={set('email')} required placeholder="email@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input type="password" className="form-control" value={form.password} onChange={set('password')} required placeholder="Min 8 characters" minLength={8} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-control" value={form.gender} onChange={set('gender')}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-control" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
              </div>
              <div className="form-group">
                <label className="form-label">District</label>
                <input className="form-control" value={form.district} onChange={set('district')} placeholder="Your district" />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-control" value={form.city} onChange={set('city')} placeholder="Your city" />
              </div>
              <div className="form-group">
                <label className="form-label">Occupation</label>
                <input className="form-control" value={form.occupation} onChange={set('occupation')} placeholder="Your occupation" />
              </div>
              <div className="form-group">
                <label className="form-label">Education</label>
                <input className="form-control" value={form.education} onChange={set('education')} placeholder="Highest qualification" />
              </div>
              <div className="form-group">
                <label className="form-label">Membership Type</label>
                <select className="form-control" value={form.membershipTypeId} onChange={set('membershipTypeId')}>
                  <option value="">Select type</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name} (₹{t.fee})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Photo</label>
                <input type="file" className="form-control" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-control" rows={3} value={form.address} onChange={set('address')} placeholder="Your complete address" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>
            <p className="auth-footer">
              Already a member? <Link to="/login">Sign in here</Link>
            </p>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Register;
