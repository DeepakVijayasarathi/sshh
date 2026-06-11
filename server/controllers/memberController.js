const { query } = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { sendEmail, emailTemplates } = require('../utils/email');
const { v4: uuidv4 } = require('uuid');

const generateMembershipNumber = async () => {
  const year = new Date().getFullYear();
  const result = await query("SELECT COUNT(*) FROM members WHERE membership_number LIKE $1", [`SCP${year}%`]);
  const seq = String(parseInt(result.rows[0].count) + 1).padStart(4, '0');
  return `SCP${year}${seq}`;
};

exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req);
    const { search, district, city, occupation, membership_type, status } = req.query;

    let conditions = [];
    let params = [];
    let idx = 1;

    if (search) {
      conditions.push(`(m.full_name ILIKE $${idx} OR m.membership_number ILIKE $${idx} OR m.mobile_number ILIKE $${idx})`);
      params.push(`%${search}%`); idx++;
    }
    if (district) { conditions.push(`m.district = $${idx}`); params.push(district); idx++; }
    if (city) { conditions.push(`m.city ILIKE $${idx}`); params.push(`%${city}%`); idx++; }
    if (occupation) { conditions.push(`m.occupation ILIKE $${idx}`); params.push(`%${occupation}%`); idx++; }
    if (membership_type) { conditions.push(`mt.name = $${idx}`); params.push(membership_type); idx++; }
    if (status) { conditions.push(`m.status = $${idx}`); params.push(status); idx++; }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM members m LEFT JOIN membership_types mt ON mt.id = m.membership_type_id ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const dataResult = await query(
      `SELECT m.*, mt.name as membership_type_name
       FROM members m
       LEFT JOIN membership_types mt ON mt.id = m.membership_type_id
       ${where}
       ORDER BY m.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    res.json(paginatedResponse(dataResult.rows, total, page, limit));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await query(
      `SELECT m.*, mt.name as membership_type_name
       FROM members m
       LEFT JOIN membership_types mt ON mt.id = m.membership_type_id
       WHERE m.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Member not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      userId, fullName, gender, dateOfBirth, mobileNumber, email,
      address, district, city, pincode, occupation, education,
      membershipTypeId, aadhaarNumber
    } = req.body;
    const photoUrl = req.file ? `/uploads/members/${req.file.filename}` : null;
    const id = uuidv4();

    const result = await query(
      `INSERT INTO members (id, user_id, full_name, gender, date_of_birth, mobile_number, email,
        address, district, city, pincode, occupation, education, photo_url, membership_type_id,
        aadhaar_number, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'Pending')
       RETURNING *`,
      [id, userId, fullName, gender, dateOfBirth, mobileNumber, email,
       address, district, city, pincode, occupation, education, photoUrl,
       membershipTypeId, aadhaarNumber]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const isAdmin = ['SuperAdmin', 'Admin'].includes(req.user.role);
    const existing = await query('SELECT user_id FROM members WHERE id=$1', [req.params.id]);
    if (!existing.rows.length) return res.status(404).json({ message: 'Member not found' });
    if (!isAdmin && existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      fullName, gender, dateOfBirth, mobileNumber, email,
      address, district, city, pincode, occupation, education, membershipTypeId
    } = req.body;
    const photoUrl = req.file ? `/uploads/members/${req.file.filename}` : undefined;

    const sets = [
      'full_name=$2', 'gender=$3', 'date_of_birth=$4', 'mobile_number=$5', 'email=$6',
      'address=$7', 'district=$8', 'city=$9', 'pincode=$10', 'occupation=$11',
      'education=$12', 'membership_type_id=$13', 'updated_at=NOW()'
    ];
    const values = [req.params.id, fullName, gender, dateOfBirth, mobileNumber, email,
      address, district, city, pincode, occupation, education, membershipTypeId];

    if (photoUrl) { sets.push(`photo_url=$${values.length + 1}`); values.push(photoUrl); }

    const result = await query(
      `UPDATE members SET ${sets.join(',')} WHERE id=$1 RETURNING *`,
      values
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approve = async (req, res) => {
  try {
    const membershipNumber = await generateMembershipNumber();
    const result = await query(
      `UPDATE members SET status='Active', membership_number=$2, approved_by=$3, approved_at=NOW(), updated_at=NOW()
       WHERE id=$1 RETURNING *, (SELECT name FROM membership_types WHERE id = membership_type_id) as type_name`,
      [req.params.id, membershipNumber, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Member not found' });

    const member = result.rows[0];
    if (member.email) {
      const tmpl = emailTemplates.memberApproval(member.full_name, membershipNumber);
      sendEmail({ to: member.email, ...tmpl }).catch(() => {});
    }

    const cardId = uuidv4();
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);
    await query(
      'INSERT INTO member_cards (id, member_id, card_number, valid_until) VALUES ($1,$2,$3,$4)',
      [cardId, req.params.id, `CARD-${membershipNumber}`, validUntil]
    );

    res.json({ message: 'Member approved', member: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reject = async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await query(
      `UPDATE members SET status='Rejected', rejection_reason=$2, updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [req.params.id, reason]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Member not found' });

    const member = result.rows[0];
    if (member.email) {
      const tmpl = emailTemplates.memberRejection(member.full_name, reason);
      sendEmail({ to: member.email, ...tmpl }).catch(() => {});
    }

    res.json({ message: 'Member rejected', member: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await query('DELETE FROM members WHERE id=$1', [req.params.id]);
    res.json({ message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMembershipTypes = async (req, res) => {
  try {
    const result = await query('SELECT * FROM membership_types WHERE is_active = TRUE ORDER BY display_order ASC, id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add extra columns if they don't exist yet (safe to run on every startup)
const initMembershipTypesTable = async () => {
  try {
    await query(`ALTER TABLE membership_types ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0`);
    await query(`ALTER TABLE membership_types ADD COLUMN IF NOT EXISTS benefits TEXT`);
    await query(`ALTER TABLE membership_types ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`);
  } catch (_) {}
};
initMembershipTypesTable();

// ── Admin: all types including inactive ──────────────────
exports.getAllMembershipTypes = async (req, res) => {
  try {
    const result = await query(`
      SELECT mt.*,
             COUNT(m.id) FILTER (WHERE m.status = 'Active') AS active_member_count,
             COUNT(m.id) AS total_member_count
        FROM membership_types mt
        LEFT JOIN members m ON m.membership_type_id = mt.id
       GROUP BY mt.id
       ORDER BY mt.display_order ASC, mt.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createMembershipType = async (req, res) => {
  try {
    const { name, description, fee, duration_months, display_order, is_active, benefits } = req.body;
    if (!name || fee === undefined) return res.status(400).json({ message: 'Name and fee are required' });
    const result = await query(
      `INSERT INTO membership_types (name, description, fee, duration_months, display_order, is_active, benefits)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name.trim(), description || '', parseFloat(fee),
       duration_months ? parseInt(duration_months) : null,
       parseInt(display_order) || 0, is_active !== false, benefits || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMembershipType = async (req, res) => {
  try {
    const { name, description, fee, duration_months, display_order, is_active, benefits } = req.body;
    const result = await query(
      `UPDATE membership_types
          SET name=$2, description=$3, fee=$4, duration_months=$5,
              display_order=$6, is_active=$7, benefits=$8, updated_at=NOW()
        WHERE id=$1 RETURNING *`,
      [req.params.id, name.trim(), description || '', parseFloat(fee),
       duration_months ? parseInt(duration_months) : null,
       parseInt(display_order) || 0, is_active !== false, benefits || null]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Plan not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMembershipType = async (req, res) => {
  try {
    const inUse = await query('SELECT COUNT(*) FROM members WHERE membership_type_id=$1', [req.params.id]);
    if (parseInt(inUse.rows[0].count) > 0) {
      return res.status(409).json({
        message: `Cannot delete — ${inUse.rows[0].count} member(s) use this plan. Deactivate it instead.`
      });
    }
    await query('DELETE FROM membership_types WHERE id=$1', [req.params.id]);
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
