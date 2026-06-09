import React, { useState } from 'react';
import { toast } from 'react-toastify';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';

const Donation = () => {
  const [form, setForm] = useState({ donorName: '', mobileNumber: '', email: '', amount: '', paymentMethod: 'UPI', transactionId: '', purpose: '' });
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const AMOUNTS = [500, 1000, 2500, 5000, 10000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/donations', form);
      toast.success('Thank you for your generous donation!');
      setReceipt(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Donation failed');
    } finally {
      setLoading(false);
    }
  };

  if (receipt) {
    return (
      <PublicLayout>
        <section className="section">
          <div className="container" style={{ maxWidth: 500, textAlign: 'center' }}>
            <div className="card">
              <div className="card-body">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🙏</div>
                <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Thank You!</h2>
                <p className="text-muted mb-3">Your donation has been received.</p>
                <div style={{ background: '#f9fafb', borderRadius: 'var(--radius)', padding: '1.25rem', textAlign: 'left' }}>
                  <p><strong>Receipt No:</strong> {receipt.receipt_number}</p>
                  <p><strong>Donor:</strong> {receipt.donor_name}</p>
                  <p><strong>Amount:</strong> ₹{receipt.amount}</p>
                  <p><strong>Method:</strong> {receipt.payment_method}</p>
                </div>
                <button className="btn btn-outline mt-3" onClick={() => setReceipt(null)}>Make Another Donation</button>
              </div>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="page-header">
        <div className="container">
          <h1>Support Our Community</h1>
          <p>Your donation helps us serve the Sourashtra community better</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{ maxWidth: 560 }}>
          <div className="card">
            <div className="card-header">Make a Donation</div>
            <form onSubmit={handleSubmit} className="card-body">
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {AMOUNTS.map(a => (
                  <button key={a} type="button"
                    className={`btn btn-sm ${form.amount == a ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setForm({...form, amount: a.toString()})}>
                    ₹{a.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input type="number" className="form-control" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required min={1} placeholder="Enter amount" />
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input className="form-control" value={form.donorName} onChange={e => setForm({...form, donorName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile</label>
                  <input className="form-control" value={form.mobileNumber} onChange={e => setForm({...form, mobileNumber: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="form-control" value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})}>
                    <option>UPI</option><option>Bank Transfer</option><option>Cash</option><option>Cheque</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Transaction ID</label>
                  <input className="form-control" value={form.transactionId} onChange={e => setForm({...form, transactionId: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Purpose</label>
                <input className="form-control" value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} placeholder="e.g. General Fund, Event, Scholarship..." />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Processing...' : 'Donate Now'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Donation;
