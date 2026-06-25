import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { User, MapPin, Phone, Briefcase, Send, Hash, FileText } from 'lucide-react';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';

const TnSourashConnect = () => {
  const [form, setForm] = useState({
    name: '', ghornav: '', gothtra: '', workOrganization: '', workOrganizationIntro: '', place: '', pincode: '', contactNo: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'TN Sourash Connect',
        page_path: '/tn-sourash-connect',
      });
    }
  }, []);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.contactNo) {
      toast.error('Name and Contact Number are required');
      return;
    }
    setLoading(true);
    try {
      await api.post('/tn-connect', {
        name: form.name,
        ghornav: form.ghornav,
        gothtra: form.gothtra,
        workOrganization: form.workOrganization,
        workOrganizationIntro: form.workOrganizationIntro,
        place: form.place,
        pincode: form.pincode,
        contactNo: form.contactNo,
      });
      if (window.gtag) {
        window.gtag('event', 'connect_form_submit', {
          event_category: 'TN Sourash Connect',
          event_label: form.place || 'unknown',
        });
      }
      setSubmitted(true);
      toast.success('Your connect request has been submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="page-header">
        <div className="container">
          <h1>TN SOURASH CONNECT</h1>
          <p>Connect with the Sourashtra community across Tamil Nadu</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ maxWidth: 680, margin: '0 auto' }}>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: 20, boxShadow: '0 4px 24px -4px rgba(0,0,0,0.10)', border: '1px solid #f1f5f9' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <Send size={32} style={{ color: '#059669' }} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>Request Submitted!</h2>
                <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                  Thank you for connecting with us. Our team will get in touch with you soon at <strong>{form.contactNo}</strong>.
                </p>
                <button
                  className="btn btn-outline"
                  onClick={() => { setSubmitted(false); setForm({ name: '', ghornav: '', gothtra: '', workOrganization: '', workOrganizationIntro: '', place: '', pincode: '', contactNo: '' }); }}
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 4px 24px -4px rgba(0,0,0,0.10)', border: '1px solid #f1f5f9', padding: '2.5rem' }}>
                <div style={{ marginBottom: '1.75rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Create a Forum Connection</h2>
                  <p style={{ color: '#6b7280', fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}>
                    Fill in your details and our team will call you for more information about the Sourashtra community in Tamil Nadu.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0 1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">
                        Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                        <input className="form-control" value={form.name} onChange={set('name')} required placeholder="Your full name" style={{ paddingLeft: '2.5rem' }} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Ghornav (Family Group)</label>
                      <input className="form-control" value={form.ghornav} onChange={set('ghornav')} placeholder="Your Ghornav / family group" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Gothtra (Clan / Gotra)</label>
                      <input className="form-control" value={form.gothtra} onChange={set('gothtra')} placeholder="Your Gothtra / clan lineage" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Work / Organisation</label>
                      <div style={{ position: 'relative' }}>
                        <Briefcase size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                        <input className="form-control" value={form.workOrganization} onChange={set('workOrganization')} placeholder="Your workplace or organisation" style={{ paddingLeft: '2.5rem' }} />
                      </div>
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Work / Organisation — Brief Intro</label>
                      <div style={{ position: 'relative' }}>
                        <FileText size={15} style={{ position: 'absolute', left: '0.875rem', top: '0.875rem', color: '#9ca3af', pointerEvents: 'none' }} />
                        <textarea
                          className="form-control"
                          rows={3}
                          value={form.workOrganizationIntro}
                          onChange={set('workOrganizationIntro')}
                          placeholder="Briefly describe your work, role, or what your organisation does"
                          style={{ paddingLeft: '2.5rem', resize: 'vertical' }}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Place / City</label>
                      <div style={{ position: 'relative' }}>
                        <MapPin size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                        <input className="form-control" value={form.place} onChange={set('place')} placeholder="Your city or town" style={{ paddingLeft: '2.5rem' }} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Pincode</label>
                      <div style={{ position: 'relative' }}>
                        <Hash size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                        <input className="form-control" value={form.pincode} onChange={set('pincode')} placeholder="6-digit PIN code" style={{ paddingLeft: '2.5rem' }} maxLength={6} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Contact No. <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                        <input className="form-control" value={form.contactNo} onChange={set('contactNo')} required placeholder="10-digit mobile number" style={{ paddingLeft: '2.5rem' }} />
                      </div>
                    </div>
                  </div>

                  {/* Call for more details note */}
                  <div style={{ background: '#fef3c7', borderRadius: 10, padding: '0.875rem 1rem', marginTop: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Phone size={15} style={{ color: '#b45309', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.875rem', color: '#92400e', margin: 0 }}>
                      <strong>Call for more details:</strong> After you submit, our community representative will contact you at the provided number.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ width: '100%', justifyContent: 'center', padding: '0.8125rem', fontSize: '1rem' }}
                  >
                    {loading ? (
                      <><span className="spinner-sm" style={{ borderTopColor: 'white' }} /> Submitting…</>
                    ) : (
                      <><Send size={16} /> Submit Connect Request</>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default TnSourashConnect;
