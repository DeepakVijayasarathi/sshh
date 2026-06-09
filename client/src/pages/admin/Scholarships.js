import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const STATUS_BADGES = { Pending: 'badge-warning', 'Under Review': 'badge-info', Approved: 'badge-success', Rejected: 'badge-danger' };

const Scholarships = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', amount: '', remarks: '', rejectionReason: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    const url = status ? `/scholarships?status=${encodeURIComponent(status)}&limit=50` : '/scholarships?limit=50';
    api.get(url).then(r => setApps(r.data.data || [])).catch(() => setApps([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]);

  const updateStatus = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put(`/scholarships/${selected.id}/status`, statusForm);
      toast.success('Status updated');
      setSelected(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Scholarship Applications</h1>
        <select className="form-control" style={{ width: 180 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {['Pending','Under Review','Approved','Rejected'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="admin-card">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-responsive">
            <table>
              <thead><tr><th>Student</th><th>College</th><th>Course</th><th>Marks%</th><th>Year</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {apps.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>No applications</td></tr> :
                  apps.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 500 }}>{a.full_name}<br /><span className="text-muted" style={{ fontSize: '0.75rem' }}>{a.mobile_number}</span></td>
                      <td>{a.school_college}</td>
                      <td>{a.course}</td>
                      <td>{a.marks_percentage || '—'}</td>
                      <td>{a.academic_year}</td>
                      <td><span className={`badge ${STATUS_BADGES[a.status] || 'badge-secondary'}`}>{a.status}</span></td>
                      <td>
                        <button className="btn btn-sm btn-outline" onClick={() => { setSelected(a); setStatusForm({ status: a.status, amount: a.amount || '', remarks: a.remarks || '', rejectionReason: '' }); }}>
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="card" style={{ width: 480, padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Update: {selected.full_name}</h3>
            <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>{selected.school_college} • {selected.course}</p>
            <div style={{ background: '#f9fafb', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {selected.income_certificate_url && <a href={selected.income_certificate_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline" style={{ marginRight: '0.5rem' }}>Income Cert</a>}
              {selected.community_certificate_url && <a href={selected.community_certificate_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline" style={{ marginRight: '0.5rem' }}>Community Cert</a>}
              {selected.marksheet_url && <a href={selected.marksheet_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">Marksheet</a>}
            </div>
            <form onSubmit={updateStatus}>
              <div className="form-group">
                <label className="form-label">Status *</label>
                <select className="form-control" value={statusForm.status} onChange={e => setStatusForm({...statusForm, status: e.target.value})} required>
                  <option value="">Select</option>
                  {['Pending','Under Review','Approved','Rejected'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              {statusForm.status === 'Approved' && (
                <div className="form-group">
                  <label className="form-label">Scholarship Amount (₹)</label>
                  <input type="number" className="form-control" value={statusForm.amount} onChange={e => setStatusForm({...statusForm, amount: e.target.value})} />
                </div>
              )}
              {statusForm.status === 'Rejected' && (
                <div className="form-group">
                  <label className="form-label">Rejection Reason</label>
                  <textarea className="form-control" rows={2} value={statusForm.rejectionReason} onChange={e => setStatusForm({...statusForm, rejectionReason: e.target.value})} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Remarks</label>
                <textarea className="form-control" rows={2} value={statusForm.remarks} onChange={e => setStatusForm({...statusForm, remarks: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scholarships;
