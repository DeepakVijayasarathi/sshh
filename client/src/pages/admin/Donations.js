import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/donations?limit=100'),
      api.get('/donations/summary'),
    ]).then(([d, s]) => {
      setDonations(d.data.data || []);
      setSummary(s.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="page-title">Donation Management</h1>
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Donations', value: `₹${parseFloat(summary.total_amount || 0).toLocaleString()}`, color: '#059669' },
            { label: 'Total Count', value: summary.total_count, color: '#2563eb' },
            { label: 'This Month', value: `₹${parseFloat(summary.this_month || 0).toLocaleString()}`, color: '#8B0000' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow)' }}>
              <p className="text-muted" style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>{s.label}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="admin-card">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-responsive">
            <table>
              <thead><tr><th>Receipt No.</th><th>Donor</th><th>Mobile</th><th>Amount</th><th>Payment</th><th>Purpose</th><th>Date</th></tr></thead>
              <tbody>
                {donations.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>No donations yet</td></tr> :
                  donations.map(d => (
                    <tr key={d.id}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{d.receipt_number}</span></td>
                      <td style={{ fontWeight: 500 }}>{d.donor_name}</td>
                      <td>{d.mobile_number || '—'}</td>
                      <td style={{ fontWeight: 600, color: '#059669' }}>₹{parseFloat(d.amount).toLocaleString()}</td>
                      <td>{d.payment_method || '—'}</td>
                      <td>{d.purpose || '—'}</td>
                      <td>{new Date(d.donated_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Donations;
