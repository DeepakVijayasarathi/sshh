const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

exports.getAll = async (req, res) => {
  try {
    const { active } = req.query;
    let sql = 'SELECT * FROM banners';
    const params = [];
    if (active === 'true') {
      sql += ' WHERE is_active = TRUE';
    }
    sql += ' ORDER BY sort_order ASC, created_at DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, subtitle, description, buttonText, buttonLink, bgColor, textColor, sortOrder } = req.body;
    const imageUrl = req.file ? `/uploads/banners/${req.file.filename}` : null;
    const id = uuidv4();
    const result = await query(
      `INSERT INTO banners (id, title, subtitle, description, image_url, button_text, button_link, bg_color, text_color, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, title, subtitle, description, imageUrl, buttonText, buttonLink, bgColor || '#1a1a2e', textColor || '#ffffff', sortOrder || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, subtitle, description, buttonText, buttonLink, bgColor, textColor, sortOrder, isActive } = req.body;
    const imageUrl = req.file ? `/uploads/banners/${req.file.filename}` : undefined;

    let sets = `title=$2, subtitle=$3, description=$4, button_text=$5, button_link=$6, bg_color=$7, text_color=$8, sort_order=$9, is_active=$10, updated_at=NOW()`;
    let values = [req.params.id, title, subtitle, description, buttonText, buttonLink, bgColor, textColor, sortOrder, isActive === 'true' || isActive === true];

    if (imageUrl) { sets += `, image_url=$${values.length + 1}`; values.push(imageUrl); }

    const result = await query(`UPDATE banners SET ${sets} WHERE id=$1 RETURNING *`, values);
    if (!result.rows.length) return res.status(404).json({ message: 'Banner not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await query('DELETE FROM banners WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Banner not found' });
    res.json({ message: 'Banner deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
