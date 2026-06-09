require('dotenv').config({ path: '../server/.env', override: true });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const q = (text, params) => pool.query(text, params);

const DISTRICTS = ['Salem', 'Chennai', 'Madurai', 'Coimbatore', 'Tirupur', 'Erode', 'Namakkal'];
const CITIES = ['Salem', 'Attur', 'Omalur', 'Mettur', 'Rasipuram', 'Tiruchengodu', 'Sankari'];
const OCCUPATIONS = ['Business', 'Software Engineer', 'Doctor', 'Teacher', 'Farmer', 'Lawyer', 'Accountant'];
const EDUCATIONS = ['B.E', 'B.Sc', 'M.A', 'MBBS', 'B.Com', 'M.Tech', 'Diploma'];

async function seed() {
  console.log('Seeding database...');

  // Membership types IDs
  const mtResult = await q('SELECT id, name FROM membership_types ORDER BY id');
  const mtMap = {};
  mtResult.rows.forEach(r => { mtMap[r.name] = r.id; });

  // ─── MEMBERS ────────────────────────────────────────────────
  console.log('Seeding members...');
  const memberNames = [
    'Rajesh Kumar', 'Priya Devi', 'Suresh Babu', 'Meena Kumari', 'Arun Patel',
    'Lakshmi Narayanan', 'Karthik Raj', 'Sangeetha Devi', 'Venkatesh Iyer', 'Deepa Rajan',
    'Mohan Das', 'Kavitha Sundar', 'Selvam Pillai', 'Radha Krishna', 'Ramesh Chandran',
  ];

  const memberIds = [];
  const membershipTypeNames = Object.keys(mtMap);
  for (let i = 0; i < memberNames.length; i++) {
    const id = uuidv4();
    const year = 2024;
    const seq = String(i + 1).padStart(4, '0');
    const memNo = i < 10 ? `SCP${year}${seq}` : null;
    const status = i < 10 ? 'Active' : (i < 13 ? 'Pending' : 'Rejected');
    const typeName = membershipTypeNames[i % membershipTypeNames.length];
    await q(
      `INSERT INTO members (id, full_name, gender, mobile_number, email, district, city,
        occupation, education, membership_type_id, membership_number, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, NOW() - INTERVAL '${i * 7} days')
       ON CONFLICT DO NOTHING`,
      [id, memberNames[i], i % 2 === 0 ? 'Male' : 'Female',
       `9${String(800000000 + i).slice(1)}`, `member${i + 1}@example.com`,
       DISTRICTS[i % DISTRICTS.length], CITIES[i % CITIES.length],
       OCCUPATIONS[i % OCCUPATIONS.length], EDUCATIONS[i % EDUCATIONS.length],
       mtMap[typeName], memNo, status]
    );
    memberIds.push(id);
  }

  // ─── EVENTS ─────────────────────────────────────────────────
  console.log('Seeding events...');
  const adminUser = (await q("SELECT id FROM users WHERE role='SuperAdmin' LIMIT 1")).rows[0];

  const events = [
    { title: 'Annual Sourashtra Cultural Fest 2025', desc: 'Celebrate our rich cultural heritage with music, dance, and traditional arts.', days: 30, venue: 'Town Hall, Salem', limit: 500 },
    { title: 'Sourashtra Youth Sports Tournament', desc: 'Inter-district cricket and kabaddi tournament for youth aged 15-25.', days: 15, venue: 'District Sports Complex, Attur', limit: 200 },
    { title: 'Community Blood Donation Drive', desc: 'Give blood, save lives. All blood groups needed.', days: 7, venue: 'Community Center, Salem', limit: 100 },
    { title: 'Scholarship Award Ceremony 2025', desc: 'Felicitating outstanding students from our community.', days: -10, venue: 'Government College Auditorium', limit: 300 },
    { title: 'Senior Citizens Health Camp', desc: 'Free health checkup including sugar, BP, eye and dental screening.', days: -20, venue: 'Sourashtra Sabha, Madurai', limit: 150 },
    { title: 'Entrepreneurs Meet 2025', desc: 'Business networking and mentoring session for community entrepreneurs.', days: 45, venue: 'Hotel Saravana Bhavan, Coimbatore', limit: 80 },
  ];

  const eventIds = [];
  for (const ev of events) {
    const id = uuidv4();
    await q(
      `INSERT INTO events (id, title, description, event_date, event_time, venue, registration_limit, is_published, created_by)
       VALUES ($1,$2,$3, CURRENT_DATE + INTERVAL '${ev.days} days', '10:00', $4, $5, TRUE, $6)
       ON CONFLICT DO NOTHING`,
      [id, ev.title, ev.desc, ev.venue, ev.limit, adminUser.id]
    );
    eventIds.push(id);
  }

  // Event registrations
  for (let i = 0; i < Math.min(eventIds.length, memberIds.length); i++) {
    await q(
      `INSERT INTO event_registrations (id, event_id, name, email, mobile)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      [uuidv4(), eventIds[i % eventIds.length], memberNames[i], `member${i + 1}@example.com`, `98765432${String(i).padStart(2,'0')}`]
    ).catch(() => {});
  }

  // ─── NEWS ───────────────────────────────────────────────────
  console.log('Seeding news...');
  const newsItems = [
    { title: 'Annual General Body Meeting 2025 – Notice', content: 'The Annual General Body Meeting of Sourashtra Community will be held on 15th July 2025 at Salem Town Hall. All members are requested to attend.', category: 'Community News' },
    { title: 'Sourashtra Student Welfare Fund – Applications Open', content: 'Applications are now open for the Sourashtra Student Welfare Scholarship 2025-26. Students from Class 9 to PG are eligible. Apply before 30th June.', category: 'Education' },
    { title: 'URGENT: Flood Relief Fund Appeal', content: 'Our community members in the delta districts are affected by floods. Donate generously to the relief fund. Contact the treasurer for more details.', category: 'Emergency Announcement' },
    { title: 'Job Fair for Community Members – July 2025', content: 'A dedicated job fair for Sourashtra community members will be conducted in partnership with 20+ companies. Register now to attend.', category: 'Jobs' },
    { title: 'Cultural Night – Sourashtra Sangamam 2025 Highlights', content: 'Last month\'s Cultural Night was a grand success with 1200+ attendees. Watch the highlights video and relive the memories.', category: 'Events' },
    { title: 'New Business Directory Launched', content: 'We are proud to launch our online business directory featuring 150+ businesses owned by community members. List your business today for free.', category: 'Community News' },
  ];

  for (let i = 0; i < newsItems.length; i++) {
    await q(
      `INSERT INTO news (id, title, content, category, is_published, is_featured, publish_date, created_by)
       VALUES ($1,$2,$3,$4, TRUE, $5, NOW() - INTERVAL '${i * 5} days', $6) ON CONFLICT DO NOTHING`,
      [uuidv4(), newsItems[i].title, newsItems[i].content, newsItems[i].category, i < 2, adminUser.id]
    );
  }

  // ─── GALLERY ────────────────────────────────────────────────
  console.log('Seeding gallery...');
  const albums = [
    'Annual Cultural Fest 2024', 'Blood Donation Camp 2024', 'Youth Sports Day 2024', 'Scholarship Ceremony 2024',
  ];
  for (const title of albums) {
    const albumId = uuidv4();
    await q(
      `INSERT INTO gallery_albums (id, title, description, is_published, created_by)
       VALUES ($1,$2,$3, TRUE, $4) ON CONFLICT DO NOTHING`,
      [albumId, title, `Photos from ${title}`, adminUser.id]
    );
  }

  // ─── BUSINESSES ─────────────────────────────────────────────
  console.log('Seeding businesses...');
  const catResult = await q('SELECT id, name FROM business_categories');
  const catMap = {};
  catResult.rows.forEach(r => { catMap[r.name] = r.id; });

  const businesses = [
    { name: 'Sri Murugan Textiles', owner: 'Ramesh Chandran', cat: 'Retail', city: 'Salem', phone: '9876543210' },
    { name: 'Sourashtra Medical Centre', owner: 'Dr. Meena Kumari', cat: 'Healthcare', city: 'Attur', phone: '9876543211' },
    { name: 'Rajesh Software Solutions', owner: 'Rajesh Kumar', cat: 'Technology', city: 'Chennai', phone: '9876543212' },
    { name: 'Kavitha Catering Services', owner: 'Kavitha Sundar', cat: 'Restaurant', city: 'Coimbatore', phone: '9876543213' },
    { name: 'Lakshmi Finance', owner: 'Lakshmi Narayanan', cat: 'Finance', city: 'Salem', phone: '9876543214' },
    { name: 'Arun Construction', owner: 'Arun Patel', cat: 'Construction', city: 'Erode', phone: '9876543215' },
    { name: 'Karthik Pharma Distributors', owner: 'Karthik Raj', cat: 'Services', city: 'Namakkal', phone: '9876543216' },
  ];

  for (const b of businesses) {
    await q(
      `INSERT INTO businesses (id, business_name, owner_name, category_id, mobile_number, city, status, is_featured)
       VALUES ($1,$2,$3,$4,$5,$6,'Active', $7) ON CONFLICT DO NOTHING`,
      [uuidv4(), b.name, b.owner, catMap[b.cat] || catMap['Other'], b.phone, b.city, businesses.indexOf(b) < 3]
    );
  }

  // ─── JOBS ───────────────────────────────────────────────────
  console.log('Seeding jobs...');
  const jobList = [
    { title: 'Software Developer', company: 'TechCorp Solutions', location: 'Chennai', salary: '₹4L - ₹8L', exp: '1-3 years', desc: 'Looking for a skilled React/Node.js developer to join our growing team.' },
    { title: 'Accounts Manager', company: 'Lakshmi Finance', location: 'Salem', salary: '₹3L - ₹5L', exp: '2-5 years', desc: 'Manage accounts, ledgers, and financial reporting for our Salem branch.' },
    { title: 'Sales Executive', company: 'Sri Murugan Textiles', location: 'Salem', salary: '₹2L - ₹3.5L', exp: 'Freshers OK', desc: 'Energetic candidates for B2B textile sales across Tamil Nadu.' },
    { title: 'Staff Nurse', company: 'Sourashtra Medical Centre', location: 'Attur', salary: '₹2.5L - ₹4L', exp: '1+ year', desc: 'GNM/B.Sc Nursing candidates for our hospital in Attur.' },
    { title: 'Civil Site Engineer', company: 'Arun Construction', location: 'Erode', salary: '₹3.5L - ₹6L', exp: '2-4 years', desc: 'Manage civil construction works and supervise on-site activities.' },
  ];

  for (const job of jobList) {
    await q(
      `INSERT INTO jobs (id, job_title, company_name, location, salary_range, experience_required, description,
        last_date, is_published, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7, CURRENT_DATE + INTERVAL '30 days', TRUE, 'Active', $8) ON CONFLICT DO NOTHING`,
      [uuidv4(), job.title, job.company, job.location, job.salary, job.exp, job.desc, adminUser.id]
    );
  }

  // ─── DONATIONS ──────────────────────────────────────────────
  console.log('Seeding donations...');
  const donors = [
    { name: 'Rajesh Kumar', amount: 5000, method: 'UPI', purpose: 'General Fund' },
    { name: 'Suresh Babu', amount: 10000, method: 'Bank Transfer', purpose: 'Flood Relief' },
    { name: 'Karthik Raj', amount: 2500, method: 'Cash', purpose: 'Student Welfare' },
    { name: 'Lakshmi Narayanan', amount: 25000, method: 'Cheque', purpose: 'Building Fund' },
    { name: 'Arun Patel', amount: 1000, method: 'UPI', purpose: 'Cultural Fest' },
    { name: 'Mohan Das', amount: 15000, method: 'Bank Transfer', purpose: 'General Fund' },
  ];

  for (let i = 0; i < donors.length; i++) {
    const year = 2025;
    const seq = String(i + 1).padStart(4, '0');
    await q(
      `INSERT INTO donations (id, donor_name, amount, payment_method, purpose, status, receipt_number,
        donated_at)
       VALUES ($1,$2,$3,$4,$5,'Completed',$6, NOW() - INTERVAL '${i * 10} days') ON CONFLICT DO NOTHING`,
      [uuidv4(), donors[i].name, donors[i].amount, donors[i].method, donors[i].purpose, `RCP${year}${seq}`]
    );
  }

  // ─── FORUM ISSUES ───────────────────────────────────────────
  console.log('Seeding forum issues...');
  const issues = [
    { title: 'Request for Road Repair Near Community Hall', desc: 'The road near our community hall has large potholes causing accidents. We request the municipality to repair it urgently.', cat: 'Community Welfare', status: 'Pending' },
    { title: 'Street Light Not Working in Sourashtra Colony', desc: 'Three street lights in our colony have been non-functional for over a month. Request immediate repair.', cat: 'Community Welfare', status: 'Under Review' },
    { title: 'Need Tailoring Training for Women', desc: 'Many women in our community are interested in learning tailoring. We request the women\'s wing to organize a training program.', cat: 'Women Empowerment', status: 'Resolved' },
    { title: 'Youth Cricket Ground Maintenance', desc: 'The cricket ground used by our youth wing needs re-levelling and pitch preparation before the tournament.', cat: 'Youth Development', status: 'Pending' },
  ];

  for (const issue of issues) {
    await q(
      `INSERT INTO community_issues (id, name, issue_title, issue_description, category, status,
        resolved_at)
       VALUES ($1,'Community Member',$2,$3,$4,$5, $6) ON CONFLICT DO NOTHING`,
      [uuidv4(), issue.title, issue.desc, issue.cat, issue.status,
       issue.status === 'Resolved' ? new Date() : null]
    );
  }

  // ─── NOTIFICATIONS ──────────────────────────────────────────
  console.log('Seeding notifications...');
  const notifs = [
    { title: 'Welcome to Sourashtra Portal!', message: 'Your membership has been approved. You can now access all member features.', type: 'success' },
    { title: 'Annual Meeting Reminder', message: 'Annual General Body Meeting is on 15th July 2025. Please attend.', type: 'info' },
    { title: 'Scholarship Applications Open', message: 'Apply for the 2025-26 scholarship before 30th June.', type: 'info' },
  ];

  for (const n of notifs) {
    await q(
      `INSERT INTO notifications (id, title, message, type, channel)
       VALUES ($1,$2,$3,$4,'system') ON CONFLICT DO NOTHING`,
      [uuidv4(), n.title, n.message, n.type]
    );
  }

  console.log('✅ Seed complete!');
  await pool.end();
}

seed().catch(async e => {
  console.error('Seed failed:', e.message);
  await pool.end();
  process.exit(1);
});
