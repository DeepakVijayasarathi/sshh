const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { sendEmail, emailTemplates } = require('../utils/email');

// Ensure email-verification columns exist (safe to run on every startup)
query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verify_token VARCHAR(255)`).catch(() => {});
query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE`).catch(() => {});

const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.register = async (req, res) => {
  try {
    const { email, password, fullName, mobileNumber } = req.body;

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const user = await query(
      'INSERT INTO users (id, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, email, role',
      [userId, email, hash, 'Member']
    );

    await query(
      'INSERT INTO members (user_id, full_name, mobile_number, email, status) VALUES ($1,$2,$3,$4,$5)',
      [userId, fullName, mobileNumber, email, 'Pending']
    );

    // Send email verification (fire-and-forget — never blocks registration)
    const verifyToken = crypto.randomBytes(32).toString('hex');
    await query('UPDATE users SET verify_token = $1 WHERE id = $2', [verifyToken, userId]).catch(() => {});
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;
    if (fullName) {
      const tmpl = emailTemplates.emailVerification(fullName, verifyUrl);
      sendEmail({ to: email, ...tmpl }).catch(() => {});
    }

    const token = generateToken(user.rows[0]);
    res.status(201).json({ token, user: user.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (!result.rows.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is inactive' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.role, u.last_login,
              m.full_name, m.photo_url, m.membership_number, m.status as member_status
       FROM users u
       LEFT JOIN members m ON m.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });
    const hash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Verification token is required' });

    const result = await query(
      `UPDATE users SET email_verified = TRUE, verify_token = NULL
       WHERE verify_token = $1 RETURNING id`,
      [token]
    );
    if (!result.rows.length) {
      return res.status(400).json({ message: 'Invalid or already-used verification token' });
    }
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
