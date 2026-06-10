import React, { useState, useEffect } from 'react';
import { Images, Play, X, ChevronLeft, Camera } from 'lucide-react';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';

const Gallery = () => {
  const [albums, setAlbums] = useState([]);
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get('/gallery/albums').then(r => setAlbums(r.data)).catch(() => setAlbums([])).finally(() => setLoading(false));
  }, []);

  const openAlbum = async (album) => {
    setSelected(album);
    const res = await api.get(`/gallery/albums/${album.id}`);
    setItems(res.data.items || []);
  };

  return (
    <PublicLayout>
      <div className="page-header">
        <div className="container">
          <h1>Photo & Video Gallery</h1>
          <p>Memories from our community events and programs</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          {selected ? (
            <>
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <ChevronLeft size={15} /> All Albums
                </button>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{selected.title}</h2>
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
