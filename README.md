# Sourashtra Community Portal

A full-stack web application for managing the Sourashtra community — members, events, news, gallery, business directory, jobs, scholarships, donations, and community forums.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router 6, Recharts |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| File Storage | Local disk (Multer) |
| Email | Nodemailer (SMTP) |
| Reports | ExcelJS |

## Project Structure

```
sourashtra-community-portal/
├── server/                   # Node.js + Express API
│   ├── config/               # DB + Multer config
│   ├── controllers/          # Business logic
│   ├── middleware/            # Auth middleware
│   ├── routes/               # API routes
│   ├── utils/                # Email, pagination helpers
│   ├── uploads/              # Uploaded files (auto-created)
│   └── server.js             # Entry point
├── client/                   # React frontend
│   └── src/
│       ├── components/       # Reusable components (Navbar, Footer, AdminLayout)
│       ├── context/          # AuthContext
│       ├── pages/
│       │   ├── public/       # Home, Events, Gallery, Jobs, Forum, etc.
│       │   └── admin/        # Dashboard, Members, Events, News, etc.
│       └── services/         # Axios API client
└── database/
    └── schema.sql            # PostgreSQL schema
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Create the database

```sql
CREATE DATABASE sourashtra_db;
```

### 2. Setup backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials and SMTP settings
```

Run database migration:
```bash
node ../database/migrate.js
```

Start server:
```bash
npm run dev
```

### 3. Setup frontend

```bash
cd client
npm install
npm start
```

The app will open at **http://localhost:3000**

## Default Admin Credentials

```
Email: admin@sourashtra.org
Password: password
```

> Change these immediately in production!

## API Endpoints

| Module | Base URL |
|--------|----------|
| Auth | `/api/auth` |
| Members | `/api/members` |
| Events | `/api/events` |
| News | `/api/news` |
| Gallery | `/api/gallery` |
| Businesses | `/api/businesses` |
| Jobs | `/api/jobs` |
| Scholarships | `/api/scholarships` |
| Donations | `/api/donations` |
| Forums | `/api/forums` |
| Dashboard | `/api/dashboard` |
| Reports | `/api/reports` |

## User Roles

| Role | Access |
|------|--------|
| SuperAdmin | Full system access |
| Admin | All management features |
| Member | Member portal features |
| BusinessOwner | Business directory |
| Employer | Job portal |
| Student | Education support |
| Guest | Public pages |

## Features

### Public Website
- Home page with stats and featured content
- About Us
- Membership registration and plans
- Member directory (login required)
- Events listing and detail with registration
- Photo/video gallery with lightbox
- Business directory with search
- Jobs portal with application form
- Community forum with issue reporting
- News & announcements
- Scholarship application
- Donation portal
- Contact page

### Admin Dashboard
- Overview stats with charts (Recharts)
- Member management with approval workflow
- Event management (create, edit, publish)
- News management (create, categories, featured)
- Gallery management (albums + photo upload)
- Business directory management
- Job management with application viewer
- Scholarship application review
- Donation tracking
- Community forum / issue management
- Reports with Excel export

## Environment Variables

See `server/.env.example` for all required variables.
