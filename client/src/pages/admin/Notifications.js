import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const defaultBroadcast = { title: '', message: '', type: 'info' };

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcast, setBroadcast] = useState(defaultBroadcast);
  const [creating, setCreating] = useState(false);
  const limit = 20;

  const fetchNotifications = useCallback(() => {
    setLoading(true);
    api.get(`/notifications?page=${page}&limit=${limit}`)
      .then(r => { setNotifications(r.data.data || []); setTotal(r.data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await api.delete(`/notifications/${id}`);
      toast.success('Deleted');
      fetchNotifications();
    } catch { toast.error('Delete failed'); }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/notifications/broadcast', broadcast);
      toast.success('Broadcast sent to all members!');
      setShowBroadcast(false);
      setBroadcast(defaultBroadcast);
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Broadcast failed');
    } finally {
      setCreating(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const typeBadge = (type) => {
    const map = { info: 'badge-info', success: 'badge-success', warning: 'badge-warning', error: 'badge-danger' };
    return <span className={`badge ${map[type] || 'badge-secondary'}`}>{type}</span>;
  };

  const setBc = (f) => (e) => setBroadcast(b => ({ ...b, [f]: e.target.value }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Notifications</h1>
          <p className="text-muted">Manage and broadcast notifications to members</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowBroadcast(!showBroadcast)}>
          {showBroadcast ? 'Cancel' : '📢 Broadcast Notification'}
        </button>
      </div>

      {showBroadcast && (
        <div className="card mb-4">
          <div className="card-header">📢 Broadcast to All Members</div>
          <form onSubmit={handleBroadcast} className="card-body">
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-control" value={broadcast.title} onChange={setBc('title')} required placeholder="Notification title" />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-control" value={broadcast.type} onChange={setBc('type')}>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea className="form-control" rows={3} value={broadcast.message} onChange={setBc('message')} required placeholder="Notification message..." />
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Broadcasting...' : 'Send to All'}</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>All Notifications ({total})</span>
        </div>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: '3rem' }}>No notifications found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Type</th>
                  <th>Recipient</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map(n => (
                  <tr key={n.id}>
                    <td style={{ fontWeight: 500, maxWidth: 200 }}>{n.title}</td>
                    <td style={{ maxWidth: 280, fontSize: '0.875rem', color: 'var(--text-light)' }}>
                      <span title={n.message}>{n.message?.substring(0, 80)}{n.message?.length > 80 ? '...' : ''}</span>
                    </td>
                    <td>{typeBadge(n.type)}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{n.user_email || n.user_id ? (n.user_email || n.user_id).toString().substring(0, 30) : 'Broadcast'}</td>
                    <td>
                      <span className={`badge ${n.is_read ? 'badge-secondary' : 'badge-info'}`}>
                        {n.is_read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-light)', whiteSpace: 'nowrap' }}>
                      {new Date(n.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(n.id)}>Delete</button>
                    </td>
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

export default Notifications;
