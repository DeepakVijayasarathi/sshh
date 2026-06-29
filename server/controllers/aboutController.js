const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

exports.getAll = async (req, res) => {
  try {
    const { active } = req.query;
    let sql = 'SELECT * FROM about_sections';
    if (active === 'true') sql += ' WHERE is_active = TRUE';
    sql += ' ORDER BY sort_order ASC, created_at ASC';
    const result = await query(sql);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { sectionKey, type, icon, color, title, content, sortOrder, isActive } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const id = uuidv4();
    const result = await query(
      `INSERT INTO about_sections (id, section_key, type, icon, color, title, content, sort_order, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [id, sectionKey || null, type || 'card', icon || 'Info', color || '#8B0000', title, content || '', sortOrder || 0, isActive !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'A section with this key already exists' });
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { sectionKey, type, icon, color, title, content, sortOrder, isActive } = req.body;
    const cur = await query('SELECT * FROM about_sections WHERE id=$1', [req.params.id]);
    if (!cur.rows.length) return res.status(404).json({ message: 'Section not found' });
    const s = cur.rows[0];
    const result = await query(
      `UPDATE about_sections SET
         section_key=$1, type=$2, icon=$3, color=$4, title=$5, content=$6, sort_order=$7, is_active=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [
        sectionKey !== undefined ? sectionKey : s.section_key,
        type ?? s.type,
        icon ?? s.icon,
        color ?? s.color,
        title ?? s.title,
        content !== undefined ? content : s.content,
        sortOrder ?? s.sort_order,
        isActive !== undefined ? isActive : s.is_active,
        req.params.id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'A section with this key already exists' });
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await query('DELETE FROM about_sections WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Section not found' });
    res.json({ message: 'Section deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
