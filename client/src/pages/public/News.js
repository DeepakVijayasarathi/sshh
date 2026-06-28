import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ChevronRight, AlertTriangle, GraduationCap, CalendarDays, Users, Share2 } from 'lucide-react';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';
import useSEO from '../../hooks/useSEO';

const CATEGORIES = ['All', 'Community News', 'Emergency Announcement', 'Events', 'Education'];

const CAT_CONFIG = {
  'Community News':         { bg: '#dbeafe', color: '#1d4ed8', Icon: Users },
  'Emergency Announcement': { bg: '#fee2e2', color: '#b91c1c', Icon: AlertTriangle },
  'Events':                 { bg: '#fef3c7', color: '#b45309', Icon: CalendarDays },
  'Education':              { bg: '#dcfce7', color: '#15803d', Icon: GraduationCap },

};

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const shareNewsWhatsApp = (n, e) => {
  e.preventDefault();
  e.stopPropagation();
  const date = new Date(n.publish_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const text = `📰 *${n.title}*\n🗓 ${date}${n.category ? ` | ${n.category}` : ''}\n${n.content ? `\n${n.content.slice(0, 150)}…\n` : ''}\n🔗 ${window.location.origin}/news/${n.id}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
};

const NewsCard = ({ n }) => {
  const cfg = CAT_CONFIG[n.category] || { bg: '#f1f5f9', color: '#475569', Icon: Newspaper };
  return (
    <Link to={`/news/${n.id}`} className="news-card">
      {n.image_url ? (
        <div className="news-img-wrap">
          <img src={n.image_url} alt={n.title} className="news-img" />
          <span className="news-cat-badge" style={{ background: cfg.bg, color: cfg.color }}>
            <cfg.Icon size={10} /> {n.category}
          </span>
        </div>
      ) : (
        <div className="news-no-img" style={{ background: `linear-gradient(135deg, ${cfg.color}22 0%, ${cfg.color}08 100%)`, borderBottom: `3px solid ${cfg.color}` }}>
          <div className="news-no-img-icon" style={{ background: cfg.bg, color: cfg.color }}>
            <cfg.Icon size={22} strokeWidth={1.5} />
          </div>
          <span className="news-cat-badge news-cat-badge--inline" style={{ background: cfg.bg, color: cfg.color }}>
            <cfg.Icon size={10} /> {n.category}
          </span>
        </div>
      )}
      <div className="news-body">
        <div className="news-date">{formatDate(n.publish_date)}</div>
        <h3 className="news-title">{n.title}</h3>
        <p className="news-excerpt">
          {n.content.substring(0, 110)}{n.content.length > 110 ? '…' : ''}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.875rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
          <span className="news-read-more" style={{ margin: 0, padding: 0, border: 'none' }}>Read More <ChevronRight size={13} /></span>
          <button
            onClick={(e) => shareNewsWhatsApp(n, e)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#25D366', color: 'white', border: 'none', borderRadius: 6, padding: '0.25rem 0.625rem', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
          >
            <Share2 size={11} /> Share
          </button>
        </div>
      </div>
    </Link>
  );
};

const News = () => {
  useSEO({ title: 'News', description: 'Latest community news, announcements and updates from Sourashtra Community Portal.' });
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    setLoading(true);
    const url = category === 'All' ? '/news?limit=20' : `/news?category=${encodeURIComponent(category)}&limit=20`;
    api.get(url).then(r => setNews(r.data.data || [])).catch(() => setNews([])).finally(() => setLoading(false));
  }, [category]);

  return (
    <PublicLayout>
      <div className="page-header">
        <div className="container">
          <h1>News & Announcements</h1>
          <p>Stay informed with the latest from the Sourashtra community</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="news-filter-bar">
            {CATEGORIES.map(c => {
              const cfg = CAT_CONFIG[c];
              return (
                <button key={c} onClick={() => setCategory(c)}
                  className={`news-filter-btn ${category === c ? 'active' : ''}`}
                  style={category === c && cfg ? { background: cfg.color, borderColor: cfg.color, color: '#fff' } : {}}>
                  {cfg && <cfg.Icon size={12} />} {c}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : news.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '3rem' }}>No news found.</div>
          ) : (
            <div className="news-grid">
              {news.map(n => <NewsCard key={n.id} n={n} />)}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .news-filter-bar {
          display: flex; flex-wrap: wrap; gap: 0.5rem;
          margin-bottom: 2rem;
        }
        .news-filter-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 0.375rem 0.875rem; border-radius: 20px;
          border: 1.5px solid #e2e8f0; background: #fff;
          font-size: 0.8rem; font-weight: 500; color: #64748b;
          cursor: pointer; transition: all 0.15s;
        }
        .news-filter-btn:hover { border-color: var(--primary,#8B0000); color: var(--primary,#8B0000); }
        .news-filter-btn.active { background: var(--primary,#8B0000); border-color: var(--primary,#8B0000); color: #fff; }

        .news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .news-card {
          display: flex; flex-direction: column;
          background: #fff; border-radius: 14px;
          border: 1.5px solid #f1f5f9;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          text-decoration: none; color: inherit;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .news-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
          border-color: var(--primary,#8B0000);
        }

        .news-img-wrap { position: relative; height: 180px; overflow: hidden; }
        .news-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
        .news-card:hover .news-img { transform: scale(1.04); }

        .news-cat-badge {
          position: absolute; top: 10px; left: 10px;
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.06em; padding: 3px 9px; border-radius: 20px;
        }

        .news-no-img {
          height: 120px;
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .news-no-img-icon {
          width: 56px; height: 56px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .news-cat-badge--inline {
          position: absolute; bottom: 10px; left: 10px;
        }

        .news-body { padding: 1rem 1.125rem; display: flex; flex-direction: column; flex: 1; }
        .news-date { font-size: 0.72rem; color: #94a3b8; margin-bottom: 0.375rem; }
        .news-title {
          font-size: 0.9875rem; font-weight: 700; color: #0f172a;
          margin: 0 0 0.5rem; line-height: 1.45;
        }
        .news-excerpt {
          font-size: 0.8rem; color: #64748b;
          line-height: 1.6; margin: 0; flex: 1;
        }
        .news-read-more {
          display: inline-flex; align-items: center; gap: 3px;
          margin-top: 0.875rem; padding-top: 0.75rem;
          border-top: 1px solid #f1f5f9;
          font-size: 0.8rem; font-weight: 600;
          color: var(--primary,#8B0000);
          transition: gap 0.15s;
        }
        .news-card:hover .news-read-more { gap: 6px; }
      `}</style>
    </PublicLayout>
  );
};

export default News;
