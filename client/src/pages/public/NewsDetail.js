import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';

const NewsDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/news/${id}`).then(r => setArticle(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PublicLayout><div className="loading-center"><div className="spinner" /></div></PublicLayout>;
  if (!article) return <PublicLayout><div className="text-center" style={{ padding: '3rem' }}>Article not found. <Link to="/news">Back to News</Link></div></PublicLayout>;

  return (
    <PublicLayout>
      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          <Link to="/news" className="btn btn-outline btn-sm mb-4">← Back to News</Link>
          {article.image_url && (
            <img src={article.image_url} alt={article.title} style={{ width: '100%', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', maxHeight: 400, objectFit: 'cover' }} />
          )}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="badge badge-info">{article.category}</span>
            <span className="text-muted" style={{ fontSize: '0.875rem' }}>
              {new Date(article.publish_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${article.title} — ${window.location.href}`)}`, '_blank')}
              style={{ marginLeft: 'auto', background: '#25D366', color: 'white', border: 'none', borderRadius: 8, padding: '0.4rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Share on WhatsApp
            </button>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontFamily: "'Playfair Display', serif", marginBottom: '1.5rem', lineHeight: 1.3 }}>{article.title}</h1>
          {article.video_url && (
            <div style={{ marginBottom: '1.5rem' }}>
              <video controls style={{ width: '100%', borderRadius: 'var(--radius)' }}>
                <source src={article.video_url} />
              </video>
            </div>
          )}
          <div style={{ lineHeight: 1.8, color: 'var(--text-medium)', whiteSpace: 'pre-wrap' }}>{article.content}</div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default NewsDetail;
