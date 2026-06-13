import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const defaultForm = { jobTitle: '', companyName: '', location: '', salaryRange: '', experienceRequired: '', description: '', lastDate: '', isPublished: false };

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [viewApps, setViewApps] = useState(null);
  const [apps, setApps] = useState([]);

  const load = () => {
    setLoading(true);
    api.get('/jobs/all?limit=50').then(r => setJobs(r.data.data || [])).catch(() => setJobs([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openEdit = (j) => {
    setForm({ jobTitle: j.job_title, companyName: j.company_name, location: j.location || '', salaryRange: j.salary_range || '', experienceRequired: j.experience_required || '', description: j.description || '', lastDate: j.last_date?.split('T')[0] || '', isPublished: j.is_published });
    setEditing(j.id); setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await api.put(`/jobs/${editing}`, form);
      else await api.post('/jobs', form);
      toast.success(editing ? 'Job updated' : 'Job created');
      setShowForm(false); setEditing(null); setForm(defaultForm); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try { await api.delete(`/jobs/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const loadApps = async (id) => {
    try {
      const res = await api.get(`/jobs/${id}/applications`);
      setApps(res.data); setViewApps(id);
    } catch { toast.error('Failed to load applications'); }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: f === 'isPublished' ? e.target.checked : e.target.value });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Job Management</h1>
        <button className="btn btn-primary" onClick={() => { setForm(defaultForm); setEditing(null); setShowForm(true); }}>+ Add Job</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>{editing ? 'Edit Job' : 'Create Job'}</h3>
          <form onSubmit={save}>
            <div className="grid grid-2">
              <div className="form-group"><label className="form-label">Job Title *</label><input className="form-control" value={form.jobTitle} onChange={set('jobTitle')} required /></div>
              <div className="form-group"><label className="form-label">Company Name *</label><input className="form-control" value={form.companyName} onChange={set('companyName')} required /></div>
              <div className="form-group"><label className="form-label">Location</label><input className="form-control" value={form.location} onChange={set('location')} /></div>
              <div className="form-group"><label className="form-label">Salary Range</label><input className="form-control" value={form.salaryRange} onChange={set('salaryRange')} placeholder="e.g. ₹30,000 – ₹50,000" /></div>
              <div className="form-group"><label className="form-label">Experience Required</label><input className="form-control" value={form.experienceRequired} onChange={set('experienceRequired')} placeholder="e.g. 2-3 years" /></div>
              <div className="form-group"><label className="form-label">Last Date</label><input type="date" className="form-control" value={form.lastDate} onChange={set('lastDate')} /></div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Description</label><textarea className="form-control" rows={4} value={form.description} onChange={set('description')} /></div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="jobPublished" checked={form.isPublished} onChange={set('isPublished')} />
                <label htmlFor="jobPublished" style={{ cursor: 'pointer' }}>Publish Job</label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {viewApps && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 999, padding: '2rem', overflowY: 'auto' }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: 800 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 600 }}>Applications ({apps.length})</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setViewApps(null)}>Close</button>
            </div>
            {apps.length === 0 ? <p className="text-muted">No applications yet.</p> :
              <div className="table-responsive">
                <table>
                  <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Resume</th><th>Applied</th></tr></thead>
                  <tbody>{apps.map(a => (
                    <tr key={a.id}>
                      <td>{a.full_name}</td><td>{a.email}</td><td>{a.mobile_number}</td>
                      <td>{a.resume_url ? <a href={a.resume_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">View</a> : '—'}</td>
                      <td>{new Date(a.applied_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            }
          </div>
        </div>
      )}

      <div className="admin-card">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-responsive">
            <table>
              <thead><tr><th>Title</th><th>Company</th><th>Location</th><th>Last Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {jobs.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>No jobs yet</td></tr> :
                  jobs.map(j => (
                    <tr key={j.id}>
                      <td style={{ fontWeight: 500 }}>{j.job_title}</td>
                      <td>{j.company_name}</td>
                      <td>{j.location || '—'}</td>
                      <td>{j.last_date ? new Date(j.last_date).toLocaleDateString('en-IN') : '—'}</td>
                      <td><span className={`badge ${j.is_published ? 'badge-success' : 'badge-warning'}`}>{j.is_published ? 'Published' : 'Draft'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <button className="btn btn-sm btn-outline" onClick={() => loadApps(j.id)}>Applications</button>
                          <button className="btn btn-sm btn-outline" onClick={() => openEdit(j)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => remove(j.id)}>Delete</button>
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

export default Jobs;
