import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the link.');
      return;
    }
    api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(() => setStatus('success'))
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
      });
  }, [token]);

  return (
    <PublicLayout>
      <div className="auth-page">
        <div className="auth-card card">
          <div className="auth-header">
            {status === 'loading' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                  <Loader2 size={40} color="var(--primary, #8B0000)" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
                <h2>Verifying your email…</h2>
                <p>Please wait a moment.</p>
              </>
            )}
            {status === 'success' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                  <CheckCircle2 size={40} color="#059669" />
                </div>
                <h2>Email Verified!</h2>
                <p>Your email address has been successfully verified. You can now enjoy full access to your account.</p>
              </>
            )}
            {status === 'error' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                  <XCircle size={40} color="#dc2626" />
                </div>
                <h2>Verification Failed</h2>
                <p>{message}</p>
              </>
            )}
          </div>
          <div className="card-body">
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default VerifyEmail;
