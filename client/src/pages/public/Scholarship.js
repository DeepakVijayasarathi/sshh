import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { CheckCircle2 } from 'lucide-react';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';

const Scholarship = () => {
  const [form, setForm] = useState({
    fullName: '', mobileNumber: '', email: '', schoolCollege: '',
    course: '', yearOfStudy: '', district: '', city: '',
    academicYear: '', marksPercentage: '',
  });
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      Object.entries(files).forEach(([k, v]) => v && fd.append(k, v));
      await api.post('/scholarships/apply', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Scholarship application submitted!');
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <PublicLayout>
        <section className="section">
          <div className="container text-center" style={{ maxWidth: 500 }}>
            <div style={{ width:64,height:64,borderRadius:'50%',background:'rgba(8,145,178,0.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem'}}><CheckCircle2 size={32} color="#0891b2" strokeWidth={1.5}/></div>
            <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Application Submitted!</h2>
            <p className="text-muted mb-3">Your scholarship application has been received. We will review it and contact you soon.</p>
            <button className="btn btn-outline" onClick={() => setSubmitted(false)}>Apply Again</button>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="page-header">
        <div className="container">
          <h1>Scholarship Application</h1>
          <p>Apply for educational support from the Sourashtra community</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{ maxWidth: 700 }}>
          <div className="card">
            <div className="card-header">Scholarship Application Form</div>
            <form onSubmit={handleSubmit} className="card-body">
              <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--text-medium)' }}>Personal Information</h4>
              <div className="grid grid-2">
                <div className="form-group"><label className="form-label">Full Name *</label><input className="form-control" value={form.fullName} onChange={set('fullName')} required /></div>
                <div className="form-group"><label className="form-label">Mobile *</label><input className="form-control" value={form.mobileNumber} onChange={set('mobileNumber')} required /></div>
                <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={set('email')} /></div>
                <div className="form-group"><label className="form-label">District</label><input className="form-control" value={form.district} onChange={set('district')} /></div>
                <div className="form-group"><label className="form-label">City</label><input className="form-control" value={form.city} onChange={set('city')} /></div>
              </div>
              <h4 style={{ fontWeight: 600, margin: '1rem 0', color: 'var(--text-medium)' }}>Academic Information</h4>
              <div className="grid grid-2">
                <div className="form-group"><label className="form-label">School / College *</label><input className="form-control" value={form.schoolCollege} onChange={set('schoolCollege')} required /></div>
                <div className="form-group"><label className="form-label">Course *</label><input className="form-control" value={form.course} onChange={set('course')} required /></div>
                <div className="form-group"><label className="form-label">Year of Study</label><input className="form-control" value={form.yearOfStudy} onChange={set('yearOfStudy')} placeholder="e.g. 2nd Year" /></div>
                <div className="form-group"><label className="form-label">Academic Year *</label><input className="form-control" value={form.academicYear} onChange={set('academicYear')} required placeholder="e.g. 2024-25" /></div>
                <div className="form-group"><label className="form-label">Last Exam Marks %</label><input type="number" step="0.01" max={100} className="form-control" value={form.marksPercentage} onChange={set('marksPercentage')} /></div>
              </div>
              <h4 style={{ fontWeight: 600, margin: '1rem 0', color: 'var(--text-medium)' }}>Upload Documents</h4>
              <div className="grid grid-2">
                <div className="form-group"><label className="form-label">Income Certificate</label><input type="file" className="form-control" accept=".pdf,.jpg,.png" onChange={e => setFiles({...files, incomeCertificate: e.target.files[0]})} /></div>
                <div className="form-group"><label className="form-label">Community Certificate</label><input type="file" className="form-control" accept=".pdf,.jpg,.png" onChange={e => setFiles({...files, communityCertificate: e.target.files[0]})} /></div>
                <div className="form-group"><label className="form-label">Mark Sheet</label><input type="file" className="form-control" accept=".pdf,.jpg,.png" onChange={e => setFiles({...files, marksheet: e.target.files[0]})} /></div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Scholarship;
