const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

exports.getMyNotifications = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM notifications
       WHERE target_user_id = $1 OR target_role = $2 OR (target_user_id IS NULL AND target_role IS NULL)
       ORDER BY created_at DESC LIMIT 50`,
      [req.user.id, req.user.role]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const result = await query(
      `SELECT COUNT(*) FROM notifications
       WHERE (target_user_id = $1 OR target_role = $2 OR (target_user_id IS NULL AND target_role IS NULL))
       AND is_read = FALSE`,
      [req.user.id, req.user.role]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await query(
      `UPDATE notifications SET is_read = TRUE
       WHERE (target_user_id = $1 OR target_role = $2 OR (target_user_id IS NULL AND target_role IS NULL))
       AND id = $3`,
      [req.user.id, req.user.role, req.params.id]
    );
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await query(
      `UPDATE notifications SET is_read = TRUE
       WHERE target_user_id = $1 OR target_role = $2 OR (target_user_id IS NULL AND target_role IS NULL)`,
      [req.user.id, req.user.role]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 200'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { title, message, type = 'info', targetRole, targetUserId, channel = 'system' } = req.body;
    const id = uuidv4();
    const result = await query(
      `INSERT INTO notifications (id, title, message, type, target_role, target_user_id, channel)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id, title, message, type, targetRole || null, targetUserId || null, channel]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.broadcastNotification = async (req, res) => {
  try {
    const { title, message, type = 'info' } = req.body;
    const id = uuidv4();
    const result = await query(
      `INSERT INTO notifications (id, title, message, type, channel)
       VALUES ($1,$2,$3,$4,'system') RETURNING *`,
      [id, title, message, type]
    );
    res.status(201).json({ message: 'Broadcast sent', notification: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await query('DELETE FROM notifications WHERE id=$1', [req.params.id]);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
