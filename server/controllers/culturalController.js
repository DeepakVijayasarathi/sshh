const { pool, getClient } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { paginate, paginatedResponse } = require('../utils/pagination');

const initTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cultural_posts (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title        VARCHAR(255) NOT NULL,
      category     VARCHAR(100),
      content      TEXT,
      image_url    VARCHAR(500),
      author_name  VARCHAR(150),
      submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
      status       VARCHAR(20) NOT NULL DEFAULT 'Pending',
      is_published BOOLEAN NOT NULL DEFAULT FALSE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};
initTable().catch(console.error);

/* ── Public: list published posts ──────────────────── */
exports.getAll = async (req, res) => {
  try {
    const { limit, offset } = paginate(req);
    const search   = req.query.search   || '';
    const category = req.query.category || '';

    const conditions = ['cp.is_published = TRUE'];
    const values = [];
    let i = 1;

    if (search) {
      conditions.push(`(cp.title ILIKE $${i} OR cp.author_name ILIKE $${i} OR cp.content ILIKE $${i})`);
      values.push(`%${search}%`); i++;
    }
    if (category) {
      conditions.push(`cp.category ILIKE $${i}`);
      values.push(`%${category}%`); i++;
    }

    const where = conditions.join(' AND ');
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM cultural_posts cp WHERE ${where}`, values
    );
    const rows = await pool.query(
      `SELECT cp.*, u.email as submitter_email
       FROM cultural_posts cp
       LEFT JOIN users u ON u.id = cp.submitted_by
       WHERE ${where}
       ORDER BY cp.created_at DESC
       LIMIT $${i} OFFSET $${i+1}`,
      [...values, limit, offset]
    );

    res.json(paginatedResponse(rows.rows, +countRes.rows[0].count, req));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Public: get single post ───────────────────────── */
exports.getById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cp.*, u.email as submitter_email
       FROM cultural_posts cp
       LEFT JOIN users u ON u.id = cp.submitted_by
       WHERE cp.id = $1 AND cp.is_published = TRUE`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Post not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Admin: list all posts ─────────────────────────── */
exports.getAdminAll = async (req, res) => {
  try {
    const { limit, offset } = paginate(req);
    const status   = req.query.status   || '';
    const category = req.query.category || '';
    const search   = req.query.search   || '';

    const conditions = [];
    const values = [];
    let i = 1;

    if (status)   { conditions.push(`cp.status = $${i}`);          values.push(status);          i++; }
    if (category) { conditions.push(`cp.category ILIKE $${i}`);    values.push(`%${category}%`); i++; }
    if (search)   { conditions.push(`(cp.title ILIKE $${i} OR cp.author_name ILIKE $${i})`); values.push(`%${search}%`); i++; }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const countRes = await pool.query(`SELECT COUNT(*) FROM cultural_posts cp ${where}`, values);
    const rows = await pool.query(
      `SELECT cp.*, u.email as submitter_email
       FROM cultural_posts cp
       LEFT JOIN users u ON u.id = cp.submitted_by
       ${where}
       ORDER BY cp.created_at DESC
       LIMIT $${i} OFFSET $${i+1}`,
      [...values, limit, offset]
    );

    res.json(paginatedResponse(rows.rows, +countRes.rows[0].count, req));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Create (member or admin) ──────────────────────── */
exports.create = async (req, res) => {
  try {
    const { title, category, content, author_name } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const image_url = req.file ? `/uploads/cultural/${req.file.filename}` : null;
    const submitted_by = req.user?.id || null;
    const isAdmin = ['SuperAdmin', 'Admin'].includes(req.user?.role);

    const result = await pool.query(
      `INSERT INTO cultural_posts (title, category, content, image_url, author_name, submitted_by, status, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, category || null, content || null, image_url, author_name || null, submitted_by,
        isAdmin ? 'Approved' : 'Pending',
        isAdmin ? true : false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Update (admin) ────────────────────────────────── */
exports.update = async (req, res) => {
  try {
    const { title, category, content, author_name, status, is_published } = req.body;
    const image_url = req.file ? `/uploads/cultural/${req.file.filename}` : undefined;

    const current = await pool.query('SELECT * FROM cultural_posts WHERE id = $1', [req.params.id]);
    if (!current.rows.length) return res.status(404).json({ message: 'Post not found' });

    const post = current.rows[0];
    const result = await pool.query(
      `UPDATE cultural_posts SET
         title        = $1,
         category     = $2,
         content      = $3,
         image_url    = $4,
         author_name  = $5,
         status       = $6,
         is_published = $7,
         updated_at   = NOW()
       WHERE id = $8 RETURNING *`,
      [
        title        ?? post.title,
        category     ?? post.category,
        content      ?? post.content,
        image_url    ?? post.image_url,
        author_name  ?? post.author_name,
        status       ?? post.status,
        is_published !== undefined ? is_published : post.is_published,
        req.params.id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Approve / publish (admin) ─────────────────────── */
exports.approve = async (req, res) => {
  try {
    const { publish } = req.body;  // true = publish, false = unpublish
    const result = await pool.query(
      `UPDATE cultural_posts SET status = $1, is_published = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [publish ? 'Approved' : 'Rejected', !!publish, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Post not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Delete (admin) ────────────────────────────────── */
exports.remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM cultural_posts WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Distinct categories ───────────────────────────── */
exports.getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT category FROM cultural_posts WHERE category IS NOT NULL AND is_published = TRUE ORDER BY category`
    );
    res.json(result.rows.map(r => r.category));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
