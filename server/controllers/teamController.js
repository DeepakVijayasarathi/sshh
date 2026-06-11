const { query } = require('../config/database');
const path = require('path');
const fs = require('fs');

/* ── Create table if not exists (called once on startup) ── */
const initTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS team_members (
      id            SERIAL PRIMARY KEY,
      name          VARCHAR(150)  NOT NULL,
      role          VARCHAR(100)  NOT NULL DEFAULT 'Coordinator',
      designation   VARCHAR(200),
      division      VARCHAR(150),
      photo_url     VARCHAR(500),
      quote         TEXT,
      display_order INT           NOT NULL DEFAULT 0,
      is_active     BOOLEAN       NOT NULL DEFAULT true,
      created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `);
  // Add unique constraint on name so seed can upsert safely
  await query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'team_members_name_key' AND conrelid = 'team_members'::regclass
      ) THEN
        ALTER TABLE team_members ADD CONSTRAINT team_members_name_key UNIQUE (name);
      END IF;
    END $$;
  `).catch(() => {});
};
initTable().catch(console.error);

/* ── Public: list active members ── */
exports.getPublic = async (req, res) => {
  try {
    const { division } = req.query;
    let sql = `SELECT * FROM team_members WHERE is_active = true`;
    const params = [];
    if (division) { params.push(division); sql += ` AND division ILIKE $1`; }
    sql += ` ORDER BY display_order ASC, id ASC`;
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Admin: list all ── */
exports.getAll = async (req, res) => {
  try {
    const result = await query(`SELECT * FROM team_members ORDER BY display_order ASC, id ASC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Admin: create ── */
exports.create = async (req, res) => {
  try {
    const { name, role, designation, division, quote, display_order, is_active } = req.body;
    const photo_url = req.file ? `/uploads/team/${req.file.filename}` : null;
    const result = await query(
      `INSERT INTO team_members (name, role, designation, division, photo_url, quote, display_order, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, role || 'Coordinator', designation, division, photo_url, quote,
       parseInt(display_order) || 0, is_active !== 'false']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Admin: update ── */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, designation, division, quote, display_order, is_active } = req.body;

    let photo_url = req.body.photo_url || null;
    if (req.file) photo_url = `/uploads/team/${req.file.filename}`;

    const result = await query(
      `UPDATE team_members SET
         name=$1, role=$2, designation=$3, division=$4, photo_url=COALESCE($5, photo_url),
         quote=$6, display_order=$7, is_active=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [name, role || 'Coordinator', designation, division, photo_url, quote,
       parseInt(display_order) || 0, is_active !== 'false' && is_active !== false, id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Admin: delete ── */
exports.remove = async (req, res) => {
  try {
    const result = await query(`DELETE FROM team_members WHERE id=$1 RETURNING photo_url`, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Not found' });
    const photoUrl = result.rows[0].photo_url;
    if (photoUrl && photoUrl.startsWith('/uploads/team/')) {
      const filePath = path.join(__dirname, '..', photoUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
