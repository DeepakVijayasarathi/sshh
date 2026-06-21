const { query, pool } = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { sendEmail, emailTemplates } = require('../utils/email');
const { v4: uuidv4 } = require('uuid');

// Ensure member_submitted column exists
pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS member_submitted BOOLEAN DEFAULT FALSE`).catch(() => {});

exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req);
    const { upcoming, past } = req.query;

    let where = '';
    if (upcoming === 'true') where = `WHERE e.event_date >= CURRENT_DATE AND e.is_published = TRUE`;
    else if (past === 'true') where = `WHERE e.event_date < CURRENT_DATE AND e.is_published = TRUE`;
    else where = `WHERE e.is_published = TRUE`;

    const total = parseInt((await query(`SELECT COUNT(*) FROM events e ${where}`)).rows[0].count);
    const data = await query(
      `SELECT e.*, COUNT(er.id) as registered_count
       FROM events e
       LEFT JOIN event_registrations er ON er.event_id = e.id
       ${where}
       GROUP BY e.id
       ORDER BY e.event_date DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json(paginatedResponse(data.rows, total, page, limit));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const event = await query(
      `SELECT e.*, COUNT(er.id) as registered_count
       FROM events e LEFT JOIN event_registrations er ON er.event_id = e.id
       WHERE e.id = $1 GROUP BY e.id`,
      [req.params.id]
    );
    if (!event.rows.length) return res.status(404).json({ message: 'Event not found' });
    res.json(event.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, eventDate, eventTime, venue, googleMapLink,
      registrationLimit, contactPerson, contactNumber, isPublished } = req.body;
    const bannerUrl = req.file ? `/uploads/events/${req.file.filename}` : null;
    const id = uuidv4();

    const result = await query(
      `INSERT INTO events (id, title, description, event_date, event_time, venue, google_map_link,
        banner_image_url, registration_limit, contact_person, contact_number, is_published, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [id, title, description, eventDate, eventTime, venue, googleMapLink,
       bannerUrl, registrationLimit, contactPerson, contactNumber, isPublished === 'true', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, eventDate, eventTime, venue, googleMapLink,
      registrationLimit, contactPerson, contactNumber, isPublished } = req.body;
    const bannerUrl = req.file ? `/uploads/events/${req.file.filename}` : undefined;

    let sets = `title=$2, description=$3, event_date=$4, event_time=$5, venue=$6,
      google_map_link=$7, registration_limit=$8, contact_person=$9, contact_number=$10,
      is_published=$11, updated_at=NOW()`;
    let values = [req.params.id, title, description, eventDate, eventTime, venue,
      googleMapLink, registrationLimit, contactPerson, contactNumber, isPublished === 'true'];

    if (bannerUrl) { sets += `, banner_image_url=$${values.length + 1}`; values.push(bannerUrl); }

    const result = await query(`UPDATE events SET ${sets} WHERE id=$1 RETURNING *`, values);
    if (!result.rows.length) return res.status(404).json({ message: 'Event not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await query('DELETE FROM events WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdminAll = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req);
    const total = parseInt((await query(`SELECT COUNT(*) FROM events e`)).rows[0].count);
    const data = await query(
      `SELECT e.*, COUNT(er.id) as registered_count
       FROM events e
       LEFT JOIN event_registrations er ON er.event_id = e.id
       GROUP BY e.id
       ORDER BY e.event_date DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json(paginatedResponse(data.rows, total, page, limit));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.memberSubmit = async (req, res) => {
  try {
    const { title, description, eventDate, eventTime, venue, contactPerson, contactNumber } = req.body;
    if (!title || !eventDate) return res.status(400).json({ message: 'Title and date are required' });
    const bannerUrl = req.file ? `/uploads/events/${req.file.filename}` : null;
    const id = uuidv4();
    const result = await query(
      `INSERT INTO events (id, title, description, event_date, event_time, venue,
        banner_image_url, contact_person, contact_number, is_published, member_submitted, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,FALSE,TRUE,$10) RETURNING *`,
      [id, title, description || null, eventDate, eventTime || null, venue || null,
       bannerUrl, contactPerson || null, contactNumber || null, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { memberId, name, email, mobile } = req.body;
    const event = await query('SELECT * FROM events WHERE id=$1', [req.params.id]);
    if (!event.rows.length) return res.status(404).json({ message: 'Event not found' });

    const ev = event.rows[0];
    if (ev.registration_limit) {
      const count = await query('SELECT COUNT(*) FROM event_registrations WHERE event_id=$1', [req.params.id]);
      if (parseInt(count.rows[0].count) >= ev.registration_limit) {
        return res.status(400).json({ message: 'Registration limit reached' });
      }
    }

    // For guest registrations (no memberId), prevent duplicate registration by email
    if (!memberId && email) {
      const dup = await query(
        'SELECT id FROM event_registrations WHERE event_id=$1 AND email=$2 AND member_id IS NULL',
        [req.params.id, email]
      );
      if (dup.rows.length) {
        return res.status(400).json({ message: 'Already registered with this email' });
      }
    }

    const id = uuidv4();
    await query(
      `INSERT INTO event_registrations (id, event_id, member_id, name, email, mobile)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, req.params.id, memberId || null, name, email, mobile]
    );

    if (email) {
      const tmpl = emailTemplates.eventRegistration(name, ev.title, ev.event_date);
      sendEmail({ to: email, ...tmpl }).catch(() => {});
    }

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Already registered' });
    res.status(500).json({ message: err.message });
  }
};

exports.getParticipants = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM event_registrations WHERE event_id=$1 ORDER BY registered_at DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
