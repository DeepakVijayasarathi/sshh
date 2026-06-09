const { query } = require('../config/database');

const ALLOWED_KEYS = [
  'site_name', 'site_tagline', 'logo_url', 'favicon_url',
  'contact_email', 'contact_phone', 'contact_address',
  'facebook_url', 'instagram_url', 'twitter_url', 'youtube_url',
  'footer_text', 'primary_color',
];

exports.getAll = async (req, res) => {
  try {
    const result = await query('SELECT key, value FROM site_settings');
    const settings = {};
    result.rows.forEach(({ key, value }) => { settings[key] = value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updates = req.body;
    if (typeof updates !== 'object' || Array.isArray(updates)) {
      return res.status(400).json({ message: 'Body must be a key-value object' });
    }

    const invalid = Object.keys(updates).filter(k => !ALLOWED_KEYS.includes(k));
    if (invalid.length) {
      return res.status(400).json({ message: `Invalid settings keys: ${invalid.join(', ')}` });
    }

    for (const [key, value] of Object.entries(updates)) {
      await query(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value]
      );
    }

    const result = await query('SELECT key, value FROM site_settings');
    const settings = {};
    result.rows.forEach(({ key, value }) => { settings[key] = value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const logoUrl = `/uploads/settings/${req.file.filename}`;
    await query(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES ('logo_url', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
      [logoUrl]
    );
    res.json({ logo_url: logoUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
