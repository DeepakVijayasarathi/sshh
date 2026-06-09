const { query } = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { v4: uuidv4 } = require('uuid');

exports.getJobs = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req);
    const { search, location } = req.query;

    let conditions = [`j.is_published = TRUE AND j.status = 'Active'`];
    let params = [];
    let idx = 1;

    if (search) {
      conditions.push(`(j.job_title ILIKE $${idx} OR j.company_name ILIKE $${idx})`);
      params.push(`%${search}%`); idx++;
    }
    if (location) { conditions.push(`j.location ILIKE $${idx}`); params.push(`%${location}%`); idx++; }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const total = parseInt((await query(`SELECT COUNT(*) FROM jobs j ${where}`, params)).rows[0].count);
    const data = await query(
      `SELECT j.* FROM jobs j ${where} ORDER BY j.created_at DESC LIMIT $${idx} OFFSET $${idx+1}`,
      [...params, limit, offset]
    );
    res.json(paginatedResponse(data.rows, total, page, limit));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req);
    const total = parseInt((await query('SELECT COUNT(*) FROM jobs')).rows[0].count);
    const data = await query('SELECT * FROM jobs ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json(paginatedResponse(data.rows, total, page, limit));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const result = await query('SELECT * FROM jobs WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Job not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const { employerId, jobTitle, companyName, location, salaryRange, experienceRequired, description, lastDate } = req.body;
    const id = uuidv4();
    const result = await query(
      `INSERT INTO jobs (id, employer_id, job_title, company_name, location, salary_range, experience_required, description, last_date, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, employerId, jobTitle, companyName, location, salaryRange, experienceRequired, description, lastDate, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { jobTitle, companyName, location, salaryRange, experienceRequired, description, lastDate, isPublished } = req.body;
    const result = await query(
      `UPDATE jobs SET job_title=$2, company_name=$3, location=$4, salary_range=$5,
        experience_required=$6, description=$7, last_date=$8, is_published=$9, updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [req.params.id, jobTitle, companyName, location, salaryRange, experienceRequired, description, lastDate, isPublished === 'true']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    await query('DELETE FROM jobs WHERE id=$1', [req.params.id]);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.applyJob = async (req, res) => {
  try {
    const { fullName, mobileNumber, email, skills, experienceYears, coverLetter } = req.body;
    const resumeUrl = req.file ? `/uploads/resumes/${req.file.filename}` : null;
    const candidateId = uuidv4();
    const appId = uuidv4();

    let candidate = await query('SELECT id FROM candidates WHERE email=$1', [email]);
    if (!candidate.rows.length) {
      await query(
        'INSERT INTO candidates (id, user_id, full_name, mobile_number, email, resume_url, skills, experience_years) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [candidateId, req.user?.id, fullName, mobileNumber, email, resumeUrl, skills, experienceYears]
      );
      candidate = { rows: [{ id: candidateId }] };
    }

    await query(
      'INSERT INTO job_applications (id, job_id, candidate_id, cover_letter) VALUES ($1,$2,$3,$4)',
      [appId, req.params.id, candidate.rows[0].id, coverLetter]
    );
    res.status(201).json({ message: 'Application submitted' });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Already applied' });
    res.status(500).json({ message: err.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const result = await query(
      `SELECT ja.*, c.full_name, c.email, c.mobile_number, c.resume_url
       FROM job_applications ja JOIN candidates c ON c.id = ja.candidate_id
       WHERE ja.job_id=$1 ORDER BY ja.applied_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.registerEmployer = async (req, res) => {
  try {
    const { companyName, contactPerson, mobileNumber, email, address } = req.body;
    const id = uuidv4();
    const result = await query(
      'INSERT INTO employers (id, user_id, company_name, contact_person, mobile_number, email, address) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [id, req.user?.id, companyName, contactPerson, mobileNumber, email, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
