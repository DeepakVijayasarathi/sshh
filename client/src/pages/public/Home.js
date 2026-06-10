import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/common/PublicLayout';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import api from '../../services/api';
import useSEO from '../../hooks/useSEO';
import {
  Users, Calendar, Building2, Briefcase, GraduationCap, MessageSquare,
  ArrowRight, MapPin, Clock, ChevronRight,
} from 'lucide-react';

/* ─── Feature Card ─────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, desc, link, color, bg }) => (
  <Link
    to={link}
    style={{ textDecoration: 'none', display: 'block' }}
  >
    <div
      style={{
        background: 'white', border: '1.5px solid #f1f5f9', borderRadius: 16,
        padding: '1.75rem', transition: 'all 0.25s', cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--primary)';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px -6px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#f1f5f9';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
        <Icon size={22} style={{ color }} />
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '0.375rem' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: '#9ca3af', lineHeight: 1.65, marginBottom: '1rem', margin: 0 }}>{desc}</p>
      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: '0.875rem', marginBottom: 0 }}>
        Explore <ArrowRight size={13} />
      </p>
    </div>
  </Link>
);

/* ─── Event Card ────────────────────────────────────────── */
const EventCard = ({ event }) => (
  <Link to={`/events/${event.id}`} style={{ textDecoration: 'none', display: 'block' }}>
    <div
      style={{ background: 'white', borderRadius: 14, overflow: 'hidden', border: '1px solid #f1f5f9', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {event.banner_image_url ? (
        <img src={event.banner_image_url} alt={event.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: 160, background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Calendar size={40} style={{ color: 'rgba(255,255,255,0.4)' }} />
        </div>
      )}
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.2rem 0.625rem', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 600, background: 'var(--primary)', color: 'white' }}>
            <Calendar size={11} /> {new Date(event.event_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </span>
        </div>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827', marginBottom: '0.25rem', lineHeight: 1.4 }}>{event.title}</h3>
        {event.venue && (
          <p style={{ fontSize: '0.8125rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, marginBottom: 0 }}>
            <MapPin size={12} /> {event.venue}
          </p>
        )}
      </div>
    </div>
  </Link>
);

/* ─── News Card ─────────────────────────────────────────── */
const NewsCard = ({ article }) => (
  <Link to={`/news/${article.id}`} style={{ textDecoration: 'none', display: 'block' }}>
    <div
      style={{ background: 'white', borderRadius: 14, overflow: 'hidden', border: '1px solid #f1f5f9', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {article.image_url ? (
        <img src={article.image_url} alt={article.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: 160, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={22} style={{ color: '#9ca3af' }} />
          </div>
        </div>
      )}
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ padding: '0.2rem 0.5rem', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 600, background: '#eff6ff', color: '#3b82f6' }}>
            {article.category}
          </span>
        </div>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827', lineHeight: 1.4, marginBottom: '0.375rem' }}>
          {article.title.length > 60 ? article.title.slice(0, 60) + '…' : article.title}
        </h3>
        <p style={{ fontSize: '0.8125rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, marginBottom: 0 }}>
          <Clock size={12} /> {new Date(article.publish_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      </div>
    </div>
  </Link>
);

/* ─── Section Header ────────────────────────────────────── */
const SectionHeader = ({ title, subtitle, link, linkLabel = 'View All' }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
    <div>
      <h2 style={{ fontSize: '1.625rem', fontWeight: 700, fontFamily: '"Playfair Display", serif', color: 'var(--primary)', margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: '0.9375rem', color: '#9ca3af', marginTop: '0.375rem', marginBottom: 0 }}>{subtitle}</p>}
    </div>
    {link && (
      <Link to={link} className="btn btn-sm btn-outline" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
        {linkLabel} <ChevronRight size={14} />
      </Link>
    )}
  </div>
);

/* ─── Home ──────────────────────────────────────────────── */
const Home = () => {
  const settings = useSiteSettings();
  const siteName = settings.site_name || 'Sourashtra Community';

  useSEO({
    title: 'Home',
    description: `Welcome to ${siteName} Portal — connecting members through events, news, business directory, jobs and more.`,
  });

  const [events,     setEvents]     = useState([]);
  const [news,       setNews]       = useState([]);
  const [liveStats,  setLiveStats]  = useState(null);

  useEffect(() => {
    api.get('/events?upcoming=true&limit=3').then(r => setEvents(r.data.data || [])).catch(() => {});
    api.get('/news?limit=3&featured=true').then(r => setNews(r.data.data || [])).catch(() => {});
    api.get('/dashboard/public-stats').then(r => setLiveStats(r.data)).catch(() => {});
  }, []);

  const features = [
    { icon: Users,         title: 'Membership',         color: '#8B0000', bg: 'rgba(139,0,0,0.08)',  desc: 'Join our growing community of Sourashtra members across Tamil Nadu and beyond.',     link: '/membership' },
    { icon: Calendar,      title: 'Events',             color: '#2563eb', bg: 'rgba(37,99,235,0.08)', desc: 'Participate in cultural, educational and community events throughout the year.',      link: '/events' },
    { icon: Building2,     title: 'Business Directory', color: '#059669', bg: 'rgba(5,150,105,0.08)', desc: 'Discover and connect with Sourashtra-owned businesses in your area.',               link: '/business' },
    { icon: Briefcase,     title: 'Jobs Portal',        color: '#7c3aed', bg: 'rgba(124,58,237,0.08)',desc: 'Find job opportunities and career resources within the community.',                  link: '/jobs' },
    { icon: GraduationCap, title: 'Scholarships',       color: '#0891b2', bg: 'rgba(8,145,178,0.08)', desc: 'Apply for scholarships and educational support for deserving students.',             link: '/scholarship' },
    { icon: MessageSquare, title: 'Community Forum',    color: '#d97706', bg: 'rgba(217,119,6,0.08)', desc: 'Raise issues, share ideas, and engage in meaningful community discussions.',         link: '/forum' },
  ];

  const stats = liveStats ? [
    { num: liveStats.totalMembers.toLocaleString() + '+',    label: 'Members'    },
    { num: liveStats.totalEvents.toLocaleString() + '+',     label: 'Events'     },
    { num: liveStats.totalBusinesses.toLocaleString() + '+', label: 'Businesses' },
    { num: liveStats.totalDistricts.toString(),              label: 'Districts'  },
  ] : [
    { num: '—', label: 'Members'    },
    { num: '—', label: 'Events'     },
    { num: '—', label: 'Businesses' },
    { num: '—', label: 'Districts'  },
  ];

  return (
    <PublicLayout>

      {/* ── Hero ──────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #4a0000 100%)',
        color: 'white',
        padding: '5rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: -80, right: -80, width: 400, height: 400,
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -100, left: -60, width: 300, height: 300,
          borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' }}>

            {/* Left content */}
            <div style={{ flex: '1 1 400px', maxWidth: 580 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 999, padding: '0.375rem 1rem', fontSize: '0.8125rem',
                marginBottom: '1.5rem', backdropFilter: 'blur(8px)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--secondary)' }} />
                Welcome to {siteName}
              </div>

              <h1 style={{
                fontSize: 'clamp(1.875rem, 4vw, 2.75rem)', fontFamily: '"Playfair Display", serif',
                fontWeight: 700, lineHeight: 1.2, marginBottom: '1.25rem',
              }}>
                Connecting Our Community,{' '}
                <span style={{ color: 'var(--secondary)' }}>Preserving Our Heritage</span>
              </h1>

              <p style={{ fontSize: '1.0625rem', opacity: 0.85, lineHeight: 1.75, marginBottom: '2rem', maxWidth: 500 }}>
                {settings.site_tagline || `A digital platform for ${siteName} to connect, celebrate and collaborate. Manage memberships, events, businesses and more — all in one place.`}
              </p>

              <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                <Link to="/membership" className="btn btn-lg" style={{ background: 'var(--secondary)', color: '#1a1a1a', fontWeight: 700 }}>
                  Become a Member
                </Link>
                <Link to="/about" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)' }}>
                  Learn More <ArrowRight size={17} />
                </Link>
              </div>
            </div>

            {/* Right stats grid */}
            <div style={{ flex: '0 0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                {stats.map(s => (
                  <div key={s.label} style={{
                    background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: 14, padding: '1.25rem 1.5rem', textAlign: 'center',
                    backdropFilter: 'blur(8px)', minWidth: 110,
                  }}>
                    <p style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--secondary)', fontFamily: '"Playfair Display", serif', lineHeight: 1, marginBottom: '0.25rem' }}>
                      {s.num}
                    </p>
                    <p style={{ fontSize: '0.8125rem', opacity: 0.8, margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────── */}
      <section style={{ background: 'white', padding: '5rem 1.5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.5rem' }}>
              Our Services
            </p>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, fontFamily: '"Playfair Display", serif', color: '#111827', margin: '0 0 0.75rem' }}>
              Everything You Need
            </h2>
            <p style={{ fontSize: '1rem', color: '#9ca3af', maxWidth: 520, margin: '0 auto' }}>
              Stay connected with the Sourashtra community through our comprehensive suite of services
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── Upcoming Events ───────────────────────────── */}
      {events.length > 0 && (
        <section style={{ background: '#f8fafc', padding: '5rem 1.5rem' }}>
          <div className="container">
            <SectionHeader
              title="Upcoming Events"
              subtitle="Don't miss out on our community events and programs"
              link="/events"
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {events.map(ev => <EventCard key={ev.id} event={ev} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Latest News ───────────────────────────────── */}
      {news.length > 0 && (
        <section style={{ background: 'white', padding: '5rem 1.5rem' }}>
          <div className="container">
            <SectionHeader
              title="Latest News"
              subtitle="Stay updated with news and announcements from the community"
              link="/news"
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {news.map(n => <NewsCard key={n.id} article={n} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Section ───────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #4a0000 100%)',
        padding: '5rem 1.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
          width: 500, height: 500, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)', pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: '0.75rem' }}>
            Join Us Today
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontFamily: '"Playfair Display", serif', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
            Become Part of Our Community
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 2.5rem' }}>
            Join thousands of Sourashtra community members and enjoy exclusive benefits, networking opportunities, and community support.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-lg" style={{ background: 'var(--secondary)', color: '#1a1a1a', fontWeight: 700 }}>
              Register Now
            </Link>
            <Link to="/donate" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)' }}>
              Support Us
            </Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
};

export default Home;
