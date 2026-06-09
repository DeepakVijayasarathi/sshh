import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';

const CATEGORIES = ['All', 'Community News', 'Emergency Announcement', 'Events', 'Education', 'Jobs'];

const News = () => {
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
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-outline'}`}>
                {c}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : news.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '3rem' }}>No news found.</div>
          ) : (
            <div className="grid grid-3">
              {news.map(n => (
                <Link key={n.id} to={`/news/${n.id}`} className="card" style={{ color: 'inherit' }}>
                  {n.image_url && <img src={n.image_url} alt={n.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />}
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="badge badge-info">{n.category}</span>
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                        {new Date(n.publish_date).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.4 }}>{n.title}</h3>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                      {n.content.substring(0, 100)}{n.content.length > 100 ? '...' : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default News;
