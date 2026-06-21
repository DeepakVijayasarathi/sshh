const { pool, getClient } = require('../config/database');

/* ─── Seed data ─────────────────────────────────────────────────── */

const ADMIN_MENUS = [
  { label: 'Dashboard',         path: '/admin',                   icon: 'LayoutDashboard', group: 'Main',     sort: 1  },
  { label: 'Members',           path: '/admin/members',           icon: 'Users',           group: 'Content',  sort: 10 },
  { label: 'Membership Plans',  path: '/admin/membership-plans',  icon: 'Crown',           group: 'Content',  sort: 11 },
  { label: 'Events',            path: '/admin/events',            icon: 'Calendar',        group: 'Content',  sort: 12 },
  { label: 'News',              path: '/admin/news',              icon: 'Newspaper',       group: 'Content',  sort: 13 },
  { label: 'Gallery',           path: '/admin/gallery',           icon: 'Image',           group: 'Content',  sort: 14 },
  { label: 'Forum',             path: '/admin/forum',             icon: 'MessageSquare',   group: 'Content',  sort: 15 },
  { label: 'Cultural Heritage', path: '/admin/cultural-heritage', icon: 'BookOpen',        group: 'Content',  sort: 16 },
  { label: 'Businesses',        path: '/admin/businesses',        icon: 'Building2',       group: 'Business', sort: 20 },
  { label: 'Scholarships',      path: '/admin/scholarships',      icon: 'GraduationCap',   group: 'Business', sort: 21 },
  { label: 'Donations',         path: '/admin/donations',         icon: 'Heart',           group: 'Business', sort: 22 },
  { label: 'Notifications',     path: '/admin/notifications',     icon: 'Bell',            group: 'System',   sort: 30 },
  { label: 'Reports',           path: '/admin/reports',           icon: 'BarChart2',       group: 'System',   sort: 31 },
  { label: 'Activity Log',      path: '/admin/activity-log',      icon: 'Activity',        group: 'System',   sort: 32 },
  { label: 'Team Members',      path: '/admin/team',              icon: 'UserCog',         group: 'System',   sort: 33 },
  { label: 'Settings',          path: '/admin/settings',          icon: 'Settings',        group: 'System',   sort: 34 },
  { label: 'Roles',             path: '/admin/roles',             icon: 'ShieldCheck',     group: 'System',   sort: 35 },
  { label: 'Menus',             path: '/admin/menus',             icon: 'List',            group: 'System',   sort: 36 },
  { label: 'Role Menus',        path: '/admin/role-menus',        icon: 'GitBranch',       group: 'System',   sort: 37 },
];

const PUBLIC_MENUS = [
  { label: 'Home',              path: '/',                        icon: 'Home',            sort: 1  },
  { label: 'About',             path: '/about',                   icon: 'Info',            sort: 2  },
  { label: 'Membership',        path: '/membership',              icon: 'Award',           sort: 3  },
  { label: 'Events',            path: '/events',                  icon: 'Calendar',        sort: 4  },
  { label: 'Gallery',           path: '/gallery',                 icon: 'Image',           sort: 5  },
  { label: 'Business',          path: '/business',                icon: 'Building2',       sort: 6  },
  { label: 'News',              path: '/news',                    icon: 'Newspaper',       sort: 7  },
  { label: 'Forum',             path: '/forum',                   icon: 'MessageSquare',   sort: 8  },
  { label: 'Cultural Heritage', path: '/cultural-heritage',       icon: 'BookOpen',        sort: 9  },
  { label: 'TN Connect',        path: '/tn-sourash-connect',      icon: 'Link2',           sort: 10 },
  { label: 'Contact',           path: '/contact',                 icon: 'Phone',           sort: 11 },
];

/* ─── Table init + seed ─────────────────────────────────────────── */

const initAndSeed = async () => {
  // Phase 1: DDL — run outside a transaction so FKs resolve correctly
  // roles table already exists (SERIAL PK from schema.sql); just ensure is_system column exists
  await pool.query(`ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT FALSE`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS menus (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      label       VARCHAR(100) NOT NULL,
      path        VARCHAR(255) NOT NULL,
      icon        VARCHAR(100),
      target      VARCHAR(20) NOT NULL DEFAULT 'admin',
      group_label VARCHAR(100),
      sort_order  INTEGER NOT NULL DEFAULT 0,
      is_active   BOOLEAN NOT NULL DEFAULT TRUE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(path, target)
    )
  `);
  // role_id is INTEGER because roles.id is SERIAL (integer)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS role_menus (
      role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      menu_id UUID    NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, menu_id)
    )
  `);

  // Phase 2: Seed data in a transaction
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Mark system roles (rows already exist from schema.sql seed)
    await client.query(`
      UPDATE roles SET is_system = TRUE WHERE name IN ('SuperAdmin', 'Admin', 'Member')
    `);

    // Seed admin menus (upsert so label/icon stay current)
    for (const m of ADMIN_MENUS) {
      await client.query(`
        INSERT INTO menus (label, path, icon, target, group_label, sort_order)
        VALUES ($1, $2, $3, 'admin', $4, $5)
        ON CONFLICT (path, target) DO UPDATE SET
          label       = EXCLUDED.label,
          icon        = EXCLUDED.icon,
          group_label = EXCLUDED.group_label,
          sort_order  = EXCLUDED.sort_order
      `, [m.label, m.path, m.icon, m.group, m.sort]);
    }

    // Seed public menus
    for (const m of PUBLIC_MENUS) {
      await client.query(`
        INSERT INTO menus (label, path, icon, target, sort_order)
        VALUES ($1, $2, $3, 'public', $4)
        ON CONFLICT (path, target) DO UPDATE SET
          label      = EXCLUDED.label,
          icon       = EXCLUDED.icon,
          sort_order = EXCLUDED.sort_order
      `, [m.label, m.path, m.icon, m.sort]);
    }

    // Get IDs for role → menu mapping
    const rolesRes = await client.query('SELECT id, name FROM roles');
    const menusRes = await client.query('SELECT id, path, target FROM menus');
    const roleMap  = Object.fromEntries(rolesRes.rows.map(r => [r.name, r.id]));

    const adminOnly = ['/admin/roles', '/admin/menus', '/admin/role-menus'];

    for (const m of menusRes.rows) {
      const isSystemOnly = m.target === 'admin' && adminOnly.includes(m.path);

      // SuperAdmin → everything
      await client.query(
        'INSERT INTO role_menus (role_id, menu_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [roleMap['SuperAdmin'], m.id]
      );
      // Admin → all except system-management pages
      if (!isSystemOnly) {
        await client.query(
          'INSERT INTO role_menus (role_id, menu_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
          [roleMap['Admin'], m.id]
        );
      }
      // Member → public only
      if (m.target === 'public') {
        await client.query(
          'INSERT INTO role_menus (role_id, menu_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
          [roleMap['Member'], m.id]
        );
      }
    }

    await client.query('COMMIT');
    console.log('[menus] Seed complete');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[menus] Seed error:', err.message);
  } finally {
    client.release();
  }
};

initAndSeed();

/* ─── Controller methods ────────────────────────────────────────── */

/* GET /api/menus  — all menus (admin) */
exports.getAll = async (req, res) => {
  try {
    const target = req.query.target || '';
    const where  = target ? 'WHERE target = $1' : '';
    const vals   = target ? [target] : [];
    const result = await pool.query(
      `SELECT * FROM menus ${where} ORDER BY target, group_label, sort_order`,
      vals
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET /api/menus/public — active public menus (no auth) */
exports.getPublic = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM menus WHERE target='public' AND is_active=TRUE ORDER BY sort_order`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET /api/menus/by-role — menus for the authenticated user's role */
exports.getByRole = async (req, res) => {
  try {
    const role   = req.user.role;
    const target = req.query.target || 'admin';
    const result = await pool.query(
      `SELECT m.*
       FROM menus m
       JOIN role_menus rm ON rm.menu_id = m.id
       JOIN roles r ON r.id = rm.role_id
       WHERE r.name = $1 AND m.target = $2 AND m.is_active = TRUE
       ORDER BY m.group_label, m.sort_order`,
      [role, target]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* POST /api/menus */
exports.create = async (req, res) => {
  try {
    const { label, path, icon, target, group_label, sort_order, is_active } = req.body;
    if (!label || !path) return res.status(400).json({ message: 'label and path are required' });
    const result = await pool.query(
      `INSERT INTO menus (label, path, icon, target, group_label, sort_order, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [label, path, icon || null, target || 'admin', group_label || null, sort_order || 0, is_active !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'A menu with this path and target already exists' });
    res.status(500).json({ message: err.message });
  }
};

/* PUT /api/menus/:id */
exports.update = async (req, res) => {
  try {
    const { label, path, icon, target, group_label, sort_order, is_active } = req.body;
    const cur = await pool.query('SELECT * FROM menus WHERE id=$1', [req.params.id]);
    if (!cur.rows.length) return res.status(404).json({ message: 'Menu not found' });
    const m = cur.rows[0];
    const result = await pool.query(
      `UPDATE menus SET label=$1, path=$2, icon=$3, target=$4, group_label=$5, sort_order=$6, is_active=$7
       WHERE id=$8 RETURNING *`,
      [
        label       ?? m.label,
        path        ?? m.path,
        icon        !== undefined ? icon        : m.icon,
        target      ?? m.target,
        group_label !== undefined ? group_label : m.group_label,
        sort_order  ?? m.sort_order,
        is_active   !== undefined ? is_active   : m.is_active,
        req.params.id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'A menu with this path and target already exists' });
    res.status(500).json({ message: err.message });
  }
};

/* DELETE /api/menus/:id */
exports.remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM menus WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Menu not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* POST /api/menus/reseed — re-run seed (SuperAdmin only) */
exports.reseed = async (req, res) => {
  try {
    await initAndSeed();
    res.json({ message: 'Seed completed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
