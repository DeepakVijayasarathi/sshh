const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query, getClient } = require('../config/database');
const { sendEmail, emailTemplates } = require('../utils/email');
const { v4: uuidv4 } = require('uuid');

exports.getProfile = async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.role, u.last_login, u.created_at,
              m.id as member_id, m.full_name, m.gender, m.date_of_birth, m.mobile_number,
              m.address, m.district, m.city, m.pincode, m.occupation, m.education,
              m.photo_url, m.membership_number, m.status as member_status,
              m.renewal_date, mt.name as membership_type
       FROM users u
       LEFT JOIN members m ON m.user_id = u.id
       LEFT JOIN membership_types mt ON mt.id = m.membership_type_id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, mobileNumber, address, district, city, pincode, occupation, education } = req.body;
    const photoUrl = req.file ? `/uploads/members/${req.file.filename}` : undefined;

    const member = await query('SELECT id FROM members WHERE user_id = $1', [req.user.id]);
    if (!member.rows.length) return res.status(404).json({ message: 'Member profile not found' });

    let sets = `full_name=$2, mobile_number=$3, address=$4, district=$5, city=$6,
      pincode=$7, occupation=$8, education=$9, updated_at=NOW()`;
    let values = [member.rows[0].id, fullName, mobileNumber, address, district, city, pincode, occupation, education];

    if (photoUrl) { sets += `, photo_url=$${values.length + 1}`; values.push(photoUrl); }

    const result = await query(`UPDATE members SET ${sets} WHERE id=$1 RETURNING *`, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMemberCard = async (req, res) => {
  try {
    const result = await query(
      `SELECT m.full_name, m.membership_number, m.photo_url, m.gender,
              m.mobile_number, m.district, m.city,
              mt.name as membership_type,
              mc.card_number, mc.issued_date, mc.valid_until
       FROM members m
       LEFT JOIN membership_types mt ON mt.id = m.membership_type_id
       LEFT JOIN member_cards mc ON mc.member_id = m.id AND mc.is_active = TRUE
       WHERE m.user_id = $1 AND m.status = 'Active'`,
      [req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Active membership not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdminMemberCard = async (req, res) => {
  try {
    const result = await query(
      `SELECT m.full_name, m.membership_number, m.photo_url, m.gender,
              m.mobile_number, m.district, m.city,
              mt.name as membership_type,
              mc.card_number, mc.issued_date, mc.valid_until
       FROM members m
       LEFT JOIN membership_types mt ON mt.id = m.membership_type_id
       LEFT JOIN member_cards mc ON mc.member_id = m.id AND mc.is_active = TRUE
       WHERE m.id = $1`,
      [req.params.memberId]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Member not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await query('SELECT id, email FROM users WHERE email = $1', [email]);
    // Always return success to prevent email enumeration
    if (!result.rows.length) return res.json({ message: 'If this email exists, a reset link has been sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query('UPDATE users SET reset_token=$1, reset_token_expires=$2 WHERE id=$3', [token, expires, result.rows[0].id]);

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: email,
      subject: 'Password Reset - Sourashtra Community Portal',
      html: `<h2>Password Reset Request</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="background:#8B0000;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;margin:12px 0;">Reset Password</a>
        <p>If you did not request this, ignore this email.</p>`,
    });

    res.json({ message: 'If this email exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await query(
      `SELECT id FROM users WHERE reset_token=$1 AND reset_token_expires > NOW()`,
      [token]
    );
    if (!result.rows.length) return res.status(400).json({ message: 'Invalid or expired reset token' });

    const hash = await bcrypt.hash(newPassword, 10);
    await query(
      'UPDATE users SET password_hash=$1, reset_token=NULL, reset_token_expires=NULL WHERE id=$2',
      [hash, result.rows[0].id]
    );
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUsersList = async (req, res) => {
  try {
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = Math.max(0, parseInt(req.query.offset) || 0);
    const result = await query(
      `SELECT u.id, u.email, u.role, u.is_active, u.last_login, u.created_at,
              m.full_name, m.membership_number
       FROM users u
       LEFT JOIN members m ON m.user_id = u.id
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleUserActive = async (req, res) => {
  try {
    const result = await query(
      'UPDATE users SET is_active = NOT is_active WHERE id=$1 RETURNING id, email, is_active',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bulkApproveMembers = async (req, res) => {
  const { memberIds } = req.body;
  if (!Array.isArray(memberIds) || !memberIds.length) {
    return res.status(400).json({ message: 'memberIds array required' });
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');
    // Same advisory lock as single approve — prevents duplicate numbers across both code paths
    await client.query("SELECT pg_advisory_xact_lock(hashtext('membership_number_seq'))");

    const year = new Date().getFullYear();
    const results = [];

    for (const id of memberIds) {
      const countResult = await client.query(
        "SELECT COUNT(*) FROM members WHERE membership_number LIKE $1",
        [`SCP${year}%`]
      );
      const membershipNumber = `SCP${year}${String(parseInt(countResult.rows[0].count) + 1).padStart(4, '0')}`;

      const r = await client.query(
        `UPDATE members
            SET status='Active',
                membership_number=$2,
                approved_by=$3,
                approved_at=NOW(),
                updated_at=NOW()
          WHERE id=$1 AND status='Pending'
         RETURNING id, full_name, membership_number, email`,
        [id, membershipNumber, req.user.id]
      );
      if (r.rows.length) {
        results.push(r.rows[0]);
        const cardId = uuidv4();
        const validUntil = new Date();
        validUntil.setFullYear(validUntil.getFullYear() + 1);
        await client.query(
          'INSERT INTO member_cards (id, member_id, card_number, valid_until) VALUES ($1,$2,$3,$4)',
          [cardId, id, `CARD-${membershipNumber}`, validUntil]
        );
      }
    }

    await client.query('COMMIT');

    // Fire-and-forget approval emails
    for (const m of results) {
      if (m.email) {
        const tmpl = emailTemplates.memberApproval(m.full_name, m.membership_number);
        sendEmail({ to: m.email, ...tmpl }).catch(() => {});
      }
    }

    res.json({ approved: results.length, members: results });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};
