const { query } = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { v4: uuidv4 } = require('uuid');

exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req);
    const { search, category, status = 'Active', featured } = req.query;

    let conditions = [`b.status = $1`];
    let params = [status];
    let idx = 2;

    if (search) { conditions.push(`(b.business_name ILIKE $${idx} OR b.owner_name ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    if (category) { conditions.push(`bc.name = $${idx}`); params.push(category); idx++; }
    if (featured === 'true') { conditions.push(`b.is_featured = TRUE`); }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const total = parseInt((await query(`SELECT COUNT(*) FROM businesses b LEFT JOIN business_categories bc ON bc.id=b.category_id ${where}`, params)).rows[0].count);
    const data = await query(
      `SELECT b.*, bc.name as category_name FROM businesses b
       LEFT JOIN business_categories bc ON bc.id=b.category_id
       ${where} ORDER BY b.is_featured DESC, b.created_at DESC LIMIT $${idx} OFFSET $${idx+1}`,
      [...params, limit, offset]
    );
    res.json(paginatedResponse(data.rows, total, page, limit));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await query(
      `SELECT b.*, bc.name as category_name FROM businesses b
       LEFT JOIN business_categories bc ON bc.id=b.category_id WHERE b.id=$1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Business not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { businessName, ownerName, categoryId, mobileNumber, email, address, city, website, description } = req.body;
    const logoUrl = req.file ? `/uploads/businesses/${req.file.filename}` : null;
    const id = uuidv4();

    const result = await query(
      `INSERT INTO businesses (id, user_id, business_name, owner_name, category_id, mobile_number, email, address, city, website, description, logo_url, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'Pending') RETURNING *`,
      [id, req.user?.id, businessName, ownerName, categoryId, mobileNumber, email, address, city, website, description, logoUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { businessName, ownerName, categoryId, mobileNumber, email, address, city, website, description, isFeatured } = req.body;
    const logoUrl = req.file ? `/uploads/businesses/${req.file.filename}` : undefined;

    let sets = `business_name=$2, owner_name=$3, category_id=$4, mobile_number=$5, email=$6,
      address=$7, city=$8, website=$9, description=$10, is_featured=$11, updated_at=NOW()`;
    let values = [req.params.id, businessName, ownerName, categoryId, mobileNumber, email, address, city, website, description, isFeatured === 'true'];

    if (logoUrl) { sets += `, logo_url=$${values.length + 1}`; values.push(logoUrl); }

    const result = await query(`UPDATE businesses SET ${sets} WHERE id=$1 RETURNING *`, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approve = async (req, res) => {
  try {
    const result = await query(
      `UPDATE businesses SET status='Active', approved_by=$2, approved_at=NOW() WHERE id=$1 RETURNING *`,
      [req.params.id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await query('DELETE FROM businesses WHERE id=$1', [req.params.id]);
    res.json({ message: 'Business deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const result = await query('SELECT * FROM business_categories WHERE is_active=TRUE ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
