import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const STATUS_BADGES = { Pending: 'badge-warning', 'Under Review': 'badge-info', Resolved: 'badge-success', Closed: 'badge-secondary' };

const Forum = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const load = () => {
    setLoading(true);
    const url = status ? `/forums/issues?status=${encodeURIComponent(status)}&limit=50` : '/forums/issues?limit=50';
    api.get(url).then(r => setIssues(r.data.data || [])).catch(() => setIssues([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]);

  const updateStatus = async (id, s) => {
    try {
      await api.put(`/forums/issues/${id}/status`, { status: s });
      toast.success('Status updated');
      load();
    } catch { toast.error('Failed'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this issue?')) return;
    try { await api.delete(`/forums/issues/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Community Forum</h1>
        <select className="form-control" style={{ width: 200 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Issues</option>
          {['Pending','Under Review','Resolved','Closed'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="admin-card">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-responsive">
            <table>
              <thead><tr><th>Issue Title</th><th>By</th><th>Category</th><th>Location</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {issues.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>No issues</td></tr> :
                  issues.map(issue => (
                    <tr key={issue.id}>
                      <td style={{ fontWeight: 500 }}>{issue.issue_title.substring(0, 40)}{issue.issue_title.length > 40 ? '...' : ''}</td>
                      <td>{issue.name}</td>
                      <td><span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{issue.category || '—'}</span></td>
                      <td>{issue.location || '—'}</td>
                      <td><span className={`badge ${STATUS_BADGES[issue.status]}`}>{issue.status}</span></td>
                      <td>{new Date(issue.created_at).toLocaleDateString('en-IN')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <select className="form-control" style={{ fontSize: '0.8rem', padding: '0.25rem', width: 130 }}
                            value={issue.status}
                            onChange={e => updateStatus(issue.id, e.target.value)}>
                            {['Pending','Under Review','Resolved','Closed'].map(s => <option key={s}>{s}</option>)}
                          </select>
                          <button className="btn btn-sm btn-danger" onClick={() => remove(issue.id)}>Delete</button>
                        </div>
                      </td>
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

export default Forum;
