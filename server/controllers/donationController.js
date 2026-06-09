const { query } = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { v4: uuidv4 } = require('uuid');

const generateReceiptNumber = async () => {
  const year = new Date().getFullYear();
  const result = await query("SELECT COUNT(*) FROM donations WHERE receipt_number LIKE $1", [`RCP${year}%`]);
  const seq = String(parseInt(result.rows[0].count) + 1).padStart(4, '0');
  return `RCP${year}${seq}`;
};

exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req);
    const total = parseInt((await query('SELECT COUNT(*) FROM donations')).rows[0].count);
    const data = await query('SELECT * FROM donations ORDER BY donated_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json(paginatedResponse(data.rows, total, page, limit));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { donorName, mobileNumber, email, amount, paymentMethod, transactionId, purpose, memberId } = req.body;
    const receiptNumber = await generateReceiptNumber();
    const id = uuidv4();

    const result = await query(
      `INSERT INTO donations (id, donor_name, mobile_number, email, amount, payment_method, transaction_id, purpose, member_id, receipt_number, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'Completed') RETURNING *`,
      [id, donorName, mobileNumber, email, amount, paymentMethod, transactionId, purpose, memberId || null, receiptNumber]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReceipt = async (req, res) => {
  try {
    const result = await query('SELECT * FROM donations WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Donation not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const result = await query(`
      SELECT
        COUNT(*) as total_count,
        SUM(amount) as total_amount,
        SUM(CASE WHEN EXTRACT(MONTH FROM donated_at) = EXTRACT(MONTH FROM NOW())
              AND EXTRACT(YEAR FROM donated_at) = EXTRACT(YEAR FROM NOW())
              THEN amount ELSE 0 END) as this_month
      FROM donations WHERE status='Completed'
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
