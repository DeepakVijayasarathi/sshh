import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/common/PublicLayout';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import api from '../../services/api';
import useSEO from '../../hooks/useSEO';
import {
  Users, Calendar, Building2, GraduationCap, MessageSquare,
  Landmark, BookOpen, Heart, Music, Globe, Target, FileText,
  Newspaper, UserPlus, Activity, MapPin,
  ArrowRight, ChevronRight, ChevronLeft, Images,
  HandCoins, BookMarked, Stethoscope,
} from 'lucide-react';
import './Home.css';

/* ── Constants ────────────────────────────────────────────── */
const FEATURES = [
  { Icon: Users,         title: 'Membership',  desc: 'Join and connect with members across Tamil Nadu.',       link: '/membership',  color: '#8B0000', bg: 'rgba(139,0,0,0.10)'   },
  { Icon: Calendar,      title: 'Events',       desc: 'Cultural, educational & community events year-round.',   link: '/events',      color: '#2563eb', bg: 'rgba(37,99,235,0.10)'  },
  { Icon: Building2,     title: 'Businesses',   desc: 'Discover Sourashtra-owned businesses near you.',         link: '/business',    color: '#059669', bg: 'rgba(5,150,105,0.10)'  },
  { Icon: GraduationCap, title: 'Scholarships', desc: 'Educational support for deserving students.',           link: '/scholarship', color: '#0891b2', bg: 'rgba(8,145,178,0.10)'  },
  { Icon: MessageSquare, title: 'Forum',        desc: 'Raise issues, share ideas and collaborate.',            link: '/forum',       color: '#d97706', bg: 'rgba(217,119,6,0.10)'   },
];

const FILLERS = [
  { Icon: Landmark,  color: '#8B0000', bg: 'rgba(139,0,0,0.08)',   title: 'Cultural Heritage', text: 'Preserving Sourashtra customs, traditions and language passed down through generations.' },
  { Icon: BookOpen,  color: '#2563eb', bg: 'rgba(37,99,235,0.08)', title: 'Literary Archive',  text: 'Documenting classical Sourashtra literature, folk songs and historical manuscripts.'     },
  { Icon: Heart,     color: '#e11d48', bg: 'rgba(225,29,72,0.08)', title: 'Community Welfare', text: 'Running welfare schemes, health camps and support programs for members in need.'         },
  { Icon: Music,     color: '#7c3aed', bg: 'rgba(124,58,237,0.08)',title: 'Arts & Music',      text: 'Promoting traditional music, dance and classical arts through workshops and festivals.'  },
];

const ABOUT_CARDS = [
  { Icon: Landmark,  color: '#8B0000', bg: 'rgba(139,0,0,0.08)',   title: 'Our Heritage',   desc: 'A community rooted in Sourashtra traditions, culture and language for centuries.'    },
  { Icon: Globe,     color: '#0891b2', bg: 'rgba(8,145,178,0.08)', title: 'Tamil Nadu Wide', desc: 'Members spread across all major districts of Tamil Nadu.'                            },
  { Icon: FileText,  color: '#059669', bg: 'rgba(5,150,105,0.08)', title: 'Est. 1947',       desc: 'Formally registered post-independence to preserve Sourashtra identity.'              },
  { Icon: Target,    color: '#7c3aed', bg: 'rgba(124,58,237,0.08)',title: 'Our Mission',     desc: 'Connect, empower and preserve the Sourashtra community for future generations.'      },
];

const INITIATIVES = [
  { Icon: GraduationCap, color: '#0891b2', bg: 'rgba(8,145,178,0.15)',  cat: 'Education',       title: 'Scholarship Programme',  desc: 'Financial support for meritorious Sourashtra students pursuing higher education.', link: '/scholarship' },
  { Icon: Activity,      color: '#e11d48', bg: 'rgba(225,29,72,0.15)',  cat: 'Health & Welfare', title: 'Community Health Camps', desc: 'Annual health screening, medical camps and wellness programs for all members.',     link: '/about'       },
];

const SPONSORS = [
  { Icon: Building2,     name: 'Sourashtra Bank'        },
  { Icon: BookMarked,    name: 'SHC College'            },
  { Icon: Newspaper,     name: 'Sourashtra Press'       },
  { Icon: GraduationCap, name: 'SHC Scholarship Trust'  },
  { Icon: HandCoins,     name: 'Community Welfare Fund' },
];

/* ── Banner Slider ────────────────────────────────────────── */
const BannerSlider = ({ banners, siteName, siteTag, settings }) => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const hasBanners = banners && banners.length > 0;
  const count = hasBanners ? banners.length : 0;

  const next = useCallback(() => setCurrent(c => (c + 1) % count), [count]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + count) % count), [count]);

  useEffect(() => {
    if (count <= 1) return;
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [next, count]);

  const resetTimer = () => { clearInterval(timerRef.current); if (count > 1) timerRef.current = setInterval(next, 5000); };
  const goTo = (i) => { setCurrent(i); resetTimer(); };
  const handlePrev = () => { prev(); resetTimer(); };
  const handleNext = () => { next(); resetTimer(); };

  if (!hasBanners) {
    return (
      <div className="h-banner" style={{ background: 'linear-gradient(130deg, var(--primary,#8B0000) 0%, #1a0a1e 100%)' }}>
        <div className="h-banner-pattern" />
        <div className="h-banner-content">
          {settings?.logo_url && (
            <img src={settings.logo_url} alt={siteName} className="h-banner-logo" />
          )}
          <div className="h-banner-eyebrow">{siteTag}</div>
          <h1 className="h-banner-title">{siteName}</h1>
          <p className="h-banner-desc">A digital platform for the Sourashtra community to connect, celebrate and collaborate.</p>
          <div className="h-banner-actions">
            <Link to="/membership" className="h-banner-btn h-banner-btn--gold">
              Become a Member <ChevronRight size={14} />
            </Link>
            <Link to="/about" className="h-banner-btn h-banner-btn--ghost">
              Learn More <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const b = banners[current];
  return (
    <div className="h-banner" style={{ background: b.image_url ? 'transparent' : (b.bg_color || '#1a1a2e') }}>
      {b.image_url && (
        <div className="h-banner-bg">
          <img src={b.image_url} alt={b.title} />
          <div className="h-banner-overlay" />
        </div>
      )}
      <div className="h-banner-content" style={{ color: b.text_color || '#fff' }}>
        {b.subtitle && <div className="h-banner-eyebrow">{b.subtitle}</div>}
        <h1 className="h-banner-title">{b.title}</h1>
        {b.description && <p className="h-banner-desc">{b.description}</p>}
        {b.button_text && b.button_link && (
          <div className="h-banner-actions">
            <Link to={b.button_link} className="h-banner-btn h-banner-btn--gold">
              {b.button_text} <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </div>
      {count > 1 && (
        <>
          <button className="h-banner-arrow h-banner-arrow--prev" onClick={handlePrev} aria-label="Previous"><ChevronLeft size={18} /></button>
          <button className="h-banner-arrow h-banner-arrow--next" onClick={handleNext} aria-label="Next"><ChevronRight size={18} /></button>
          <div className="h-banner-dots">
            {banners.map((_, i) => (
              <button key={i} className={`h-banner-dot${i === current ? ' active' : ''}`} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ── Home Page ────────────────────────────────────────────── */
export default function Home() {
  const settings = useSiteSettings();
  const siteName = settings.site_name    || 'Saurashtra Heritage Chair';
  const siteTag  = settings.site_tagline || 'Connecting Our Community, Preserving Our Heritage';

  useSEO({
    title: 'Home',
    description: `Welcome to ${siteName} — connecting members through events, news, business directory, jobs and more.`,
  });

  const [events,   setEvents]   = useState([]);
  const [news,     setNews]     = useState([]);
  const [heritage, setHeritage] = useState([]);
  const [liveStats,setLiveStats]= useState(null);
  const [team,     setTeam]     = useState([]);
  const [patrons,  setPatrons]  = useState([]);
  const [banners,  setBanners]  = useState([]);
  const [gallery,  setGallery]  = useState([]);

  useEffect(() => {
    api.get('/events?upcoming=true&limit=4').then(r => setEvents(r.data.data || [])).catch(() => {});
    api.get('/news?limit=4&featured=true').then(r  => setNews(r.data.data || [])).catch(() => {});
    api.get('/news?limit=4&category=Cultural+Heritage').then(r => setHeritage(r.data.data || [])).catch(() => {});
    api.get('/dashboard/public-stats').then(r       => setLiveStats(r.data)).catch(() => {});
    api.get('/banners?active=true').then(r          => setBanners(r.data || [])).catch(() => {});
    api.get('/gallery/albums').then(r               => setGallery(r.data || [])).catch(() => {});
    api.get('/team').then(r => {
      const all = r.data || [];
      setPatrons(all.filter(m => m.division === 'Patron'));
      setTeam(all.filter(m => m.division !== 'Patron'));
    }).catch(() => {});
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

      {/* ══════════════ HERO ══════════════ */}
      <div className="h-hero">
        <BannerSlider banners={banners} siteName={siteName} siteTag={siteTag} settings={settings} />
        <div className="h-stats-bar">
          <div className="h-container">
            <div className="h-stats-row">
              {STATS.map(s => (
                <div key={s.label} className="h-stat-item">
                  <span className="h-stat-num">{s.num}</span>
                  <span className="h-stat-lbl">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ QUICK LINKS ══════════════ */}
      <div className="h-ql-section">
        <div className="h-container">
          <div className="h-ql-grid">
            {FEATURES.map(f => (
              <Link key={f.title} to={f.link} className="h-ql-card">
                <div className="h-ql-icon" style={{ background: f.bg, color: f.color }}>
                  <f.Icon size={22} strokeWidth={1.75} />
                </div>
                <div className="h-ql-body">
                  <span className="h-ql-title">{f.title}</span>
                  <p className="h-ql-desc">{f.desc}</p>
                </div>
                <ChevronRight size={15} className="h-ql-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════ NEWS + EVENTS ══════════════ */}
      <div className="h-ne-section">
        <div className="h-container">
          <div className="h-ne-grid">

            {/* News */}
            <div className="h-panel">
              <div className="h-panel-hdr">
                <h2 className="h-panel-title">
                  <Newspaper size={17} /> Latest News
                </h2>
                <Link to="/news" className="h-more-link">View all <ChevronRight size={13} /></Link>
              </div>
              {news.length === 0
                ? <p className="h-empty-msg">No news yet.</p>
                : <div className="h-news-list">
                    {news.slice(0, 4).map(n => (
                      <Link key={n.id} to={`/news/${n.id}`} className="h-news-row">
                        <div className="h-news-img">
                          {n.image_url
                            ? <img src={n.image_url} alt={n.title} />
                            : <Newspaper size={18} color="#cbd5e1" />
                          }
                        </div>
                        <div className="h-news-body">
                          <span className="h-news-cat">{n.category || 'News'}</span>
                          <p className="h-news-ttl">{n.title.length > 65 ? n.title.slice(0, 65) + '…' : n.title}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
              }
            </div>

            {/* Events */}
            <div className="h-panel">
              <div className="h-panel-hdr">
                <h2 className="h-panel-title">
                  <Calendar size={17} /> Upcoming Events
                </h2>
                <Link to="/events" className="h-more-link">View all <ChevronRight size={13} /></Link>
              </div>
              {events.length === 0
                ? <p className="h-empty-msg">No upcoming events.</p>
                : events.map(ev => {
                    const d = new Date(ev.event_date);
                    return (
                      <Link key={ev.id} to={`/events/${ev.id}`} className="h-ev-row">
                        <div className="h-ev-badge">
                          <span className="h-ev-day">{d.getDate()}</span>
                          <span className="h-ev-mon">{d.toLocaleString('en-IN', { month: 'short' }).toUpperCase()}</span>
                        </div>
                        <div className="h-ev-body">
                          <p className="h-ev-name">{ev.title}</p>
                          {ev.venue && <p className="h-ev-venue"><MapPin size={10} />{ev.venue}</p>}
                        </div>
                      </Link>
                    );
                  })
              }
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ PILLARS / VALUES ══════════════ */}
      <div className="h-pillars-section">
        <div className="h-container">
          <div className="h-pillars-grid">
            {FILLERS.map(f => (
              <div key={f.title} className="h-pillar">
                <div className="h-pillar-icon" style={{ background: f.bg, color: f.color }}>
                  <f.Icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="h-pillar-title">{f.title}</h3>
                <p className="h-pillar-text">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════ JOIN CTA ══════════════ */}
      <div className="h-join-wrap">
        <div className="h-container">
          <div className="h-join-card">
            <div className="h-join-left">
              <span className="h-join-eyebrow">Join Us Today</span>
              <h2 className="h-join-heading">Become Part of Our Community</h2>
              <p className="h-join-sub">Connect, celebrate &amp; collaborate with Sourashtra families across Tamil Nadu</p>
              <div className="h-join-actions">
                <Link to="/register" className="h-btn-gold">Register Now</Link>
                <Link to="/login" className="h-btn-ghost">Sign In</Link>
              </div>
            </div>
            {liveStats && (
              <div className="h-join-stats">
                {[
                  { n: liveStats.totalMembers    + '+', l: 'Members'    },
                  { n: liveStats.totalEvents     + '+', l: 'Events'     },
                  { n: liveStats.totalBusinesses + '+', l: 'Businesses' },
                  { n: liveStats.totalDistricts,        l: 'Districts'  },
                ].map(s => (
                  <div key={s.l} className="h-join-stat">
                    <span className="h-join-snum">{s.n}</span>
                    <span className="h-join-slbl">{s.l}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════ BELOW-FOLD ══════════════ */}
      <div className="home-sections">

        {/* About */}
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
            <Link to="/about" className="learn-link">Discover Our History <ArrowRight size={14} /></Link>
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

        {/* Patrons */}
        {patrons.length > 0 && (
          <div className="patrons-section">
            <div className="patrons-section-inner">
              <div className="patrons-header">
                <div className="patrons-header-badge">Honoured Leaders</div>
                <h2 className="patrons-heading">Our Patrons &amp; Inspiration</h2>
                <p className="patrons-subheading">Distinguished personalities whose vision and service inspire the Sourashtra community</p>
              </div>
              <div className="patrons-grid">
                {patrons.map((p, i) => (
                  <div key={p.id} className={`patron-card ${i === 0 ? 'patron-card--featured' : ''}`}>
                    <div className="patron-card-bg" />
                    <div className="patron-photo-wrap">
                      {p.photo_url
                        ? <img src={p.photo_url} alt={p.name} className="patron-photo" />
                        : <div className="patron-photo-initial">{p.name.charAt(0)}</div>
                      }
                    </div>
                    <div className="patron-card-body">
                      <div className="patron-role-badge">{p.role}</div>
                      <h3 className="patron-name">{p.name}</h3>
                      {p.designation && <p className="patron-designation">{p.designation}</p>}
                      {p.quote && (
                        <blockquote className="patron-quote">
                          <span className="patron-quote-mark">"</span>{p.quote}<span className="patron-quote-mark">"</span>
                        </blockquote>
                      )}
                    </div>
                    <div className="patron-card-shine" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Team */}
        {team.length > 0 && (() => {
          const divisions = [...new Set(team.map(m => m.division).filter(Boolean))];
          return (
            <div className="team-section">
              <div className="section-header"><h2>Our Team &amp; Coordinators</h2></div>
              {divisions.map(div => (
                <div key={div} className="team-division">
                  <div className="team-div-label"><MapPin size={13} style={{ marginRight: 5 }} />{div}</div>
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

        {/* Initiatives */}
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

        {/* Gallery */}
        {gallery.length > 0 && (
          <div className="gallery-section">
            <div className="section-header">
              <h2>Photo Gallery</h2>
              <Link to="/gallery">View all →</Link>
            </div>
            <div className="gallery-grid">
              {gallery.slice(0, 5).map((album, i) => (
                <Link
                  key={album.id}
                  to="/gallery"
                  className={`gallery-cell${i === 0 ? ' big' : ''}`}
                  style={album.cover_image_url ? { backgroundImage: `url(${album.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {!album.cover_image_url && <Images size={i === 0 ? 52 : 36} color="#D4AF37" strokeWidth={1.25} />}
                  <div className="gallery-overlay"><span>{album.title}</span></div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Cultural Heritage */}
        <div className="initiatives-section">
          <div className="section-header">
            <h2>Cultural Heritage</h2>
            <Link to="/news?category=Cultural+Heritage">View all →</Link>
          </div>
          {heritage.length > 0 ? (
            <div className="initiatives-grid">
              {heritage.map(n => (
                <Link key={n.id} to={`/news/${n.id}`} className="initiative-card">
                  <div className="initiative-img" style={{ background: 'rgba(139,0,0,0.10)', overflow: 'hidden' }}>
                    {n.image_url
                      ? <img src={n.image_url} alt={n.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Landmark size={48} color="#8B0000" strokeWidth={1.25} />
                    }
                  </div>
                  <div className="initiative-body">
                    <div className="initiative-cat">Cultural Heritage</div>
                    <h4>{n.title}</h4>
                    <p>{n.content ? n.content.slice(0, 100) + '…' : ''}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: 12, border: '1.5px dashed #e5e7eb', padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              <Landmark size={36} color="#d1d5db" style={{ margin: '0 auto 0.75rem' }} />
              <p>Cultural Heritage posts will appear here. Admins can publish posts under the <strong>Cultural Heritage</strong> category in News.</p>
            </div>
          )}
        </div>

        {/* Partners */}
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
