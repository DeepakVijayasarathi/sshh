import React, { useState, useEffect } from 'react';
import { Images, Play, X, ChevronLeft, Camera, PlusCircle, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import PublicLayout from '../../components/common/PublicLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const shareWhatsApp = (album) => {
  const text = `Check out our gallery album: ${album.title}`;
  if (album.whatsapp_number) {
    const cleaned = album.whatsapp_number.replace(/\D/g, '');
    const phone = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }
};

const Gallery = () => {
  const { user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', whatsappNumber: '' });
  const [cover, setCover] = useState(null);

  useEffect(() => {
    api.get('/gallery/albums').then(r => setAlbums(r.data)).catch(() => setAlbums([])).finally(() => setLoading(false));
  }, []);

  const openAlbum = async (album) => {
    setSelected(album);
    const res = await api.get(`/gallery/albums/${album.id}`);
    setItems(res.data.items || []);
  };

  const handleSubmitAlbum = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      if (form.whatsappNumber) fd.append('whatsappNumber', form.whatsappNumber);
      if (cover) fd.append('cover', cover);
      await api.post('/gallery/albums/submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Photo submitted! It will appear after admin approval.');
      setShowForm(false);
      setForm({ title: '', description: '', whatsappNumber: '' });
      setCover(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="page-header">
        <div className="container">
          <h1>Photo & Video Gallery</h1>
          <p>Memories from our community events and programs</p>
          {user && (
            <button
              onClick={() => setShowForm(s => !s)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: '1rem',
                background: 'rgba(255,255,255,0.15)', color: 'white',
                border: '1.5px solid rgba(255,255,255,0.3)',
                borderRadius: 10, padding: '0.625rem 1.5rem',
                fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <PlusCircle size={16} /> Submit a Photo
            </button>
          )}
        </div>
      </div>

      {showForm && user && (
        <div style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a', padding: '2rem 0' }}>
          <div className="container" style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 700, color: '#92400e', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <PlusCircle size={18} /> Submit a Photo for Gallery
              </h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitAlbum} style={{ display: 'grid', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Title *</label>
                <input className="form-control" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">WhatsApp Contact Number (optional)</label>
                <input className="form-control" value={form.whatsappNumber} onChange={e => setForm(f => ({ ...f, whatsappNumber: e.target.value }))} placeholder="10-digit number" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Photo</label>
                <input type="file" accept="image/*" onChange={e => setCover(e.target.files[0])} style={{ fontSize: '0.875rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {submitting ? 'Submitting…' : <><Send size={15} /> Submit for Approval</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <section className="section">
        <div className="container">
          {selected ? (
            <>
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <ChevronLeft size={15} /> All Albums
                </button>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, flex: 1 }}>{selected.title}</h2>
                <button onClick={() => shareWhatsApp(selected)} className="btn btn-sm" style={{ background: '#25D366', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  WhatsApp Share
                </button>
              </div>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                  <Camera size={40} strokeWidth={1} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                  <p>No items in this album yet.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: '0.75rem' }}>
                  {items.map(item => (
                    <div key={item.id} onClick={() => setLightbox(item)}
                      style={{ cursor: 'pointer', borderRadius: 10, overflow: 'hidden', aspectRatio: '1', background: '#f3f4f6', position: 'relative' }}>
                      {item.file_type === 'video' ? (
                        <>
                          <video src={item.file_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                            <Play size={28} color="#fff" fill="#fff" />
                          </div>
                        </>
                      ) : (
                        <img src={item.file_url} alt={item.title || 'Gallery'} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : albums.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '3rem' }}>No albums available.</div>
          ) : (
            <div className="gallery-grid">
              {albums.map(album => (
                <div key={album.id} className="gallery-album-card" onClick={() => openAlbum(album)}>
                  {album.cover_image_url ? (
                    <div className="gallery-album-img-wrap">
                      <img src={album.cover_image_url} alt={album.title} className="gallery-album-img" />
                    </div>
                  ) : (
                    <div className="gallery-album-placeholder">
                      <div className="gallery-album-icon-wrap">
                        <Images size={32} strokeWidth={1.25} color="rgba(255,255,255,0.7)" />
                      </div>
                      <div className="gallery-album-placeholder-dots">
                        {[...Array(6)].map((_, i) => <span key={i} className="gal-dot" />)}
                      </div>
                    </div>
                  )}
                  <div className="gallery-album-overlay">
                    <span className="gallery-album-count">{album.item_count} items</span>
                  </div>
                  <div className="gallery-album-body">
                    <h3 className="gallery-album-title">{album.title}</h3>
                    {album.description && <p className="gallery-album-desc">{album.description}</p>}
                    <button
                      onClick={e => { e.stopPropagation(); shareWhatsApp(album); }}
                      style={{ marginTop: '0.5rem', background: '#25D366', color: 'white', border: 'none', borderRadius: 6, padding: '0.3rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      WhatsApp Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          {lightbox.file_type === 'video' ? (
            <video controls src={lightbox.file_url} style={{ maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()} />
          ) : (
            <img src={lightbox.file_url} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }} onClick={e => e.stopPropagation()} />
          )}
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>
      )}

      <style>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .gallery-album-card {
          border-radius: 14px; overflow: hidden;
          background: #fff;
          border: 1.5px solid #f1f5f9;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          cursor: pointer; position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .gallery-album-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
        }

        /* Image cover */
        .gallery-album-img-wrap { height: 200px; overflow: hidden; }
        .gallery-album-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.3s;
        }
        .gallery-album-card:hover .gallery-album-img { transform: scale(1.04); }

        /* Placeholder */
        .gallery-album-placeholder {
          height: 200px;
          background: linear-gradient(135deg, var(--primary,#8B0000) 0%, #1a0a1e 100%);
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
        }
        .gallery-album-icon-wrap {
          width: 70px; height: 70px; border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 2px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          position: relative; z-index: 1;
        }
        .gallery-album-placeholder-dots {
          position: absolute; inset: 0;
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 30px; padding: 20px; opacity: 0.08;
        }
        .gal-dot {
          width: 40px; height: 40px; border-radius: 50%;
          background: #fff; display: block;
        }

        /* Count badge overlay */
        .gallery-album-overlay {
          position: absolute; top: 12px; right: 12px;
        }
        .gallery-album-count {
          background: rgba(0,0,0,0.55);
          color: #fff; font-size: 0.7rem; font-weight: 600;
          padding: 3px 10px; border-radius: 20px;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.15);
        }

        /* Body */
        .gallery-album-body { padding: 1rem 1.125rem; }
        .gallery-album-title {
          font-size: 1rem; font-weight: 700; color: #0f172a;
          margin: 0 0 0.25rem;
        }
        .gallery-album-desc {
          font-size: 0.8rem; color: #94a3b8;
          margin: 0; line-height: 1.5;
        }
      `}</style>
    </PublicLayout>
  );
};

export default Gallery;
