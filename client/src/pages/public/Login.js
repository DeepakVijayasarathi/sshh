import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import PublicLayout from '../../components/common/PublicLayout';

const Login = () => {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const settings   = useSiteSettings();
  const siteName   = settings.site_name || 'Sourashtra';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome back!');
      if (['SuperAdmin', 'Admin'].includes(user.role)) {
        navigate('/admin');
      } else {
        window.location.href = 'https://sshtn.com/';
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: 'var(--primary)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1.125rem', margin: '0 auto 1rem',
              boxShadow: '0 4px 16px rgba(var(--primary-rgb),0.3)',
            }}>
              {settings.logo_url
                ? <img src={settings.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }} />
                : siteName.slice(0, 2).toUpperCase()
              }
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 0.375rem' }}>Welcome back</h1>
            <p style={{ fontSize: '0.9375rem', color: '#9ca3af', margin: 0 }}>Sign in to your {siteName} account</p>
          </div>

          {/* Card */}
          <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 4px 24px -4px rgba(0,0,0,0.10)', border: '1px solid #f1f5f9', padding: '2rem' }}>
            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                    autoComplete="email"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                  <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 500 }}>Forgot password?</Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                  <input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    className="form-control"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(s => !s)}
                    style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '0.9375rem' }}
              >
                {loading ? (
                  <><span className="spinner-sm" style={{ borderTopColor: 'white' }} /> Signing in…</>
                ) : (
                  <>Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one →</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Login;
