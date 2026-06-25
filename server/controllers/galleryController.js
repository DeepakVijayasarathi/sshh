const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Add gallery moderation/contact fields if they don't exist
const initGalleryExtraFields = async () => {
  const cols = [
    `ALTER TABLE gallery_albums ADD COLUMN IF NOT EXISTS external_url VARCHAR(500)`,
    `ALTER TABLE gallery_albums ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20)`,
    `ALTER TABLE gallery_albums ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES users(id) ON DELETE SET NULL`,
    `ALTER TABLE gallery_albums ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'Approved'`,
  ];
  for (const sql of cols) { try { await query(sql); } catch (_) {} }
};
initGalleryExtraFields();

exports.getAlbums = async (req, res) => {
  try {
    const result = await query(
      `SELECT ga.*, COUNT(gi.id) as item_count
       FROM gallery_albums ga
       LEFT JOIN gallery_items gi ON gi.album_id = ga.id
       WHERE ga.is_published = TRUE AND ga.approval_status = 'Approved'
       GROUP BY ga.id ORDER BY ga.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllAlbums = async (req, res) => {
  try {
    const result = await query(
      `SELECT ga.*, COUNT(gi.id) as item_count
       FROM gallery_albums ga
       LEFT JOIN gallery_items gi ON gi.album_id = ga.id
       GROUP BY ga.id ORDER BY ga.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAlbumItems = async (req, res) => {
  try {
    const album = await query('SELECT * FROM gallery_albums WHERE id=$1', [req.params.id]);
    if (!album.rows.length) return res.status(404).json({ message: 'Album not found' });
    const items = await query(
      'SELECT * FROM gallery_items WHERE album_id=$1 ORDER BY sort_order, created_at',
      [req.params.id]
    );
    res.json({ album: album.rows[0], items: items.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAlbum = async (req, res) => {
  try {
    const { title, description, eventId, isPublished, externalUrl, whatsappNumber } = req.body;
    const coverUrl = req.file ? `/uploads/gallery/${req.file.filename}` : null;
    const id = uuidv4();
    const result = await query(
      `INSERT INTO gallery_albums (id, title, description, cover_image_url, event_id, is_published, created_by, external_url, whatsapp_number, approval_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Approved') RETURNING *`,
      [id, title, description, coverUrl, eventId || null, isPublished === 'true', req.user.id, externalUrl || null, whatsappNumber || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAlbum = async (req, res) => {
  try {
    const { title, description, isPublished, externalUrl, whatsappNumber } = req.body;
    const result = await query(
      `UPDATE gallery_albums SET title=$2, description=$3, is_published=$4, external_url=$5, whatsapp_number=$6, updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [req.params.id, title, description, isPublished === 'true', externalUrl || null, whatsappNumber || null]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Album not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Public: members submit an album for admin approval
exports.submitAlbum = async (req, res) => {
  try {
    const { title, description, whatsappNumber } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const coverUrl = req.file ? `/uploads/gallery/${req.file.filename}` : null;
    const id = uuidv4();
    const result = await query(
      `INSERT INTO gallery_albums (id, title, description, cover_image_url, is_published, submitted_by, whatsapp_number, approval_status)
       VALUES ($1,$2,$3,$4,FALSE,$5,$6,'Pending') RETURNING *`,
      [id, title, description || null, coverUrl, req.user?.id || null, whatsappNumber || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: approve/reject a publicly submitted album
exports.moderateAlbum = async (req, res) => {
  try {
    const { approve } = req.body; // true = approve & publish, false = reject
    const result = await query(
      `UPDATE gallery_albums SET approval_status=$2, is_published=$3, updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [req.params.id, approve ? 'Approved' : 'Rejected', !!approve]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Album not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAlbum = async (req, res) => {
  try {
    const result = await query('DELETE FROM gallery_albums WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Album not found' });
    res.json({ message: 'Album deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addItems = async (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const items = [];
    for (const file of req.files) {
      const id = uuidv4();
      const fileType = file.mimetype.startsWith('video') ? 'video' : 'image';
      const result = await query(
        'INSERT INTO gallery_items (id, album_id, file_url, file_type) VALUES ($1,$2,$3,$4) RETURNING *',
        [id, req.params.id, `/uploads/gallery/${file.filename}`, fileType]
      );
      items.push(result.rows[0]);
    }
    res.status(201).json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const result = await query('DELETE FROM gallery_items WHERE id=$1 RETURNING id', [req.params.itemId]);
    if (!result.rows.length) return res.status(404).json({ message: 'Gallery item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
