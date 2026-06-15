const { query } = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { v4: uuidv4 } = require('uuid');

exports.getIssues = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req);
    const { status, category, search } = req.query;

    let conditions = [];
    let params = [];
    let idx = 1;

    if (status) { conditions.push(`ci.status = $${idx}`); params.push(status); idx++; }
    if (category) { conditions.push(`ci.category = $${idx}`); params.push(category); idx++; }
    if (search) {
      conditions.push(`(ci.issue_title ILIKE $${idx} OR ci.name ILIKE $${idx} OR ci.contact_number ILIKE $${idx} OR ci.location ILIKE $${idx})`);
      params.push(`%${search}%`); idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = parseInt((await query(`SELECT COUNT(*) FROM community_issues ci ${where}`, params)).rows[0].count);
    const data = await query(
      `SELECT ci.*, COUNT(ic.id) as comment_count
       FROM community_issues ci LEFT JOIN issue_comments ic ON ic.issue_id = ci.id
       ${where} GROUP BY ci.id ORDER BY ci.created_at DESC LIMIT $${idx} OFFSET $${idx+1}`,
      [...params, limit, offset]
    );
    res.json(paginatedResponse(data.rows, total, page, limit));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getIssueById = async (req, res) => {
  try {
    const issue = await query('SELECT * FROM community_issues WHERE id=$1', [req.params.id]);
    if (!issue.rows.length) return res.status(404).json({ message: 'Issue not found' });
    const comments = await query(
      `SELECT ic.*, u.email as user_email FROM issue_comments ic
       LEFT JOIN users u ON u.id = ic.user_id
       WHERE ic.issue_id=$1 ORDER BY ic.created_at`,
      [req.params.id]
    );
    res.json({ ...issue.rows[0], comments: comments.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createIssue = async (req, res) => {
  try {
    const { forumName, name, location, issueTitle, issueDescription, contactNumber, category } = req.body;
    const pictureUrl = req.file ? `/uploads/issues/${req.file.filename}` : null;
    const id = uuidv4();

    const result = await query(
      `INSERT INTO community_issues (id, forum_name, name, location, issue_title, issue_description, picture_url, contact_number, category, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, forumName, name, location, issueTitle, issueDescription, pictureUrl, contactNumber, category, req.user?.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const VALID_STATUSES = ['Pending', 'Under Review', 'Resolved', 'Closed'];
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const result = await query(
      `UPDATE community_issues
         SET status = $2,
             resolved_at = CASE WHEN $2 = 'Resolved' THEN NOW() ELSE NULL END,
             updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [req.params.id, status]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Issue not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const id = uuidv4();
    const result = await query(
      'INSERT INTO issue_comments (id, issue_id, user_id, comment) VALUES ($1,$2,$3,$4) RETURNING *',
      [id, req.params.id, req.user?.id, comment]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteIssue = async (req, res) => {
  try {
    const result = await query('DELETE FROM community_issues WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Issue not found' });
    res.json({ message: 'Issue deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
