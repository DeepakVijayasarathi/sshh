import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const defaultForm = { title: '', description: '', eventDate: '', eventTime: '', venue: '', googleMapLink: '', youtubeUrl: '', registrationLimit: '', contactPerson: '', contactNumber: '', isPublished: false };

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState(null);
  const [banner, setBanner] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/events/admin/all?limit=100')
      .then(r => setEvents(r.data.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  };

  const publish = async (id) => {
    try {
      const fd = new FormData();
      fd.append('isPublished', 'true');
      await api.put(`/events/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Event approved and published');
      load();
    } catch { toast.error('Failed to publish'); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(defaultForm); setEditing(null); setBanner(null); setShowForm(true); };
  const openEdit = (ev) => {
    setForm({
      title: ev.title, description: ev.description || '', eventDate: ev.event_date?.split('T')[0] || '',
      eventTime: ev.event_time || '', venue: ev.venue || '', googleMapLink: ev.google_map_link || '',
      registrationLimit: ev.registration_limit || '', contactPerson: ev.contact_person || '',
      contactNumber: ev.contact_number || '', youtubeUrl: ev.youtube_url || '', isPublished: ev.is_published,
    });
    setEditing(ev.id); setBanner(null); setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (banner) fd.append('banner', banner);
      if (editing) {
        await api.put(`/events/${editing}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Event updated');
      } else {
        await api.post('/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Event created');
      }
      setShowForm(false); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try { await api.delete(`/events/${id}`); toast.success('Event deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: f === 'isPublished' ? e.target.checked : e.target.value });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Event Management</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Event</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>{editing ? 'Edit Event' : 'Create Event'}</h3>
          <form onSubmit={save}>
            <div className="grid grid-2">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Event Title *</label>
                <input className="form-control" value={form.title} onChange={set('title')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-control" value={form.eventDate} onChange={set('eventDate')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input type="time" className="form-control" value={form.eventTime} onChange={set('eventTime')} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Venue</label>
                <input className="form-control" value={form.venue} onChange={set('venue')} />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Person</label>
                <input className="form-control" value={form.contactPerson} onChange={set('contactPerson')} />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input className="form-control" value={form.contactNumber} onChange={set('contactNumber')} />
              </div>
              <div className="form-group">
                <label className="form-label">Registration Limit</label>
                <input type="number" className="form-control" value={form.registrationLimit} onChange={set('registrationLimit')} />
              </div>
              <div className="form-group">
                <label className="form-label">Google Map Link</label>
                <input className="form-control" value={form.googleMapLink} onChange={set('googleMapLink')} />
              </div>
              <div className="form-group">
                <label className="form-label">YouTube Video URL</label>
                <input className="form-control" value={form.youtubeUrl} onChange={set('youtubeUrl')} placeholder="https://www.youtube.com/watch?v=..." />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} value={form.description} onChange={set('description')} />
              </div>
              <div className="form-group">
                <label className="form-label">Banner Image</label>
                <input type="file" className="form-control" accept="image/*" onChange={e => setBanner(e.target.files[0])} />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
                <input type="checkbox" id="isPublished" checked={form.isPublished} onChange={set('isPublished')} />
                <label htmlFor="isPublished" style={{ cursor: 'pointer', fontWeight: 500 }}>Publish Event</label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-responsive">
            <table>
              <thead><tr><th>Title</th><th>Date</th><th>Venue</th><th>Registered</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {events.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>No events yet</td></tr>
                ) : events.map(ev => (
                  <tr key={ev.id}>
                    <td style={{ fontWeight: 500 }}>{ev.title}</td>
                    <td>{new Date(ev.event_date).toLocaleDateString('en-IN')}</td>
                    <td>{ev.venue || '—'}</td>
                    <td>{ev.registered_count || 0}{ev.registration_limit ? `/${ev.registration_limit}` : ''}</td>
                    <td>
                      <span className={`badge ${ev.is_published ? 'badge-success' : ev.member_submitted ? 'badge-warning' : 'badge-secondary'}`}>
                        {ev.is_published ? 'Published' : ev.member_submitted ? 'Pending Approval' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {ev.member_submitted && !ev.is_published && (
                          <button className="btn btn-sm btn-primary" onClick={() => publish(ev.id)}>Approve</button>
                        )}
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(ev)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => remove(ev.id)}>Delete</button>
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

export default Events;
