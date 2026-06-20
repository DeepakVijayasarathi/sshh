import React, { useState, useEffect } from 'react';
import { Image, BookOpen, Send, X, ChevronRight, PlusCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import PublicLayout from '../../components/common/PublicLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CATEGORIES = ['Music', 'Dance', 'Food', 'Tradition', 'Language', 'Festival', 'History', 'Craft', 'Other'];

const CulturalHeritage = () => {
  const { user } = useAuth();
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [detail, setDetail]       = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [category, setCategory]   = useState('');
  const [search, setSearch]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]           = useState({
    title: '', category: '', content: '', author_name: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]     = useState('');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)   params.set('search',   search);
    if (category) params.set('category', category);
    params.set('limit', '24');
    api.get(`/cultural?${params}`)
      .then(r => setPosts(r.data.data || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, category]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title',       form.title);
      fd.append('category',    form.category);
      fd.append('content',     form.content);
      fd.append('author_name', form.author_name);
      if (imageFile) fd.append('image', imageFile);

      await api.post('/cultural', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Post submitted! It will appear after admin approval.');
      setShowForm(false);
      setForm({ title: '', category: '', content: '', author_name: '' });
      setImageFile(null);
      setPreview('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #7b1f1f 0%, #2d0a3e 60%, #1a0a2e 100%)',
        padding: '4rem 0 3rem', textAlign: 'center', color: 'white',
      }}>
        <div className="container">
          <BookOpen size={40} style={{ opacity: 0.8, marginBottom: '0.75rem' }} />
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Cultural Heritage
          </h1>
          <p style={{ opacity: 0.75, maxWidth: 560, margin: '0 auto 1.5rem' }}>
            Celebrating the rich traditions, art, music, and stories of the Sourashtra community.
          </p>
          {user && (
            <button
              onClick={() => setShowForm(s => !s)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.15)', color: 'white',
                border: '1.5px solid rgba(255,255,255,0.3)',
                borderRadius: 10, padding: '0.625rem 1.5rem',
                fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                backdropFilter: 'blur(4px)',
              }}
            >
              <PlusCircle size={16} /> Share a Cultural Post
            </button>
          )}
        </div>
      </div>

      {/* Submit form (members only) */}
      {showForm && user && (
        <div style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a', padding: '2rem 0' }}>
          <div className="container" style={{ maxWidth: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 700, color: '#92400e', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <PlusCircle size={18} /> Submit Cultural Post
              </h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Title *</label>
                  <input className="form-control" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Sourashtra Harvest Festival" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Category</label>
                  <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Your Name</label>
                <input className="form-control" value={form.author_name} onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))} placeholder="Display name for this post" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Content / Story</label>
                <textarea className="form-control" rows={5} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Share the story, tradition, or description..." style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Photo (optional)</label>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: '0.875rem' }} />
                {preview && <img src={preview} alt="preview" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {submitting ? 'Submitting…' : <><Send size={15} /> Submit Post</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
            <input
              className="form-control"
              style={{ flex: '1 1 220px', maxWidth: 300 }}
              placeholder="Search posts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select className="form-control" style={{ width: 180 }} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
              <BookOpen size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
              <p>No cultural posts yet. Be the first to share!</p>
            </div>
          ) : (
            <div className="ch-grid">
              {posts.map(post => (
                <article key={post.id} className="ch-card" onClick={() => setDetail(post)}>
                  {post.image_url ? (
                    <img
                      src={`${BASE}${post.image_url}`}
                      alt={post.title}
                      className="ch-img"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="ch-img ch-img-placeholder">
                      <Image size={32} style={{ opacity: 0.3 }} />
                    </div>
                  )}
                  <div className="ch-body">
                    {post.category && <span className="ch-category">{post.category}</span>}
                    <h3 className="ch-title">{post.title}</h3>
                    {post.content && (
                      <p className="ch-excerpt">{post.content.substring(0, 120)}{post.content.length > 120 ? '…' : ''}</p>
                    )}
                    <div className="ch-meta">
                      {post.author_name && <span>{post.author_name}</span>}
                      <span>{new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <span className="ch-read">Read more <ChevronRight size={12} /></span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Detail modal */}
      {detail && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }}
          onClick={() => setDetail(null)}
        >
          <div
            style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 680, boxShadow: '0 24px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {detail.image_url && (
              <img src={`${BASE}${detail.image_url}`} alt={detail.title} style={{ width: '100%', height: 280, objectFit: 'cover', borderRadius: '20px 20px 0 0' }} />
            )}
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  {detail.category && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', background: 'rgba(139,0,0,0.08)', padding: '3px 10px', borderRadius: 20, display: 'inline-block', marginBottom: '0.5rem' }}>
                      {detail.category}
                    </span>
                  )}
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#0f172a', margin: 0 }}>{detail.title}</h2>
                </div>
                <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', flexShrink: 0 }}>
                  <X size={22} />
                </button>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
                {detail.author_name && <span>By {detail.author_name} · </span>}
                {new Date(detail.created_at).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              {detail.content && (
                <div style={{ lineHeight: 1.85, color: '#374151', fontSize: '0.9375rem', whiteSpace: 'pre-wrap' }}>
                  {detail.content}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ch-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.75rem;
          padding-bottom: 3rem;
        }
        .ch-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          border: 1.5px solid #f1f5f9;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          display: flex;
          flex-direction: column;
        }
        .ch-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.10);
          border-color: var(--primary, #8B0000);
        }
        .ch-img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          flex-shrink: 0;
        }
        .ch-img-placeholder {
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ch-body {
          padding: 1.125rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex: 1;
        }
        .ch-category {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--primary, #8B0000);
          background: rgba(139,0,0,0.08);
          padding: 2px 8px;
          border-radius: 20px;
          width: fit-content;
        }
        .ch-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          line-height: 1.3;
        }
        .ch-excerpt {
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.55;
          margin: 0;
          flex: 1;
        }
        .ch-meta {
          display: flex;
          gap: 0.5rem;
          font-size: 0.72rem;
          color: #94a3b8;
        }
        .ch-meta span::after { content: '·'; margin-left: 0.5rem; }
        .ch-meta span:last-child::after { content: ''; }
        .ch-read {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--primary, #8B0000);
          margin-top: 0.25rem;
        }
        .ch-card:hover .ch-read { gap: 6px; transition: gap 0.15s; }
      `}</style>
    </PublicLayout>
  );
};

export default CulturalHeritage;
