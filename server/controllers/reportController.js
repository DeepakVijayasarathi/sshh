const { query } = require('../config/database');
const ExcelJS = require('exceljs');

const exportToExcel = async (res, data, columns, sheetName) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns;
  sheet.addRows(data);
  sheet.getRow(1).font = { bold: true };
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${sheetName}.xlsx`);
  await workbook.xlsx.write(res);
  res.end();
};

exports.memberReport = async (req, res) => {
  try {
    const { district, membershipType, status, format = 'json' } = req.query;
    let conditions = [];
    let params = [];
    let idx = 1;
    if (district) { conditions.push(`m.district = $${idx}`); params.push(district); idx++; }
    if (membershipType) { conditions.push(`mt.name = $${idx}`); params.push(membershipType); idx++; }
    if (status) { conditions.push(`m.status = $${idx}`); params.push(status); idx++; }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT m.membership_number, m.full_name, m.gender, m.mobile_number, m.email,
              m.district, m.city, m.occupation, m.education, mt.name as membership_type, m.status, m.created_at
       FROM members m LEFT JOIN membership_types mt ON mt.id = m.membership_type_id
       ${where} ORDER BY m.created_at DESC`,
      params
    );

    if (format === 'excel') {
      return exportToExcel(res, result.rows, [
        { header: 'Member No', key: 'membership_number', width: 15 },
        { header: 'Name', key: 'full_name', width: 25 },
        { header: 'Gender', key: 'gender', width: 10 },
        { header: 'Mobile', key: 'mobile_number', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'District', key: 'district', width: 15 },
        { header: 'City', key: 'city', width: 15 },
        { header: 'Occupation', key: 'occupation', width: 20 },
        { header: 'Type', key: 'membership_type', width: 15 },
        { header: 'Status', key: 'status', width: 10 },
      ], 'Members');
    }

    res.json({ count: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.eventReport = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const result = await query(
      `SELECT e.title, e.event_date, e.venue, e.registration_limit, COUNT(er.id) as registered
       FROM events e LEFT JOIN event_registrations er ON er.event_id = e.id
       GROUP BY e.id ORDER BY e.event_date DESC`
    );
    if (format === 'excel') {
      return exportToExcel(res, result.rows, [
        { header: 'Event', key: 'title', width: 30 },
        { header: 'Date', key: 'event_date', width: 15 },
        { header: 'Venue', key: 'venue', width: 25 },
        { header: 'Limit', key: 'registration_limit', width: 10 },
        { header: 'Registered', key: 'registered', width: 12 },
      ], 'Events');
    }
    res.json({ count: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.donationReport = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const result = await query(
      `SELECT receipt_number, donor_name, mobile_number, email, amount, payment_method, purpose, donated_at
       FROM donations WHERE status='Completed' ORDER BY donated_at DESC`
    );
    if (format === 'excel') {
      return exportToExcel(res, result.rows, [
        { header: 'Receipt No', key: 'receipt_number', width: 15 },
        { header: 'Donor', key: 'donor_name', width: 25 },
        { header: 'Mobile', key: 'mobile_number', width: 15 },
        { header: 'Amount', key: 'amount', width: 12 },
        { header: 'Payment Method', key: 'payment_method', width: 15 },
        { header: 'Purpose', key: 'purpose', width: 20 },
        { header: 'Date', key: 'donated_at', width: 20 },
      ], 'Donations');
    }
    res.json({ count: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.districtReport = async (req, res) => {
  try {
    const result = await query(
      `SELECT district, COUNT(*) as total,
              SUM(CASE WHEN status='Active' THEN 1 ELSE 0 END) as active,
              SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) as pending
       FROM members WHERE district IS NOT NULL
       GROUP BY district ORDER BY total DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
