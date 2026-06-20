const { pool } = require('../config/database');

/* GET /api/roles */
exports.getAll = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, COUNT(rm.menu_id)::int AS menu_count
       FROM roles r
       LEFT JOIN role_menus rm ON rm.role_id = r.id
       GROUP BY r.id ORDER BY r.created_at`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* POST /api/roles */
exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Role name is required' });
    const result = await pool.query(
      'INSERT INTO roles (name, description) VALUES ($1,$2) RETURNING *',
      [name.trim(), description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Role name already exists' });
    res.status(500).json({ message: err.message });
  }
};

/* PUT /api/roles/:id */
exports.update = async (req, res) => {
  try {
    const { name, description } = req.body;
    const cur = await pool.query('SELECT * FROM roles WHERE id=$1', [req.params.id]);
    if (!cur.rows.length) return res.status(404).json({ message: 'Role not found' });
    const role = cur.rows[0];
    const result = await pool.query(
      'UPDATE roles SET name=$1, description=$2 WHERE id=$3 RETURNING *',
      [name ?? role.name, description !== undefined ? description : role.description, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Role name already exists' });
    res.status(500).json({ message: err.message });
  }
};

/* DELETE /api/roles/:id */
exports.remove = async (req, res) => {
  try {
    const cur = await pool.query('SELECT * FROM roles WHERE id=$1', [req.params.id]);
    if (!cur.rows.length) return res.status(404).json({ message: 'Role not found' });
    if (cur.rows[0].is_system) return res.status(400).json({ message: 'System roles cannot be deleted' });
    await pool.query('DELETE FROM roles WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET /api/roles/:id/menus */
exports.getMenus = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*
       FROM menus m
       JOIN role_menus rm ON rm.menu_id = m.id
       WHERE rm.role_id = $1 ORDER BY m.target, m.group_label, m.sort_order`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* PUT /api/roles/:id/menus — replace all assigned menus */
exports.setMenus = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { menu_ids } = req.body;  // array of menu UUIDs
    if (!Array.isArray(menu_ids)) return res.status(400).json({ message: 'menu_ids must be an array' });

    const cur = await client.query('SELECT id FROM roles WHERE id=$1', [req.params.id]);
    if (!cur.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Role not found' }); }

    await client.query('DELETE FROM role_menus WHERE role_id=$1', [req.params.id]);
    for (const menuId of menu_ids) {
      await client.query(
        'INSERT INTO role_menus (role_id, menu_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [req.params.id, menuId]
      );
    }
    await client.query('COMMIT');
    res.json({ message: 'Menus updated', count: menu_ids.length });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};
