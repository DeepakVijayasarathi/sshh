import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [entities, setEntities] = useState([]);
  const [filters, setFilters] = useState({ entity: '', action: '', userId: '' });
  const [userSearch, setUserSearch] = useState('');
  const debUser = useDebounce(userSearch);
  const limit = 25;

  const fetchLogs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit });
    if (filters.entity) params.set('entity', filters.entity);
    if (filters.action) params.set('action', filters.action);
    if (debUser) params.set('userId', debUser);
    api.get(`/audit?${params}`)
      .then(r => { setLogs(r.data.data || []); setTotal(r.data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, filters, debUser]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { api.get('/audit/entities').then(r => setEntities(r.data || [])).catch(() => {}); }, []);

  const totalPages = Math.ceil(total / limit);

  const actionBadge = (action) => {
    const colors = { CREATE: 'badge-success', UPDATE: 'badge-info', DELETE: 'badge-danger', LOGIN: 'badge-secondary', APPROVE: 'badge-success', REJECT: 'badge-warning' };
    return <span className={`badge ${colors[action?.toUpperCase()] || 'badge-secondary'}`}>{action}</span>;
  };

  const setFilter = (k) => (e) => { setFilters(f => ({ ...f, [k]: e.target.value })); setPage(1); };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Activity Log</h1>
        <p className="text-muted">Audit trail of all admin and user actions</p>
      </div>

      <div className="card mb-4">
        <div className="card-body" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select className="form-control" style={{ width: 160 }} value={filters.entity} onChange={setFilter('entity')}>
            <option value="">All Entities</option>
            {entities.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select className="form-control" style={{ width: 160 }} value={filters.action} onChange={setFilter('action')}>
            <option value="">All Actions</option>
            {['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'APPROVE', 'REJECT', 'UPLOAD'].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <input className="form-control" style={{ width: 200 }} placeholder="Filter by user ID..." value={userSearch} onChange={e => { setUserSearch(e.target.value); setPage(1); }} />
          <button className="btn btn-outline btn-sm" onClick={() => { setFilters({ entity: '', action: '', userId: '' }); setUserSearch(''); setPage(1); }}>Clear</button>
          <span style={{ marginLeft: 'auto', lineHeight: '38px', color: 'var(--text-light)', fontSize: '0.875rem' }}>{total.toLocaleString()} entries</span>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : logs.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: '3rem' }}>No activity logs found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                      {new Date(log.created_at).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{log.user_name || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{log.user_email || log.user_id}</div>
                    </td>
                    <td>{actionBadge(log.action)}</td>
                    <td><span className="badge badge-secondary">{log.entity}</span></td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-light)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.entity_id || '—'}</td>
                    <td style={{ maxWidth: 280, fontSize: '0.8125rem' }}>
                      {log.details ? (
                        <span title={typeof log.details === 'object' ? JSON.stringify(log.details) : log.details} style={{ cursor: 'help' }}>
                          {typeof log.details === 'object' ? JSON.stringify(log.details).substring(0, 60) + '...' : String(log.details).substring(0, 60)}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-light)' }}>{log.ip_address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1.25rem', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>Page {page} of {totalPages}</span>
            <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
