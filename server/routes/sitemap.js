const router = require('express').Router();
const { query } = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const base = process.env.CLIENT_URL || 'https://sourashtra.org';

    const [events, news] = await Promise.all([
      query("SELECT id, updated_at FROM events WHERE is_published=TRUE ORDER BY updated_at DESC LIMIT 200"),
      query("SELECT id, updated_at FROM news WHERE is_published=TRUE ORDER BY updated_at DESC LIMIT 200"),
    ]);

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/about', priority: '0.8', changefreq: 'monthly' },
      { url: '/membership', priority: '0.9', changefreq: 'monthly' },
      { url: '/members', priority: '0.7', changefreq: 'weekly' },
      { url: '/events', priority: '0.9', changefreq: 'daily' },
      { url: '/gallery', priority: '0.7', changefreq: 'weekly' },
      { url: '/business', priority: '0.8', changefreq: 'weekly' },

      { url: '/news', priority: '0.8', changefreq: 'daily' },
      { url: '/forum', priority: '0.7', changefreq: 'weekly' },
      { url: '/donate', priority: '0.8', changefreq: 'monthly' },
      { url: '/scholarship', priority: '0.8', changefreq: 'monthly' },
      { url: '/contact', priority: '0.6', changefreq: 'monthly' },
    ];

    const urls = [
      ...staticPages.map(p => `
  <url>
    <loc>${base}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
      ...events.rows.map(r => `
  <url>
    <loc>${base}/events/${r.id}</loc>
    <lastmod>${new Date(r.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`),
      ...news.rows.map(r => `
  <url>
    <loc>${base}/news/${r.id}</loc>
    <lastmod>${new Date(r.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`),
    ];

    res.set('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
