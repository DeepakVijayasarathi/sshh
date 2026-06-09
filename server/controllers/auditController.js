const { query } = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/pagination');

exports.getLogs = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req);
    const { userId, entity, action } = req.query;
    let conditions = [];
    let params = [];
    let idx = 1;
    if (userId) { conditions.push(`al.user_id = $${idx}`); params.push(userId); idx++; }
    if (entity) { conditions.push(`al.entity = $${idx}`); params.push(entity); idx++; }
    if (action) { conditions.push(`al.action ILIKE $${idx}`); params.push(`%${action}%`); idx++; }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = parseInt((await query(`SELECT COUNT(*) FROM audit_logs al ${where}`, params)).rows[0].count);
    const data = await query(
      `SELECT al.*, u.email as user_email
       FROM audit_logs al LEFT JOIN users u ON u.id = al.user_id
       ${where} ORDER BY al.created_at DESC LIMIT $${idx} OFFSET $${idx+1}`,
      [...params, limit, offset]
    );
    res.json(paginatedResponse(data.rows, total, page, limit));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEntities = async (req, res) => {
  try {
    const result = await query('SELECT DISTINCT entity FROM audit_logs WHERE entity IS NOT NULL ORDER BY entity');
    res.json(result.rows.map(r => r.entity));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
