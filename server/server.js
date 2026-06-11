require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

// Trust the nginx reverse proxy sitting in front of us.
// Required so express-rate-limit reads the real client IP from X-Forwarded-For.
app.set('trust proxy', 1);

// Security & utilities
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many requests, please try again later' },
}));
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/members', require('./routes/members'));
app.use('/api/events', require('./routes/events'));
app.use('/api/news', require('./routes/news'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/businesses', require('./routes/businesses'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/scholarships', require('./routes/scholarships'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/forums', require('./routes/forums'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/youth', require('./routes/youth'));
app.use('/api/women', require('./routes/women'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/team',     require('./routes/team'));
app.use('/sitemap.xml', require('./routes/sitemap'));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const { pool } = require('./config/database');
    await pool.query('SELECT 1');
    res.json({ status: 'OK', db: 'connected', timestamp: new Date() });
  } catch (err) {
    // Always 200 so Docker health check passes; db field shows the real state
    res.json({ status: 'OK', db: 'error', error: err.message, timestamp: new Date() });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sourashtra Community Portal API running on port ${PORT}`);
});

module.exports = app;
