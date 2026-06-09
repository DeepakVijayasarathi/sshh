const { query } = require('../config/database');

exports.getStats = async (req, res) => {
  try {
    const [members, pendingMembers, events, businesses, jobs, scholarships, issues, donations] = await Promise.all([
      query("SELECT COUNT(*) FROM members WHERE status='Active'"),
      query("SELECT COUNT(*) FROM members WHERE status='Pending'"),
      query("SELECT COUNT(*) FROM events"),
      query("SELECT COUNT(*) FROM businesses WHERE status='Active'"),
      query("SELECT COUNT(*) FROM jobs WHERE status='Active'"),
      query("SELECT COUNT(*) FROM scholarship_applications WHERE status='Pending'"),
      query("SELECT COUNT(*) FROM community_issues WHERE status NOT IN ('Resolved','Closed')"),
      query("SELECT COALESCE(SUM(amount),0) as total FROM donations WHERE status='Completed'"),
    ]);

    res.json({
      totalMembers: parseInt(members.rows[0].count),
      pendingApprovals: parseInt(pendingMembers.rows[0].count),
      totalEvents: parseInt(events.rows[0].count),
      activeBusinesses: parseInt(businesses.rows[0].count),
      activeJobs: parseInt(jobs.rows[0].count),
      pendingScholarships: parseInt(scholarships.rows[0].count),
      openIssues: parseInt(issues.rows[0].count),
      totalDonations: parseFloat(donations.rows[0].total),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const [recentMembers, recentEvents, recentNews] = await Promise.all([
      query("SELECT id, full_name, membership_number, status, created_at FROM members ORDER BY created_at DESC LIMIT 5"),
      query("SELECT id, title, event_date, is_published FROM events ORDER BY created_at DESC LIMIT 5"),
      query("SELECT id, title, category, is_published, created_at FROM news ORDER BY created_at DESC LIMIT 5"),
    ]);

    res.json({
      recentMembers: recentMembers.rows,
      recentEvents: recentEvents.rows,
      recentNews: recentNews.rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMembersByDistrict = async (req, res) => {
  try {
    const result = await query(
      `SELECT district, COUNT(*) as count FROM members WHERE status='Active' AND district IS NOT NULL
       GROUP BY district ORDER BY count DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMembersByType = async (req, res) => {
  try {
    const result = await query(
      `SELECT mt.name, COUNT(m.id) as count
       FROM membership_types mt LEFT JOIN members m ON m.membership_type_id = mt.id AND m.status = 'Active'
       GROUP BY mt.name ORDER BY mt.id`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
