import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';
import useSEO from '../../hooks/useSEO';

const Jobs = () => {
  useSEO({ title: 'Jobs', description: 'Browse job openings posted by Sourashtra community employers.' });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    api.get(`/jobs?${params}&limit=20`)
      .then(r => setJobs(r.data.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [search, location]);

  return (
    <PublicLayout>
      <div className="page-header">
        <div className="container">
          <h1>Jobs Portal</h1>
          <p>Explore job opportunities within the Sourashtra community</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', maxWidth: 600 }}>
            <input className="form-control" placeholder="Job title or company..." value={search} onChange={e => setSearch(e.target.value)} />
            <input className="form-control" placeholder="Location..." value={location} onChange={e => setLocation(e.target.value)} />
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : jobs.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '3rem' }}>No jobs found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {jobs.map(job => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="card" style={{ color: 'inherit' }}>
                  <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--primary)' }}>{job.job_title}</h3>
                      <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>{job.company_name}</p>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {job.location && <span className="text-muted" style={{ fontSize: '0.85rem' }}><MapPin size={11} style={{marginRight:3}}/> {job.location}</span>}
                        {job.salary_range && <span className="text-muted" style={{ fontSize: '0.85rem' }}><DollarSign size={11} style={{marginRight:3}}/> {job.salary_range}</span>}
                        {job.experience_required && <span className="text-muted" style={{ fontSize: '0.85rem' }}><Briefcase size={11} style={{marginRight:3}}/> {job.experience_required}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {job.last_date && (
                        <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                          Apply by: {new Date(job.last_date).toLocaleDateString('en-IN')}
                        </p>
                      )}
                      <span className="btn btn-primary btn-sm mt-2">Apply Now</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default Jobs;
