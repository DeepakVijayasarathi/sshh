import React, { useState, useEffect } from 'react';
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
                <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>← All Albums</button>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{selected.title}</h2>
              </div>
              {items.length === 0 ? (
                <p className="text-muted">No items in this album yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: '0.75rem' }}>
                  {items.map(item => (
                    <div key={item.id} onClick={() => setLightbox(item)}
                      style={{ cursor: 'pointer', borderRadius: 'var(--radius)', overflow: 'hidden', aspectRatio: '1', background: '#f3f4f6' }}>
                      {item.file_type === 'video' ? (
                        <video src={item.file_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
            <div className="grid grid-3">
              {albums.map(album => (
                <div key={album.id} className="card" onClick={() => openAlbum(album)} style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                  {album.cover_image_url ? (
                    <img src={album.cover_image_url} alt={album.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: 200, background: 'linear-gradient(135deg,var(--primary),#4a0000)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🖼️</div>
                  )}
                  <div className="card-body">
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{album.title}</h3>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>{album.item_count} photos/videos</p>
                    {album.description && <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{album.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          {lightbox.file_type === 'video' ? (
            <video controls src={lightbox.file_url} style={{ maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()} />
          ) : (
            <img src={lightbox.file_url} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
          )}
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: '1.5rem', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
        </div>
      )}
    </PublicLayout>
  );
};

export default Gallery;
