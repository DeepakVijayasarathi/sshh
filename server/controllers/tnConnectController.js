const { query } = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { v4: uuidv4 } = require('uuid');

const initTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS tn_connect_requests (
      id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name                     VARCHAR(255) NOT NULL,
      ghornav                  VARCHAR(150),
      gothtra                  VARCHAR(150),
      work_organization        VARCHAR(255),
      work_organization_intro  TEXT,
      place                    VARCHAR(255),
      pincode                  VARCHAR(10),
      contact_no               VARCHAR(15) NOT NULL,
      status                   VARCHAR(20) NOT NULL DEFAULT 'New',
      created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};
initTable().catch(console.error);

exports.create = async (req, res) => {
  try {
    const { name, ghornav, gothtra, workOrganization, workOrganizationIntro, place, pincode, contactNo } = req.body;
    if (!name || !contactNo) return res.status(400).json({ message: 'Name and contact number are required' });
    const id = uuidv4();
    const result = await query(
      `INSERT INTO tn_connect_requests (id, name, ghornav, gothtra, work_organization, work_organization_intro, place, pincode, contact_no)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [id, name, ghornav || null, gothtra || null, workOrganization || null, workOrganizationIntro || null, place || null, pincode || null, contactNo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req);
    const { status, search } = req.query;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (status) { conditions.push(`status = $${idx}`); params.push(status); idx++; }
    if (search) {
      conditions.push(`(name ILIKE $${idx} OR contact_no ILIKE $${idx} OR place ILIKE $${idx})`);
      params.push(`%${search}%`); idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = parseInt((await query(`SELECT COUNT(*) FROM tn_connect_requests ${where}`, params)).rows[0].count);
    const data = await query(
      `SELECT * FROM tn_connect_requests ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );
    res.json(paginatedResponse(data.rows, total, page, limit));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const VALID_STATUSES = ['New', 'Contacted', 'Closed'];
    if (!VALID_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status value' });
    const result = await query(
      `UPDATE tn_connect_requests SET status=$2, updated_at=NOW() WHERE id=$1 RETURNING *`,
      [req.params.id, status]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Request not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await query('DELETE FROM tn_connect_requests WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
