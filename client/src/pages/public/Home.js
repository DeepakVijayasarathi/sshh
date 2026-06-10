import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/common/PublicLayout';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import api from '../../services/api';
import useSEO from '../../hooks/useSEO';
import {
  Users, Calendar, Building2, Briefcase, GraduationCap, MessageSquare,
  Landmark, BookOpen, Heart, Music, Globe, Target, FileText,
  Palette, Award, Newspaper, UserPlus, Activity, MapPin,
  ArrowRight, ChevronRight, Camera, Image as ImageIcon,
  HandCoins, BookMarked, Stethoscope, University, BadgeCheck,
} from 'lucide-react';
import './Home.css';

const FEATURES = [
  { Icon: Users,         title: 'Membership',   desc: 'Join and connect with members across Tamil Nadu.',        link: '/membership',  color: '#8B0000', bg: 'rgba(139,0,0,0.09)'   },
  { Icon: Calendar,      title: 'Events',        desc: 'Cultural, educational & community events year-round.',    link: '/events',      color: '#2563eb', bg: 'rgba(37,99,235,0.09)'  },
  { Icon: Building2,     title: 'Businesses',    desc: 'Discover Sourashtra-owned businesses near you.',          link: '/business',    color: '#059669', bg: 'rgba(5,150,105,0.09)'  },
  { Icon: Briefcase,     title: 'Jobs',          desc: 'Career opportunities within the community.',              link: '/jobs',        color: '#7c3aed', bg: 'rgba(124,58,237,0.09)' },
  { Icon: GraduationCap, title: 'Scholarships',  desc: 'Educational support for deserving students.',            link: '/scholarship', color: '#0891b2', bg: 'rgba(8,145,178,0.09)'  },
  { Icon: MessageSquare, title: 'Forum',         desc: 'Raise issues, share ideas, discuss & collaborate.',      link: '/forum',       color: '#d97706', bg: 'rgba(217,119,6,0.09)'   },
];

const FILLERS = [
  { Icon: Landmark,   color: '#8B0000', bg: 'rgba(139,0,0,0.08)',   title: 'Cultural Heritage', text: 'Preserving Sourashtra customs, traditions and language passed down through generations.' },
  { Icon: BookOpen,   color: '#2563eb', bg: 'rgba(37,99,235,0.08)',  title: 'Literary Archive',  text: 'Documenting classical Sourashtra literature, folk songs and historical manuscripts.'     },
  { Icon: Heart,      color: '#e11d48', bg: 'rgba(225,29,72,0.08)',  title: 'Community Welfare', text: 'Running welfare schemes, health camps and support programs for members in need.'         },
  { Icon: Music,      color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', title: 'Arts & Music',      text: 'Promoting traditional music, dance and classical arts through workshops and festivals.'  },
];

const ABOUT_CARDS = [
  { Icon: Landmark,    color: '#8B0000', bg: 'rgba(139,0,0,0.08)',   title: 'Our Heritage',   desc: 'A community rooted in Sourashtra traditions, culture and language for centuries.'    },
  { Icon: Globe,       color: '#0891b2', bg: 'rgba(8,145,178,0.08)', title: 'Tamil Nadu Wide', desc: 'Members spread across all major districts of Tamil Nadu.'                            },
  { Icon: FileText,    color: '#059669', bg: 'rgba(5,150,105,0.08)', title: 'Est. 1947',       desc: 'Formally registered post-independence to preserve Sourashtra identity.'              },
  { Icon: Target,      color: '#7c3aed', bg: 'rgba(124,58,237,0.08)',title: 'Our Mission',     desc: 'Connect, empower and preserve the Sourashtra community for future generations.'      },
];

const INITIATIVES = [
  { Icon: GraduationCap, color: '#0891b2', bg: 'rgba(8,145,178,0.15)',   cat: 'Education',      title: 'Scholarship Programme',  desc: 'Financial support for meritorious Sourashtra students pursuing higher education.', link: '/scholarship' },
  { Icon: Briefcase,     color: '#059669', bg: 'rgba(5,150,105,0.15)',   cat: 'Employment',     title: 'Job Connect Portal',      desc: 'Linking job seekers within the community to employers and opportunities.',          link: '/jobs'        },
  { Icon: Activity,      color: '#e11d48', bg: 'rgba(225,29,72,0.15)',   cat: 'Health & Welfare',title: 'Community Health Camps', desc: 'Annual health screening, medical camps and wellness programs for all members.',     link: '/about'       },
];

const GALLERY_SLOTS = [
  { big: true,  label: 'Annual Convention 2024', Icon: Award,         color: '#D4AF37' },
  { big: false, label: 'Cultural Festival',      Icon: Palette,       color: '#e11d48' },
  { big: false, label: 'Youth Talent Day',       Icon: BadgeCheck,    color: '#2563eb' },
  { big: false, label: 'Scholarship Day',        Icon: GraduationCap, color: '#059669' },
  { big: false, label: 'Heritage Walk',          Icon: Landmark,      color: '#7c3aed' },
];

const PATRONS = [
  {
    tag:         'Inspiration Behind SHC TN',
    tagColor:    '#c2410c',
    name:        'Shri Narendra Modi',
    designation: 'Honorable Prime Minister of India',
    quote:       '"The cultural connection of Saurashtra and Tamil Nadu is a shining example of Ek Bharat Shreshtha Bharat."',
    photo:       '/uploads/patron-modi.jpg',
  },
  {
    tag:         'Chief Patron',
    tagColor:    '#1d4ed8',
    name:        'Shri Bhupendra Patel',
    designation: 'Honorable Chief Minister of Gujarat',
    quote:       '"Supporting the academic rediscovery of our cultural roots and heritage connections across the Nation."',
    photo:       '/uploads/patron-bhupendra.jpg',
  },
  {
    tag:         'Patron of SHC',
    tagColor:    '#c2410c',
    name:        'Shri Utpal Joshi',
    designation: 'Hon. Vice Chancellor, Saurashtra University',
    quote:       '"It is our privilege to host the Saurashtra Heritage Chair, celebrating our historical roots and unifying bonds."',
    photo:       '/uploads/patron-utpal.jpg',
  },
];

const SPONSORS = [
  { Icon: Building2,     name: 'Sourashtra Bank'        },
  { Icon: BookMarked,    name: 'SHC College'            },
  { Icon: Newspaper,     name: 'Sourashtra Press'       },
  { Icon: GraduationCap, name: 'SHC Scholarship Trust'  },
  { Icon: HandCoins,     name: 'Community Welfare Fund' },
];

export default function Home() {
  const settings = useSiteSettings();
  const siteName = settings.site_name    || 'Sourashtra Community Portal';
  const siteTag  = settings.site_tagline || 'Connecting Our Community, Preserving Our Heritage';

  useSEO({
    title: 'Home',
    description: `Welcome to ${siteName} — connecting members through events, news, business directory, jobs and more.`,
  });

  const [events,    setEvents]    = useState([]);
  const [news,      setNews]      = useState([]);
  const [liveStats, setLiveStats] = useState(null);
  const [team,      setTeam]      = useState([]);

  useEffect(() => {
    api.get('/events?upcoming=true&limit=4').then(r => setEvents(r.data.data || [])).catch(() => {});
    api.get('/news?limit=6&featured=true').then(r  => setNews(r.data.data || [])).catch(() => {});
    api.get('/dashboard/public-stats').then(r       => setLiveStats(r.data)).catch(() => {});
    api.get('/team').then(r                         => setTeam(r.data || [])).catch(() => {});
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

        {/* ══════════════ BENTO GRID ══════════════ */}
        <div className="bento-grid">

          {/* Logo */}
          <div className="b-logo">
            <div className="logo-circle">
              {settings.logo_url
                ? <img src={settings.logo_url} alt={siteName} />
                : <span>{siteName.slice(0, 2).toUpperCase()}</span>
              }
            </div>
            <div className="logo-name">{siteName}</div>
            <div className="logo-sub">Est. Since Ancient Times</div>
          </div>

          {/* Heading */}
          <div className="b-card b-heading">
            <h1>{siteName.toUpperCase()}</h1>
            <div className="tagline">{siteTag.toUpperCase()}</div>
          </div>

          {/* Stats */}
          <div className="b-card b-stats">
            {STATS.map(s => (
              <div key={s.label} className="b-stat-item">
                <div className="b-stat-num">{s.num}</div>
                <div className="b-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Hero */}
          <div className="b-card b-hero">
            <p>
              A digital platform for the Sourashtra community to connect, celebrate and collaborate.
              Manage memberships, discover events, find jobs, explore businesses and more — all in one place.
            </p>
            <div className="b-hero-btns">
              <Link to="/membership" className="btn btn-sm"
                style={{ background: 'var(--secondary,#D4AF37)', color: '#1a1a1a', fontWeight: 700 }}>
                Become a Member
              </Link>
              <Link to="/about" className="btn btn-sm"
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                Learn More <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Feature tiles */}
          <div className="b-features">
            {FEATURES.map(f => (
              <Link key={f.title} to={f.link} className="b-feat">
                <div className="b-feat-icon" style={{ background: f.bg, color: f.color }}>
                  <f.Icon size={17} strokeWidth={1.75} />
                </div>
                <div className="b-feat-title">{f.title}</div>
                <p className="b-feat-desc">{f.desc}</p>
                <span className="b-feat-link">Explore <ChevronRight size={11} /></span>
              </Link>
            ))}
          </div>

          {/* Latest News */}
          <div className="b-card b-news">
            <div className="b-section-title">
              Latest News
              <Link to="/news">View all →</Link>
            </div>
            {news.length === 0
              ? <p style={{ fontSize: '0.78rem', color: '#9ca3af', padding: '0.75rem 0' }}>No news yet.</p>
              : <div className="b-news-list">
                  {news.slice(0, 6).map(n => (
                    <Link key={n.id} to={`/news/${n.id}`} className="b-news-item">
                      <div className="b-news-thumb">
                        {n.image_url
                          ? <img src={n.image_url} alt={n.title} />
                          : <Newspaper size={16} color="#cbd5e1" />
                        }
                      </div>
                      <div>
                        <div className="b-news-cat">{n.category || 'News'}</div>
                        <p className="b-news-headline">
                          {n.title.length > 50 ? n.title.slice(0, 50) + '…' : n.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
            }
          </div>

          {/* Upcoming Events */}
          <div className="b-card b-events">
            <div className="b-section-title">
              Upcoming Events
              <Link to="/events">View all →</Link>
            </div>
            {events.length === 0
              ? <p style={{ fontSize: '0.78rem', color: '#9ca3af', padding: '0.75rem 0' }}>No upcoming events.</p>
              : events.map(ev => {
                const d = new Date(ev.event_date);
                return (
                  <Link key={ev.id} to={`/events/${ev.id}`} className="b-event-item">
                    <div className="b-event-date">
                      <span className="day">{d.getDate()}</span>
                      <span>{d.toLocaleString('en-IN', { month: 'short' }).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="b-event-name">{ev.title}</p>
                      <p className="b-event-venue">
                        {ev.venue && <><MapPin size={10} style={{ marginRight: 3 }} />{ev.venue}</>}
                      </p>
                    </div>
                  </Link>
                );
              })
            }
          </div>

          {/* Filler cards */}
          <div className="b-fillers">
            {FILLERS.map(f => (
              <div key={f.title} className="b-filler">
                <div className="b-filler-icon" style={{ background: f.bg, color: f.color }}>
                  <f.Icon size={18} strokeWidth={1.75} />
                </div>
                <div className="b-filler-title">{f.title}</div>
                <p className="b-filler-text">{f.text}</p>
              </div>
            ))}
          </div>

          {/* Join — full-width horizontal CTA */}
          <div className="b-join">
            <div className="b-join-left">
              <div className="b-join-avatar">
                <UserPlus size={24} strokeWidth={1.5} color="rgba(255,255,255,0.9)" />
              </div>
              <div className="b-join-title">
                <h3>Join Our Community</h3>
                <p>Connect, celebrate &amp; collaborate with Sourashtra families</p>
              </div>
            </div>

            {liveStats && (
              <div className="b-join-stats">
                <div className="b-join-stat-item">
                  <div className="b-join-stat-num">{liveStats.totalMembers}+</div>
                  <div className="b-join-stat-label">Members</div>
                </div>
                <div className="b-join-stat-item">
                  <div className="b-join-stat-num">{liveStats.totalEvents}+</div>
                  <div className="b-join-stat-label">Events</div>
                </div>
                <div className="b-join-stat-item">
                  <div className="b-join-stat-num">{liveStats.totalDistricts}</div>
                  <div className="b-join-stat-label">Districts</div>
                </div>
              </div>
            )}

            <div className="b-join-actions">
              <Link to="/register" className="b-join-btn-primary">Register Now</Link>
              <Link to="/login" className="b-join-btn-secondary">Sign In</Link>
            </div>
          </div>

        </div>
        {/* ══════════════ END BENTO GRID ══════════════ */}

      </div>

      {/* ══════════════ BELOW-FOLD CONTENT ══════════════ */}
      <div className="home-sections">

        {/* ── About ─── */}
        <div className="about-strip">
          <div className="about-strip-text">
            <h2>About the Sourashtra Community</h2>
            <p>
              The Sourashtra community traces its roots to ancient silk weavers who migrated from Gujarat
              to Tamil Nadu centuries ago. Today, we are a vibrant community of{' '}
              {liveStats ? liveStats.totalMembers + '+' : 'thousands of'} members spread across Tamil Nadu —
              preserving our unique language, traditions and culture.
            </p>
            <p>
              Our portal brings together members, businesses, events and cultural resources in one
              unified digital home — making it easier than ever to stay connected and engaged.
            </p>
            <Link to="/about" className="learn-link">
              Discover Our History <ArrowRight size={14} />
            </Link>
          </div>
          <div className="about-strip-cards">
            {ABOUT_CARDS.map(c => (
              <div key={c.title} className="about-card">
                <div className="about-card-icon" style={{ background: c.bg, color: c.color }}>
                  <c.Icon size={20} strokeWidth={1.75} />
                </div>
                <h4>{c.title}</h4>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Patrons ─── */}
        <div className="patrons-section">
          <div className="section-header">
            <h2>Our Patrons &amp; Inspiration</h2>
          </div>
          <div className="patrons-grid">
            {PATRONS.map(p => (
              <div key={p.name} className="patron-card">
                <div className="patron-photo-wrap">
                  <img src={p.photo} alt={p.name} className="patron-photo" />
                </div>
                <div className="patron-tag" style={{ color: p.tagColor }}>
                  {p.tag.toUpperCase()}
                </div>
                <h3 className="patron-name">{p.name}</h3>
                <p className="patron-designation">{p.designation}</p>
                <p className="patron-quote">{p.quote}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Team / Coordinators ─── */}
        {team.length > 0 && (() => {
          const divisions = [...new Set(team.map(m => m.division).filter(Boolean))];
          return (
            <div className="team-section">
              <div className="section-header">
                <h2>Our Team &amp; Coordinators</h2>
              </div>
              {divisions.map(div => (
                <div key={div} className="team-division">
                  <div className="team-div-label">
                    <MapPin size={13} style={{ marginRight: 5 }} />
                    {div}
                  </div>
                  <div className="team-grid">
                    {team.filter(m => m.division === div).map(m => (
                      <div key={m.id} className="team-card">
                        <div className="team-photo-wrap">
                          {m.photo_url
                            ? <img src={m.photo_url} alt={m.name} className="team-photo" />
                            : <UserPlus size={28} color="rgba(255,255,255,0.6)" />
                          }
                        </div>
                        <div className="team-role">{m.role.toUpperCase()}</div>
                        <h4 className="team-name">{m.name}</h4>
                        {m.designation && <p className="team-designation">{m.designation}</p>}
                        {m.quote && <p className="team-quote">"{m.quote}"</p>}
                        <div className="team-card-bar" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* ── Initiatives ─── */}
        <div className="initiatives-section">
          <div className="section-header">
            <h2>Community Initiatives</h2>
            <Link to="/about">View all →</Link>
          </div>
          <div className="initiatives-grid">
            {INITIATIVES.map(i => (
              <Link key={i.title} to={i.link} className="initiative-card">
                <div className="initiative-img" style={{ background: i.bg }}>
                  <i.Icon size={48} color={i.color} strokeWidth={1.25} />
                </div>
                <div className="initiative-body">
                  <div className="initiative-cat">{i.cat}</div>
                  <h4>{i.title}</h4>
                  <p>{i.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Gallery Preview ─── */}
        <div className="gallery-section">
          <div className="section-header">
            <h2>Photo Gallery</h2>
            <Link to="/gallery">View all →</Link>
          </div>
          <div className="gallery-grid">
            {GALLERY_SLOTS.map((g, i) => (
              <Link key={i} to="/gallery"
                className={`gallery-cell${g.big ? ' big' : ''}`}>
                <g.Icon size={g.big ? 52 : 36} color={g.color} strokeWidth={1.25} />
                <div className="gallery-overlay">
                  <span>{g.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Partners ─── */}
        <div className="sponsors-section">
          <h3>Our Affiliates &amp; Partners</h3>
          <div className="sponsors-row">
            {SPONSORS.map(s => (
              <div key={s.name} className="sponsor-chip">
                <s.Icon size={15} strokeWidth={1.75} color="var(--primary,#8B0000)" />
                {s.name}
              </div>
            ))}
          </div>
        </div>

      </div>
    </PublicLayout>
  );
}
