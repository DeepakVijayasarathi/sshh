import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import PublicLayout from '../components/common/PublicLayout';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <div style={{ minHeight: 'calc(100vh - 300px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ width:96,height:96,borderRadius:'50%',background:'rgba(139,0,0,0.07)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem'}}><SearchX size={48} color="var(--primary,#8B0000)" strokeWidth={1.25}/></div>
          <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>404</h1>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Page Not Found</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '2rem', lineHeight: 1.7 }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate(-1)}>← Go Back</button>
            <Link to="/" className="btn btn-outline">Go to Home</Link>
          </div>
          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {[['Events', '/events'], ['Members', '/members'], ['Jobs', '/jobs'], ['Contact', '/contact']].map(([label, path]) => (
              <Link key={label} to={path} style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 500 }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default NotFound;
