const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

exports.getAlbums = async (req, res) => {
  try {
    const result = await query(
      `SELECT ga.*, COUNT(gi.id) as item_count
       FROM gallery_albums ga
       LEFT JOIN gallery_items gi ON gi.album_id = ga.id
       WHERE ga.is_published = TRUE
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
    const { title, description, eventId, isPublished } = req.body;
    const coverUrl = req.file ? `/uploads/gallery/${req.file.filename}` : null;
    const id = uuidv4();
    const result = await query(
      `INSERT INTO gallery_albums (id, title, description, cover_image_url, event_id, is_published, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id, title, description, coverUrl, eventId || null, isPublished === 'true', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAlbum = async (req, res) => {
  try {
    const { title, description, isPublished } = req.body;
    const result = await query(
      'UPDATE gallery_albums SET title=$2, description=$3, is_published=$4, updated_at=NOW() WHERE id=$1 RETURNING *',
      [req.params.id, title, description, isPublished === 'true']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAlbum = async (req, res) => {
  try {
    await query('DELETE FROM gallery_albums WHERE id=$1', [req.params.id]);
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
    await query('DELETE FROM gallery_items WHERE id=$1', [req.params.itemId]);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
