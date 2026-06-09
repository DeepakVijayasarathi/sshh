const { query } = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { sendEmail, emailTemplates } = require('../utils/email');
const { v4: uuidv4 } = require('uuid');

exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req);
    const { status } = req.query;
    const where = status ? `WHERE sa.status = $1` : '';
    const params = status ? [status] : [];
    const total = parseInt((await query(`SELECT COUNT(*) FROM scholarship_applications sa ${where}`, params)).rows[0].count);
    const data = await query(
      `SELECT sa.*, s.full_name, s.school_college, s.course, s.mobile_number, s.email
       FROM scholarship_applications sa JOIN students s ON s.id = sa.student_id
       ${where} ORDER BY sa.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    res.json(paginatedResponse(data.rows, total, page, limit));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await query(
      `SELECT sa.*, s.full_name, s.school_college, s.course, s.mobile_number, s.email, s.year_of_study
       FROM scholarship_applications sa JOIN students s ON s.id = sa.student_id
       WHERE sa.id=$1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Application not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.apply = async (req, res) => {
  try {
    const { fullName, mobileNumber, email, schoolCollege, course, yearOfStudy, district, city, academicYear, marksPercentage } = req.body;
    const files = req.files || {};

    const studentId = uuidv4();
    const appId = uuidv4();

    await query(
      `INSERT INTO students (id, user_id, full_name, mobile_number, email, school_college, course, year_of_study, district, city)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [studentId, req.user?.id, fullName, mobileNumber, email, schoolCollege, course, yearOfStudy, district, city]
    );

    const incomeCertUrl = files.incomeCertificate?.[0] ? `/uploads/scholarships/${files.incomeCertificate[0].filename}` : null;
    const commCertUrl = files.communityCertificate?.[0] ? `/uploads/scholarships/${files.communityCertificate[0].filename}` : null;
    const marksheetUrl = files.marksheet?.[0] ? `/uploads/scholarships/${files.marksheet[0].filename}` : null;

    await query(
      `INSERT INTO scholarship_applications (id, student_id, academic_year, marks_percentage, income_certificate_url, community_certificate_url, marksheet_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [appId, studentId, academicYear, marksPercentage, incomeCertUrl, commCertUrl, marksheetUrl]
    );

    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, amount, remarks, rejectionReason } = req.body;
    const result = await query(
      `UPDATE scholarship_applications SET status=$2, amount=$3, remarks=$4, rejection_reason=$5,
        approved_by=$6, approved_at=CASE WHEN $2='Approved' THEN NOW() ELSE NULL END, updated_at=NOW()
       WHERE id=$1 RETURNING *, (SELECT email FROM students WHERE id = student_id) as email,
       (SELECT full_name FROM students WHERE id = student_id) as name`,
      [req.params.id, status, amount, remarks, rejectionReason, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Application not found' });

    const app = result.rows[0];
    if (app.email) {
      const tmpl = emailTemplates.scholarshipUpdate(app.name, status);
      sendEmail({ to: app.email, ...tmpl }).catch(() => {});
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
