import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import PublicLayout from '../../components/common/PublicLayout';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import api from '../../services/api';
import useSEO from '../../hooks/useSEO';
import {
  Users, Calendar, Building2, Briefcase, GraduationCap, MessageSquare,
  Newspaper, Image, MapPin, ArrowRight, ChevronRight, Heart,
} from 'lucide-react';
import './Home.css';

const NAV = [
  { to: '/',          label: 'Home',      end: true },
  { to: '/about',     label: 'About Us'   },
  { to: '/membership',label: 'Membership' },
  { to: '/members',   label: 'Directory'  },
  { to: '/events',    label: 'Events'     },
  { to: '/gallery',   label: 'Gallery'    },
  { to: '/business',  label: 'Business'   },
  { to: '/jobs',      label: 'Jobs'       },
  { to: '/news',      label: 'News'       },
  { to: '/forum',     label: 'Forum'      },
  { to: '/contact',   label: 'Contact'    },
];

const FEATURES = [
  { icon: Users,         emoji: '👥', title: 'Membership',      desc: 'Join the community and connect with members across Tamil Nadu.',    link: '/membership',  color: '#8B0000', bg: 'rgba(139,0,0,0.08)'  },
  { icon: Calendar,      emoji: '📅', title: 'Events',          desc: 'Cultural, educational and community events throughout the year.',    link: '/events',      color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
  { icon: Building2,     emoji: '🏢', title: 'Businesses',      desc: 'Discover Sourashtra-owned businesses in your area.',                link: '/business',    color: '#059669', bg: 'rgba(5,150,105,0.08)' },
  { icon: Briefcase,     emoji: '💼', title: 'Jobs',            desc: 'Career opportunities and job resources within the community.',       link: '/jobs',        color: '#7c3aed', bg: 'rgba(124,58,237,0.08)'},
  { icon: GraduationCap, emoji: '🎓', title: 'Scholarships',    desc: 'Educational support and scholarships for deserving students.',      link: '/scholarship', color: '#0891b2', bg: 'rgba(8,145,178,0.08)' },
  { icon: MessageSquare, emoji: '💬', title: 'Forum',           desc: 'Raise issues, share ideas, engage in community discussions.',       link: '/forum',       color: '#d97706', bg: 'rgba(217,119,6,0.08)'  },
];

const FILLERS = [
  { icon: '🕌', title: 'Cultural Heritage',   text: 'Preserving Sourashtra customs, traditions, language and arts passed down through generations across Tamil Nadu.' },
  { icon: '📚', title: 'Literary Archive',    text: 'Documenting and publishing classical Sourashtra literature, folk songs and historical manuscripts.' },
  { icon: '🤝', title: 'Community Welfare',   text: 'Running welfare schemes, flood relief, health camps, and support programs for community members in need.' },
  { icon: '🎵', title: 'Arts & Music',        text: 'Promoting traditional Sourashtra music, dance and classical arts through workshops and festivals.' },
];

export default function Home() {
  const settings  = useSiteSettings();
  const siteName  = settings.site_name    || 'Sourashtra Community Portal';
  const siteTag   = settings.site_tagline || 'Connecting Our Community, Preserving Our Heritage';

  useSEO({
    title: 'Home',
    description: `Welcome to ${siteName} — connecting members through events, news, business directory, jobs and more.`,
  });

  const [events,    setEvents]    = useState([]);
  const [news,      setNews]      = useState([]);
  const [liveStats, setLiveStats] = useState(null);

  useEffect(() => {
    api.get('/events?upcoming=true&limit=4').then(r => setEvents(r.data.data || [])).catch(() => {});
    api.get('/news?limit=4&featured=true').then(r => setNews(r.data.data || [])).catch(() => {});
    api.get('/dashboard/public-stats').then(r => setLiveStats(r.data)).catch(() => {});
  }, []);

  const STATS = liveStats ? [
    { num: liveStats.totalMembers    + '+', label: 'Members'    },
    { num: liveStats.totalEvents     + '+', label: 'Events'     },
    { num: liveStats.totalBusinesses + '+', label: 'Businesses' },
    { num: liveStats.totalDistricts,        label: 'Districts'  },
  ] : [
    { num: '—', label: 'Members'    },
    { num: '—', label: 'Events'     },
    { num: '—', label: 'Businesses' },
    { num: '—', label: 'Districts'  },
  ];

  return (
    <PublicLayout>
      <div className="bento-page">
        <div className="bento-grid">

          {/* ── Logo ─────────────────────────────────────── */}
          <div className="b-card b-logo" style={{ gridColumn: 1, gridRow: '1/3' }}>
            <div className="logo-circle">
              {settings.logo_url
                ? <img src={settings.logo_url} alt={siteName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <span>{siteName.slice(0, 2).toUpperCase()}</span>
              }
            </div>
            <div className="logo-name">{siteName}</div>
            <div className="logo-sub">Est. Since Ancient Times</div>
          </div>

          {/* ── Heading ──────────────────────────────────── */}
          <div className="b-card b-heading" style={{ gridColumn: '2/5', gridRow: 1 }}>
            <h1>{siteName.toUpperCase()}</h1>
            <div className="tagline">{siteTag.toUpperCase()}</div>
          </div>

          {/* ── Live Stats ───────────────────────────────── */}
          <div className="b-card b-stats" style={{ gridColumn: 5, gridRow: '1/4' }}>
            {STATS.map(s => (
              <div key={s.label} className="b-stat-item">
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Nav ──────────────────────────────────────── */}
          <div className="b-nav" style={{ gridColumn: '2/5', gridRow: 2 }}>
            <span className="b-slogan">Bridging Traditions · Building Futures</span>
            <div className="b-nav-links">
              {NAV.map(n => (
                <NavLink key={n.to} to={n.to} end={n.end}
                  className={({ isActive }) => isActive ? 'active' : ''}>
                  {n.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* ── Hero text ────────────────────────────────── */}
          <div className="b-card b-hero" style={{ gridColumn: '1/4', gridRow: 3 }}>
            <p>
              A digital platform for the Sourashtra community to connect, celebrate and collaborate.
              Manage memberships, events, businesses and more — all in one place.
            </p>
            <div className="b-hero-btns">
              <Link to="/membership" className="btn btn-sm"
                style={{ background: 'var(--secondary,#D4AF37)', color: '#1a1a1a', fontWeight: 700 }}>
                Become a Member
              </Link>
              <Link to="/about" className="btn btn-sm"
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }}>
                Learn More <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* ── Feature tiles ────────────────────────────── */}
          <div className="b-features" style={{ gridColumn: '1/5', gridRow: 4 }}>
            {FEATURES.map(f => (
              <Link key={f.title} to={f.link} className="b-feat">
                <div className="b-feat-icon" style={{ background: f.bg, color: f.color }}>
                  {f.emoji}
                </div>
                <div className="b-feat-title">{f.title}</div>
                <p className="b-feat-desc">{f.desc}</p>
                <span className="b-feat-link">Explore <ChevronRight size={11} /></span>
              </Link>
            ))}
          </div>

          {/* ── News (right tall card, rows 4-5) ─────────── */}
          <div className="b-card b-news" style={{ gridColumn: '4/6', gridRow: '4/6' }}>
            <div className="b-section-title">
              Latest News
              <Link to="/news">View all →</Link>
            </div>
            {news.length === 0
              ? <p style={{ fontSize: '0.8rem', color: '#9ca3af', padding: '1rem 0' }}>No news yet.</p>
              : news.map(n => (
                <Link key={n.id} to={`/news/${n.id}`} className="b-news-item">
                  <div className="b-news-img">
                    {n.image_url
                      ? <img src={n.image_url} alt={n.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                      : <Newspaper size={20} />
                    }
                  </div>
                  <div className="b-news-info">
                    <div className="cat">{n.category}</div>
                    <h4>{n.title.length > 65 ? n.title.slice(0, 65) + '…' : n.title}</h4>
                  </div>
                </Link>
              ))
            }
          </div>

          {/* ── Upcoming Events ──────────────────────────── */}
          <div className="b-card b-events" style={{ gridColumn: '1/4', gridRow: 5 }}>
            <div className="b-section-title">
              Upcoming Events
              <Link to="/events">View all →</Link>
            </div>
            {events.length === 0
              ? <p style={{ fontSize: '0.8rem', color: '#9ca3af', padding: '1rem 0' }}>No upcoming events.</p>
              : events.map(ev => {
                const d = new Date(ev.event_date);
                return (
                  <Link key={ev.id} to={`/events/${ev.id}`} className="b-event-item">
                    <div className="b-event-date">
                      <span className="day">{d.getDate()}</span>
                      <span>{d.toLocaleString('en-IN', { month: 'short' }).toUpperCase()}</span>
                    </div>
                    <div className="b-event-info">
                      <h4>{ev.title}</h4>
                      <p>{ev.venue && <><MapPin size={10} style={{ marginRight: 3 }} />{ev.venue}</>}</p>
                    </div>
                  </Link>
                );
              })
            }
          </div>

          {/* ── Join column ──────────────────────────────── */}
          <div className="b-join" style={{ gridColumn: 5, gridRow: '4/8' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🙏</div>
            <h3>Join Our Community</h3>
            <p>Become a member and enjoy exclusive benefits, events & networking.</p>
            <Link to="/register" className="btn btn-sm"
              style={{ background: 'var(--secondary,#D4AF37)', color: '#1a1a1a', fontWeight: 700, width: '100%', justifyContent: 'center' }}>
              Register Now
            </Link>
            <Link to="/login" className="btn btn-sm"
              style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', width: '100%', justifyContent: 'center' }}>
              Login
            </Link>
            <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.875rem', width: '100%', textAlign: 'center' }}>
              <Link to="/donate" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Heart size={11} /> Support Us
              </Link>
            </div>
          </div>

          {/* ── Filler cards row ─────────────────────────── */}
          <div className="b-filler-row" style={{ gridColumn: '1/5', gridRow: 6, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {FILLERS.map(f => (
              <div key={f.title} className="b-filler">
                <div className="b-filler-icon">{f.icon}</div>
                <div className="b-filler-title">{f.title}</div>
                <p className="b-filler-text">{f.text}</p>
              </div>
            ))}
          </div>

          {/* ── CTA bar ──────────────────────────────────── */}
          <div className="b-cta" style={{ gridColumn: '1/5', gridRow: 7 }}>
            <div className="b-cta-text">
              <h3>Become Part of Our Heritage</h3>
              <p>Join thousands of Sourashtra members — connect, celebrate and collaborate.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/membership" className="btn"
                style={{ background: 'var(--secondary,#D4AF37)', color: '#1a1a1a', fontWeight: 700 }}>
                Become a Member
              </Link>
              <Link to="/donate" className="btn"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                Donate
              </Link>
            </div>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
}
