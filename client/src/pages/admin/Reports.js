import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const Reports = () => {
  const [memberFilter, setMemberFilter] = useState({ district: '', membershipType: '', status: '' });
  const [memberReport, setMemberReport] = useState(null);
  const [districtReport, setDistrictReport] = useState(null);
  const [donationReport, setDonationReport] = useState(null);
  const [loading, setLoading] = useState({});

  const fetchMemberReport = async () => {
    setLoading(l => ({ ...l, members: true }));
    try {
      const params = new URLSearchParams(memberFilter);
      Object.keys(memberFilter).forEach(k => !memberFilter[k] && params.delete(k));
      const res = await api.get(`/reports/members?${params}`);
      setMemberReport(res.data);
    } catch { toast.error('Failed to fetch report'); }
    finally { setLoading(l => ({ ...l, members: false })); }
  };

  const fetchDistrictReport = async () => {
    setLoading(l => ({ ...l, district: true }));
    try {
      const res = await api.get('/reports/district');
      setDistrictReport(res.data);
    } catch { toast.error('Failed'); }
    finally { setLoading(l => ({ ...l, district: false })); }
  };

  const fetchDonationReport = async () => {
    setLoading(l => ({ ...l, donation: true }));
    try {
      const res = await api.get('/reports/donations');
      setDonationReport(res.data);
    } catch { toast.error('Failed'); }
    finally { setLoading(l => ({ ...l, donation: false })); }
  };

  const exportExcel = (type, params = '') => {
    window.open(`/api/reports/${type}?format=excel${params ? '&' + params : ''}`, '_blank');
  };

  const exportPDF = (type, extraParams = '') => {
    window.open(`/api/reports/${type}?format=pdf${extraParams ? '&' + extraParams : ''}`, '_blank');
  };

  const exportMemberPDF = () => {
    const params = new URLSearchParams(memberFilter);
    Object.keys(memberFilter).forEach(k => !memberFilter[k] && params.delete(k));
    const extra = params.toString();
    window.open(`/api/reports/members?format=pdf${extra ? '&' + extra : ''}`, '_blank');
  };

  useEffect(() => {
    fetchDistrictReport();
    fetchDonationReport();
  }, []);

  return (
    <div>
      <h1 className="page-title">Reports & Analytics</h1>

      {/* Member Report */}
      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontWeight: 600 }}>Member Report</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-sm btn-outline" onClick={() => exportExcel('members')}>📊 Excel</button>
            <button className="btn btn-sm btn-outline" onClick={exportMemberPDF}>📄 PDF</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input className="form-control" placeholder="District" value={memberFilter.district} onChange={e => setMemberFilter({ ...memberFilter, district: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select className="form-control" value={memberFilter.status} onChange={e => setMemberFilter({ ...memberFilter, status: e.target.value })}>
              <option value="">All Status</option>
              {['Active', 'Pending', 'Rejected', 'Expired'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={fetchMemberReport} disabled={loading.members}>{loading.members ? 'Loading...' : 'Generate Report'}</button>
        </div>
        {memberReport && (
          <>
            <p className="text-muted" style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}>Found {memberReport.count} members</p>
            <div className="table-responsive" style={{ maxHeight: 400, overflowY: 'auto' }}>
              <table>
                <thead><tr><th>Member No.</th><th>Name</th><th>Gender</th><th>Mobile</th><th>District</th><th>Occupation</th><th>Type</th><th>Status</th></tr></thead>
                <tbody>
                  {memberReport.data.map(m => (
                    <tr key={m.membership_number || m.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{m.membership_number || '—'}</td>
                      <td>{m.full_name}</td>
                      <td>{m.gender || '—'}</td>
                      <td>{m.mobile_number}</td>
                      <td>{m.district || '—'}</td>
                      <td>{m.occupation || '—'}</td>
                      <td>{m.membership_type || '—'}</td>
                      <td><span className={`badge ${m.status === 'Active' ? 'badge-success' : m.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>{m.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* District Report */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontWeight: 600 }}>Members by District</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-sm btn-outline" onClick={() => exportExcel('district')}>📊 Excel</button>
              <button className="btn btn-sm btn-outline" onClick={() => exportPDF('district')}>📄 PDF</button>
            </div>
          </div>
          {loading.district ? <div className="loading-center"><div className="spinner" /></div> : districtReport && (
            <div className="table-responsive">
              <table>
                <thead><tr><th>District</th><th>Total</th><th>Active</th><th>Pending</th></tr></thead>
                <tbody>
                  {districtReport.map(d => (
                    <tr key={d.district}>
                      <td style={{ fontWeight: 500 }}>{d.district}</td>
                      <td>{d.total}</td>
                      <td style={{ color: '#16a34a' }}>{d.active}</td>
                      <td style={{ color: '#d97706' }}>{d.pending}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Donation Report */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontWeight: 600 }}>Donation Report</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-sm btn-outline" onClick={() => exportExcel('donations')}>📊 Excel</button>
              <button className="btn btn-sm btn-outline" onClick={() => exportPDF('donations')}>📄 PDF</button>
            </div>
          </div>
          {loading.donation ? <div className="loading-center"><div className="spinner" /></div> : donationReport && (
            <>
              {donationReport.summary && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669' }}>₹{parseFloat(donationReport.summary.total_amount || 0).toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Total Collected</div>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{donationReport.summary.count || 0}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Donations</div>
                  </div>
                </div>
              )}
              <div className="table-responsive">
                <table>
                  <thead><tr><th>Receipt</th><th>Donor</th><th>Amount</th><th>Method</th></tr></thead>
                  <tbody>
                    {(donationReport.data || []).slice(0, 10).map(d => (
                      <tr key={d.receipt_number}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{d.receipt_number}</td>
                        <td>{d.donor_name}</td>
                        <td style={{ fontWeight: 600, color: '#059669' }}>₹{parseFloat(d.amount).toLocaleString()}</td>
                        <td>{d.payment_method || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Event Report */}
      <div className="admin-card" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontWeight: 600 }}>Event Report</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-sm btn-outline" onClick={() => exportExcel('events')}>📊 Excel</button>
            <button className="btn btn-sm btn-outline" onClick={() => exportPDF('events')}>📄 PDF</button>
          </div>
        </div>
        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Download event participation and registration data as Excel or PDF.</p>
      </div>
    </div>
  );
};

export default Reports;
