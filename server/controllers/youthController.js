const { query } = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { v4: uuidv4 } = require('uuid');

exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req);
    const { search, district } = req.query;
    let conditions = [];
    let params = [];
    let idx = 1;
    if (search) { conditions.push(`(full_name ILIKE $${idx} OR mobile_number ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    if (district) { conditions.push(`district = $${idx}`); params.push(district); idx++; }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = parseInt((await query(`SELECT COUNT(*) FROM youth_members ${where}`, params)).rows[0].count);
    const data = await query(`SELECT * FROM youth_members ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx+1}`, [...params, limit, offset]);
    res.json(paginatedResponse(data.rows, total, page, limit));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { fullName, mobileNumber, email, dateOfBirth, address, district, city, skills, interests } = req.body;
    const id = uuidv4();
    const result = await query(
      `INSERT INTO youth_members (id, full_name, mobile_number, email, date_of_birth, address, district, city, skills, interests)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, fullName, mobileNumber, email, dateOfBirth, address, district, city, skills, interests]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { fullName, mobileNumber, email, skills, interests, status } = req.body;
    const result = await query(
      'UPDATE youth_members SET full_name=$2, mobile_number=$3, email=$4, skills=$5, interests=$6, status=$7 WHERE id=$1 RETURNING *',
      [req.params.id, fullName, mobileNumber, email, skills, interests, status]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Youth member not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await query('DELETE FROM youth_members WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Youth member not found' });
    res.json({ message: 'Youth member deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [total, byDistrict] = await Promise.all([
      query('SELECT COUNT(*) FROM youth_members WHERE status=$1', ['Active']),
      query('SELECT district, COUNT(*) as count FROM youth_members WHERE district IS NOT NULL GROUP BY district ORDER BY count DESC'),
    ]);
    res.json({ totalActive: parseInt(total.rows[0].count), byDistrict: byDistrict.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
