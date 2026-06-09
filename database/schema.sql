-- Sourashtra Community Portal Database Schema
-- PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ROLES & USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (name, description) VALUES
  ('SuperAdmin', 'Full system access'),
  ('Admin', 'Portal administration'),
  ('Member', 'Regular community member'),
  ('BusinessOwner', 'Business directory owner'),
  ('Employer', 'Job portal employer'),
  ('Student', 'Education support student'),
  ('Guest', 'Public visitor')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Member' REFERENCES roles(name),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MEMBERSHIP
-- ============================================================
CREATE TABLE IF NOT EXISTS membership_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  fee NUMERIC(10,2) DEFAULT 0,
  duration_months INT DEFAULT 12,
  is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO membership_types (name, description, fee, duration_months) VALUES
  ('Individual Member', 'Single person membership', 500.00, 12),
  ('Family Member', 'Family membership', 1000.00, 12),
  ('Life Member', 'Lifetime membership', 5000.00, NULL),
  ('Patron Member', 'Patron level membership', 10000.00, NULL)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  membership_number VARCHAR(20) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  gender VARCHAR(10),
  date_of_birth DATE,
  mobile_number VARCHAR(15) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  district VARCHAR(100),
  city VARCHAR(100),
  pincode VARCHAR(10),
  occupation VARCHAR(150),
  education VARCHAR(150),
  photo_url VARCHAR(500),
  aadhaar_number VARCHAR(12),
  membership_type_id INT REFERENCES membership_types(id),
  status VARCHAR(20) DEFAULT 'Pending',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  renewal_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_member_status CHECK (status IN ('Pending','Active','Rejected','Expired','Suspended'))
);

CREATE TABLE IF NOT EXISTS member_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  card_number VARCHAR(30) UNIQUE NOT NULL,
  issued_date DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  venue TEXT,
  google_map_link TEXT,
  banner_image_url VARCHAR(500),
  registration_limit INT,
  contact_person VARCHAR(255),
  contact_number VARCHAR(15),
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  mobile VARCHAR(15),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'Registered',
  UNIQUE(event_id, member_id)
);

-- ============================================================
-- NEWS & ANNOUNCEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  category VARCHAR(50) DEFAULT 'Community News',
  publish_date TIMESTAMPTZ DEFAULT NOW(),
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_news_category CHECK (category IN ('Community News','Emergency Announcement','Events','Education','Jobs'))
);

-- ============================================================
-- GALLERY
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url VARCHAR(500),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(10) DEFAULT 'image',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BUSINESS DIRECTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS business_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO business_categories (name) VALUES
  ('Retail'), ('Restaurant'), ('Healthcare'), ('Education'), ('Technology'),
  ('Construction'), ('Finance'), ('Manufacturing'), ('Services'), ('Other')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  business_name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  category_id INT REFERENCES business_categories(id),
  mobile_number VARCHAR(15) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  website VARCHAR(255),
  description TEXT,
  logo_url VARCHAR(500),
  is_featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'Pending',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_business_status CHECK (status IN ('Pending','Active','Rejected','Suspended'))
);

-- ============================================================
-- JOB PORTAL
-- ============================================================
CREATE TABLE IF NOT EXISTS employers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  mobile_number VARCHAR(15),
  email VARCHAR(255),
  address TEXT,
  status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  job_title VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  salary_range VARCHAR(100),
  experience_required VARCHAR(100),
  description TEXT,
  last_date DATE,
  is_published BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'Active',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  full_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(15),
  email VARCHAR(255),
  resume_url VARCHAR(500),
  skills TEXT,
  experience_years INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  cover_letter TEXT,
  status VARCHAR(20) DEFAULT 'Applied',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

-- ============================================================
-- EDUCATION SUPPORT
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  full_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(15),
  email VARCHAR(255),
  school_college VARCHAR(255),
  course VARCHAR(255),
  year_of_study VARCHAR(50),
  district VARCHAR(100),
  city VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scholarship_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  academic_year VARCHAR(20),
  marks_percentage NUMERIC(5,2),
  income_certificate_url VARCHAR(500),
  community_certificate_url VARCHAR(500),
  marksheet_url VARCHAR(500),
  other_docs_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'Pending',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  amount NUMERIC(10,2),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_scholarship_status CHECK (status IN ('Pending','Under Review','Approved','Rejected'))
);

-- ============================================================
-- DONATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(15),
  email VARCHAR(255),
  amount NUMERIC(10,2) NOT NULL,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  purpose VARCHAR(255),
  status VARCHAR(20) DEFAULT 'Pending',
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  receipt_number VARCHAR(50) UNIQUE,
  donated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FORUM & COMMUNITY ISSUES
-- ============================================================
CREATE TABLE IF NOT EXISTS forum_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(15) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  occupation VARCHAR(150),
  membership_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  forum_name VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  issue_title VARCHAR(500) NOT NULL,
  issue_description TEXT NOT NULL,
  picture_url VARCHAR(500),
  contact_number VARCHAR(15),
  category VARCHAR(100),
  status VARCHAR(20) DEFAULT 'Pending',
  assigned_to UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_issue_status CHECK (status IN ('Pending','Under Review','Resolved','Closed')),
  CONSTRAINT chk_issue_category CHECK (category IN ('Culture and Heritage','Community Welfare','Women Empowerment','Youth Development','Senior Citizen Support','Education','Employment'))
);

CREATE TABLE IF NOT EXISTS issue_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID REFERENCES community_issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- YOUTH WING & WOMEN WING
-- ============================================================
CREATE TABLE IF NOT EXISTS youth_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(15),
  email VARCHAR(255),
  date_of_birth DATE,
  address TEXT,
  district VARCHAR(100),
  city VARCHAR(100),
  skills TEXT,
  interests TEXT,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS women_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(15),
  email VARCHAR(255),
  date_of_birth DATE,
  address TEXT,
  district VARCHAR(100),
  city VARCHAR(100),
  occupation VARCHAR(150),
  program_interest TEXT,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info',
  target_role VARCHAR(50),
  target_user_id UUID REFERENCES users(id),
  is_read BOOLEAN DEFAULT FALSE,
  channel VARCHAR(20) DEFAULT 'system',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100),
  entity_id VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_district ON members(district);
CREATE INDEX IF NOT EXISTS idx_members_membership_type ON members(membership_type_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(is_published);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_issues_status ON community_issues(status);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(target_user_id);

-- ============================================================
-- DEFAULT SUPER ADMIN USER
-- password: Admin@123 (bcrypt hash)
-- ============================================================
INSERT INTO users (email, password_hash, role, is_active, email_verified)
VALUES (
  'admin@sourashtra.org',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'SuperAdmin',
  TRUE,
  TRUE
) ON CONFLICT (email) DO NOTHING;
