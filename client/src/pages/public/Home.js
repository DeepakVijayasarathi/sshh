import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';
import useSEO from '../../hooks/useSEO';
import './Home.css';

const StatCard = ({ number, label }) => (
  <div className="stat-card">
    <div className="stat-number">{number}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const FeatureCard = ({ icon, title, desc, link }) => (
  <Link to={link} className="feature-card">
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </Link>
);

const Home = () => {
  useSEO({
    title: 'Home',
    description: 'Welcome to the Sourashtra Community Portal — connecting members through events, news, business directory, jobs and more.',
  });
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    api.get('/events?upcoming=true&limit=3').then(r => setEvents(r.data.data || [])).catch(() => {});
    api.get('/news?limit=3&featured=true').then(r => setNews(r.data.data || [])).catch(() => {});
  }, []);

  const features = [
    { icon: '👥', title: 'Membership', desc: 'Join our growing community of Sourashtra members across Tamil Nadu and beyond.', link: '/membership' },
    { icon: '📅', title: 'Events', desc: 'Participate in cultural, educational and community events organised throughout the year.', link: '/events' },
    { icon: '🏢', title: 'Business Directory', desc: 'Discover and connect with Sourashtra-owned businesses in your area.', link: '/business' },
    { icon: '💼', title: 'Jobs Portal', desc: 'Find job opportunities and career resources within the community.', link: '/jobs' },
    { icon: '🎓', title: 'Scholarships', desc: 'Apply for scholarships and educational support for deserving students.', link: '/scholarship' },
    { icon: '💬', title: 'Community Forum', desc: 'Raise issues, share ideas, and engage in community discussions.', link: '/forum' },
  ];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">Welcome to the Sourashtra Community</div>
          <h1>Connecting Our Community, <span>Preserving Our Heritage</span></h1>
          <p>A digital platform for the Sourashtra community to connect, celebrate and collaborate. Manage memberships, events, businesses and more — all in one place.</p>
          <div className="hero-actions">
            <Link to="/membership" className="btn btn-primary btn-lg">Become a Member</Link>
            <Link to="/about" className="btn btn-outline btn-lg">Learn More</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card-grid">
            {['Members', 'Events', 'Businesses', 'Districts'].map((label, i) => (
              <div key={label} className="hero-stat">
                <div className="hero-stat-num">{['2,500+', '100+', '350+', '32'][i]}</div>
                <div className="hero-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="section-title" style={{ textAlign: 'center' }}>Our Services</h2>
            <p className="section-subtitle">Everything you need to stay connected with the Sourashtra community</p>
          </div>
          <div className="grid grid-3">
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {events.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="section-title">Upcoming Events</h2>
                <p className="section-subtitle" style={{ marginBottom: 0 }}>Don't miss out on our community events</p>
              </div>
              <Link to="/events" className="btn btn-outline">View All</Link>
            </div>
            <div className="grid grid-3">
              {events.map(ev => (
                <Link key={ev.id} to={`/events/${ev.id}`} className="event-card card">
                  {ev.banner_image_url && <img src={ev.banner_image_url} alt={ev.title} className="event-card-img" />}
                  <div className="card-body">
                    <div className="event-date-badge">
                      {new Date(ev.event_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                    <h3 className="event-title">{ev.title}</h3>
                    <p className="text-muted">{ev.venue}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest News */}
      {news.length > 0 && (
        <section className="section bg-white">
          <div className="container">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="section-title">Latest News</h2>
                <p className="section-subtitle" style={{ marginBottom: 0 }}>Stay updated with community news</p>
              </div>
              <Link to="/news" className="btn btn-outline">View All</Link>
            </div>
            <div className="grid grid-3">
              {news.map(n => (
                <Link key={n.id} to={`/news/${n.id}`} className="news-card card">
                  {n.image_url && <img src={n.image_url} alt={n.title} className="news-card-img" />}
                  <div className="card-body">
                    <span className="badge badge-info mb-2">{n.category}</span>
                    <h3 className="news-title">{n.title}</h3>
                    <p className="text-muted">{new Date(n.publish_date).toLocaleDateString('en-IN')}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="cta-section">
        <div className="container text-center">
          <h2>Join the Sourashtra Community Today</h2>
          <p>Become a member and enjoy exclusive benefits, networking opportunities, and community support.</p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-secondary btn-lg">Register Now</Link>
            <Link to="/donate" className="btn btn-outline btn-lg" style={{ borderColor: 'white', color: 'white' }}>Support Us</Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Home;
