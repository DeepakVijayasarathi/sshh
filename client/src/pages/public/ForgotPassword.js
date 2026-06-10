import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, CheckCircle2 } from 'lucide-react';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  return <PublicLayout>{token ? <ResetForm token={token} /> : <RequestForm />}</PublicLayout>;
};

const RequestForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card card">
          <div className="auth-header">
            <div style={{ width:56,height:56,borderRadius:'50%',background:'rgba(37,99,235,0.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 0.5rem'}}><Mail size={26} color="#2563eb" strokeWidth={1.5}/></div>
            <h2>Check your email</h2>
            <p>If an account exists for <strong>{email}</strong>, we've sent password reset instructions.</p>
          </div>
          <div className="card-body">
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-logo">🔑</div>
          <h2>Forgot Password</h2>
          <p>Enter your email address and we'll send you a reset link.</p>
        </div>
        <form onSubmit={handleSubmit} className="card-body">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <p className="auth-footer"><Link to="/login">← Back to Login</Link></p>
        </form>
      </div>
    </div>
  );
};

const ResetForm = ({ token }) => {
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/users/reset-password', { token, newPassword: form.newPassword });
      toast.success('Password reset successfully!');
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card card">
          <div className="auth-header">
            <div style={{ width:56,height:56,borderRadius:'50%',background:'rgba(5,150,105,0.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 0.5rem'}}><CheckCircle2 size={26} color="#059669" strokeWidth={1.5}/></div>
            <h2>Password Reset!</h2>
            <p>Your password has been reset successfully.</p>
          </div>
          <div className="card-body">
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-logo">🔒</div>
          <h2>Set New Password</h2>
          <p>Enter your new password below.</p>
        </div>
        <form onSubmit={handleSubmit} className="card-body">
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-control" value={form.newPassword} onChange={e => setForm({...form, newPassword: e.target.value})} required minLength={8} placeholder="Min 8 characters" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="form-control" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} required placeholder="Repeat password" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
