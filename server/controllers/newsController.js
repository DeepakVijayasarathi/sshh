const { query } = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { v4: uuidv4 } = require('uuid');

exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req);
    const { category, featured, published = 'true' } = req.query;

    let conditions = [];
    let params = [];
    let idx = 1;

    if (published === 'true') { conditions.push(`is_published = TRUE`); }
    if (category) { conditions.push(`category = $${idx}`); params.push(category); idx++; }
    if (featured === 'true') { conditions.push(`is_featured = TRUE`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = parseInt((await query(`SELECT COUNT(*) FROM news ${where}`, params)).rows[0].count);
    const data = await query(
      `SELECT * FROM news ${where} ORDER BY publish_date DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );
    res.json(paginatedResponse(data.rows, total, page, limit));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await query('SELECT * FROM news WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'News not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, content, category, videoUrl, publishDate, isPublished, isFeatured } = req.body;
    const imageUrl = req.file ? `/uploads/news/${req.file.filename}` : null;
    const id = uuidv4();

    const result = await query(
      `INSERT INTO news (id, title, content, image_url, video_url, category, publish_date, is_published, is_featured, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, title, content, imageUrl, videoUrl, category, publishDate || new Date(),
       isPublished === 'true', isFeatured === 'true', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, content, category, videoUrl, publishDate, isPublished, isFeatured } = req.body;
    const imageUrl = req.file ? `/uploads/news/${req.file.filename}` : undefined;

    let sets = `title=$2, content=$3, category=$4, video_url=$5, publish_date=$6,
      is_published=$7, is_featured=$8, updated_at=NOW()`;
    let values = [req.params.id, title, content, category, videoUrl, publishDate,
      isPublished === 'true', isFeatured === 'true'];

    if (imageUrl) { sets += `, image_url=$${values.length + 1}`; values.push(imageUrl); }

    const result = await query(`UPDATE news SET ${sets} WHERE id=$1 RETURNING *`, values);
    if (!result.rows.length) return res.status(404).json({ message: 'News not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await query('DELETE FROM news WHERE id=$1', [req.params.id]);
    res.json({ message: 'News deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
