import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const Gallery = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [albumForm, setAlbumForm] = useState({ title: '', description: '', externalUrl: '', whatsappNumber: '', isPublished: false, requiresMembership: false });
  const [cover, setCover] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadAlbums = () => {
    setLoading(true);
    api.get('/gallery/albums/all').then(r => setAlbums(r.data)).catch(() => setAlbums([])).finally(() => setLoading(false));
  };

  const openAlbum = async (album) => {
    setSelected(album);
    try {
      const res = await api.get(`/gallery/albums/${album.id}`);
      setItems(res.data.items || []);
    } catch { toast.error('Failed to load album photos'); }
  };

  useEffect(() => { loadAlbums(); }, []);

  const createAlbum = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', albumForm.title);
      fd.append('description', albumForm.description);
      fd.append('isPublished', albumForm.isPublished);
      if (albumForm.externalUrl) fd.append('externalUrl', albumForm.externalUrl);
      if (albumForm.whatsappNumber) fd.append('whatsappNumber', albumForm.whatsappNumber);
      if (cover) fd.append('cover', cover);
      await api.post('/gallery/albums', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Album created');
      setShowAlbumForm(false);
      setAlbumForm({ title: '', description: '', externalUrl: '', whatsappNumber: '', isPublished: false });
      setCover(null);
      loadAlbums();
    } catch (err) { toast.error('Failed'); } finally { setSaving(false); }
  };

  const uploadItems = async () => {
    if (!uploadFiles.length) return;
    setSaving(true);
    try {
      const fd = new FormData();
      Array.from(uploadFiles).forEach(f => fd.append('files', f));
      await api.post(`/gallery/albums/${selected.id}/items`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Photos uploaded');
      setUploadFiles([]);
      openAlbum(selected);
    } catch (err) { toast.error('Upload failed'); } finally { setSaving(false); }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm('Delete this photo?')) return;
    try { await api.delete(`/gallery/albums/${selected.id}/items/${itemId}`); openAlbum(selected); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const deleteAlbum = async (id) => {
    if (!window.confirm('Delete this album and all its photos?')) return;
    try { await api.delete(`/gallery/albums/${id}`); toast.success('Album deleted'); loadAlbums(); }
    catch { toast.error('Failed'); }
  };

  const shareWhatsApp = (album) => {
    if (album.whatsapp_number) {
      const cleaned = album.whatsapp_number.replace(/\D/g, '');
      const phone = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
      const text = `Check out our gallery album: ${album.title}`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      const text = `Check out our gallery album: ${album.title}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          {selected
            ? <><button className="btn btn-sm btn-outline" onClick={() => setSelected(null)} style={{ marginRight: '0.75rem' }}>←</button>Album: {selected.title}</>
            : 'Gallery Management'}
        </h1>
        {!selected && <button className="btn btn-primary" onClick={() => setShowAlbumForm(!showAlbumForm)}>+ New Album</button>}
      </div>

      {showAlbumForm && !selected && (
        <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Create Album</h3>
          <form onSubmit={createAlbum}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-control" value={albumForm.title} onChange={e => setAlbumForm({ ...albumForm, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Cover Image</label>
                <input type="file" className="form-control" accept="image/*" onChange={e => setCover(e.target.files[0])} />
              </div>
              <div className="form-group">
                <label className="form-label">URL Link (optional)</label>
                <input type="url" className="form-control" value={albumForm.externalUrl} onChange={e => setAlbumForm({ ...albumForm, externalUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp Contact Number</label>
                <input className="form-control" value={albumForm.whatsappNumber} onChange={e => setAlbumForm({ ...albumForm, whatsappNumber: e.target.value })} placeholder="10-digit number" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={2} value={albumForm.description} onChange={e => setAlbumForm({ ...albumForm, description: e.target.value })} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '1rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={albumForm.isPublished} onChange={e => setAlbumForm({ ...albumForm, isPublished: e.target.checked })} /> Publish album (visible to public)
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Album'}</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowAlbumForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {selected ? (
        <div>
          {/* Album info bar */}
          <div className="admin-card" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {selected.external_url && (
              <a href={selected.external_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                🔗 View URL
              </a>
            )}
            <button onClick={() => shareWhatsApp(selected)} className="btn btn-sm" style={{ background: '#25D366', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              WhatsApp Share
            </button>
          </div>

          <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Upload Photos/Videos</h4>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input type="file" className="form-control" multiple accept="image/*,video/*" onChange={e => setUploadFiles(e.target.files)} style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={uploadItems} disabled={saving || !uploadFiles.length}>
                {saving ? 'Uploading...' : `Upload ${uploadFiles.length || 0} file(s)`}
              </button>
            </div>
          </div>
          {items.length === 0 ? (
            <div className="admin-card text-center text-muted" style={{ padding: '3rem' }}>No items in this album yet.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: '0.75rem' }}>
              {items.map(item => (
                <div key={item.id} style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', aspectRatio: '1', background: '#f3f4f6' }}>
                  {item.file_type === 'video'
                    ? <video src={item.file_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <img src={item.file_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  }
                  <button onClick={() => deleteItem(item.id)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(220,38,38,0.9)', border: 'none', color: 'white', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <div className="grid grid-3">
          {albums.map(album => (
            <div key={album.id} className="card">
              {album.cover_image_url
                ? <img src={album.cover_image_url} alt={album.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                : <div style={{ height: 160, background: 'linear-gradient(135deg,var(--primary),#4a0000)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🖼️</div>
              }
              <div className="card-body">
                <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{album.title}</h3>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>{album.item_count} items • {album.is_published ? 'Published' : 'Draft'}</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-sm btn-outline" onClick={() => openAlbum(album)}>Manage</button>
                  <button className="btn btn-sm" onClick={() => shareWhatsApp(album)} style={{ background: '#25D366', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>WhatsApp</button>
                  {album.external_url && <a href={album.external_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">🔗 URL</a>}
                  <button className="btn btn-sm btn-danger" onClick={() => deleteAlbum(album.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
