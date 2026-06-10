import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, Briefcase, Calendar, Users, CheckCircle2, Globe, Phone } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: '', mobileNumber: '', email: '', skills: '', experienceYears: 0, coverLetter: '' });
  const [resume, setResume] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(r => setJob(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (resume) fd.append('resume', resume);
      await api.post(`/jobs/${id}/apply`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Application submitted!');
      setApplied(true);
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PublicLayout><div className="loading-center"><div className="spinner" /></div></PublicLayout>;
  if (!job) return <PublicLayout><div className="text-center" style={{ padding: '3rem' }}>Job not found. <Link to="/jobs">Back to Jobs</Link></div></PublicLayout>;

  return (
    <PublicLayout>
      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          <Link to="/jobs" className="btn btn-outline btn-sm mb-4">← Back to Jobs</Link>
          <div className="card">
            <div className="card-body">
              <h1 style={{ fontSize: '1.75rem', fontFamily: "'Playfair Display', serif", color: 'var(--primary)', marginBottom: '0.5rem' }}>{job.job_title}</h1>
              <p style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '1rem' }}>{job.company_name}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {job.location && <span className="badge badge-secondary" style={{display:'inline-flex',alignItems:'center',gap:4}}><MapPin size={11}/> {job.location}</span>}
                {job.salary_range && <span className="badge badge-success" style={{display:'inline-flex',alignItems:'center',gap:4}}><DollarSign size={11}/> {job.salary_range}</span>}
                {job.experience_required && <span className="badge badge-info" style={{display:'inline-flex',alignItems:'center',gap:4}}><Briefcase size={11}/> {job.experience_required}</span>}
                {job.last_date && <span className="badge badge-warning" style={{display:'inline-flex',alignItems:'center',gap:4}}><Calendar size={11}/> Last date: {new Date(job.last_date).toLocaleDateString('en-IN')}</span>}
              </div>
              {job.description && (
                <div style={{ lineHeight: 1.8, color: 'var(--text-medium)', whiteSpace: 'pre-wrap', marginBottom: '2rem' }}>
                  <h3 style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Job Description</h3>
                  {job.description}
                </div>
              )}
              {applied ? (
                <div className="text-center" style={{ padding: '1rem', background: '#dcfce7', borderRadius: 'var(--radius)', color: '#166534' }}>
                  <CheckCircle2 size={18} style={{marginRight:6,verticalAlign:'middle'}} color="#166534"/> Application submitted successfully!
                </div>
              ) : (
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                  {showForm ? 'Cancel' : 'Apply for this Job'}
                </button>
              )}
            </div>
          </div>

          {showForm && (
            <div className="card mt-3">
              <div className="card-header">Apply for {job.job_title}</div>
              <form onSubmit={handleApply} className="card-body">
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-control" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile *</label>
                    <input className="form-control" value={form.mobileNumber} onChange={e => setForm({...form, mobileNumber: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Years of Experience</label>
                    <input type="number" className="form-control" min={0} value={form.experienceYears} onChange={e => setForm({...form, experienceYears: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Skills</label>
                  <input className="form-control" value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} placeholder="e.g. JavaScript, React, Node.js" />
                </div>
                <div className="form-group">
                  <label className="form-label">Cover Letter</label>
                  <textarea className="form-control" rows={4} value={form.coverLetter} onChange={e => setForm({...form, coverLetter: e.target.value})} placeholder="Tell us why you're a great fit..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Resume (PDF/DOC)</label>
                  <input type="file" className="form-control" accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files[0])} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default JobDetail;
