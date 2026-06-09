import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';

const Membership = () => {
  const [types, setTypes] = useState([]);

  useEffect(() => {
    api.get('/members/types').then(r => setTypes(r.data)).catch(() => {});
  }, []);

  const benefits = [
    'Community Directory Access', 'Event Participation', 'Digital Membership Card',
    'Business Networking', 'Scholarship Programs', 'Community Updates',
    'Forum Participation', 'Job Opportunities',
  ];

  return (
    <PublicLayout>
      <div className="page-header">
        <div className="container">
          <h1>Membership</h1>
          <p>Join the Sourashtra Community and enjoy exclusive benefits</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">Membership Plans</h2>
            <p className="section-subtitle">Choose the plan that best suits you</p>
          </div>
          <div className="grid grid-4">
            {types.map((type, i) => (
              <div key={type.id} className="card" style={{ border: i === 1 ? '2px solid var(--primary)' : '1px solid var(--border)', position: 'relative' }}>
                {i === 1 && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', padding: '0.25rem 1rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Most Popular</div>}
                <div className="card-body" style={{ textAlign: 'center' }}>
                  <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{type.name}</h3>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>{type.description}</p>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>₹{type.fee}</div>
                  <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                    {type.duration_months ? `Per ${type.duration_months} months` : 'Lifetime'}
                  </p>
                  <Link to="/register" className={`btn ${i === 1 ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%', justifyContent: 'center' }}>Register</Link>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '4rem' }}>
            <h2 className="section-title text-center" style={{ textAlign: 'center' }}>Member Benefits</h2>
            <p className="section-subtitle text-center" style={{ textAlign: 'center' }}>What you get as a member</p>
            <div className="grid grid-4" style={{ marginTop: '1rem' }}>
              {benefits.map(b => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: '0.875rem' }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Membership;
