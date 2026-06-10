import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { Menu, X, ChevronDown, User, LayoutDashboard, LogOut } from 'lucide-react';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/',           label: 'Home',       end: true },
  { to: '/about',      label: 'About' },
  { to: '/membership', label: 'Membership' },
  { to: '/members',    label: 'Directory' },
  { to: '/events',     label: 'Events' },
  { to: '/gallery',    label: 'Gallery' },
  { to: '/business',   label: 'Business' },
  { to: '/jobs',       label: 'Jobs' },
  { to: '/news',       label: 'News' },
  { to: '/forum',      label: 'Forum' },
  { to: '/contact',    label: 'Contact' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen]       = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const userMenuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const settings  = useSiteSettings();

  const siteName = settings.site_name || 'Sourashtra';
  const siteSub  = settings.site_tagline || 'Community Portal';

  // Shadow on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <nav
        className="navbar"
        style={{
          position: 'sticky', top: 0, zIndex: 1000,
          background: 'white',
          borderBottom: `3px solid var(--primary)`,
          transition: 'box-shadow 0.2s',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: 68, gap: '1rem' }}>

          {/* ── Brand ──────────────────────────────────── */}
          <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0, textDecoration: 'none' }}>
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={siteName} style={{ height: 40, maxWidth: 120, objectFit: 'contain', display: 'block' }} />
            ) : (
              <>
                <div style={{
                  width: 44, height: 44, background: 'var(--primary)', color: 'white',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.875rem', letterSpacing: '0.04em', flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(var(--primary-rgb),0.3)',
                }}>
                  {siteName.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)', whiteSpace: 'nowrap' }}>{siteName}</span>
                  <span style={{ fontSize: '0.625rem', color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{siteSub}</span>
                </div>
              </>
            )}
          </Link>

          {/* ── Desktop Nav ─────────────────────────────── */}
          <ul className="desktop-nav" style={{ display: 'flex', alignItems: 'center', listStyle: 'none', gap: 0, margin: '0 0 0 1rem', padding: 0, flex: 1 }}>
            {NAV_LINKS.map(link => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  style={({ isActive }) => ({
                    display: 'block',
                    padding: '0.375rem 0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--primary)' : '#4b5563',
                    borderRadius: 6,
                    transition: 'color 0.15s, background 0.15s',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                    position: 'relative',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive && (
                        <span style={{
                          position: 'absolute', bottom: -3, left: '50%', transform: 'translateX(-50%)',
                          width: '60%', height: 2.5, background: 'var(--primary)', borderRadius: '2px 2px 0 0',
                        }} />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* ── Auth section ────────────────────────────── */}
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, marginLeft: 'auto' }}>
            {user ? (
              <div className="user-menu-wrapper" ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.375rem 0.625rem', borderRadius: 10,
                    background: userMenuOpen ? '#f9fafb' : 'transparent',
                    border: '1.5px solid transparent',
                    cursor: 'pointer', transition: 'all 0.15s',
                    borderColor: userMenuOpen ? '#e5e7eb' : 'transparent',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--primary)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.75rem',
                  }}>
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#374151' }}>
                    {user.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={14} style={{ color: '#9ca3af', transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 200,
                    background: 'white', borderRadius: 12, width: 200,
                    boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9',
                    animation: 'slideDown 0.15s ease-out',
                  }}>
                    <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f9fafb' }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827' }}>{user.email}</p>
                      <p style={{ fontSize: '0.6875rem', color: '#9ca3af', marginTop: 2, textTransform: 'capitalize' }}>{user.role}</p>
                    </div>
                    <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', fontSize: '0.8125rem', color: '#4b5563', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <User size={14} /> My Profile
                    </Link>
                    {['SuperAdmin', 'Admin'].includes(user.role) && (
                      <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', fontSize: '0.8125rem', color: '#4b5563', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <LayoutDashboard size={14} /> Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', fontSize: '0.8125rem', color: '#ef4444', background: 'none', border: 'none', width: '100%', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm btn-ghost" style={{ color: '#4b5563', borderRadius: 8 }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-sm btn-primary" style={{ borderRadius: 8 }}>
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ────────────────────────── */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(o => !o)}
            style={{
              display: 'none',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#374151', padding: '0.375rem', borderRadius: 8,
              marginLeft: 'auto',
            }}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu Drawer ──────────────────────────── */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 68, left: 0, right: 0, zIndex: 999,
          background: 'white', borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          animation: 'slideDown 0.2s ease-out',
          maxHeight: 'calc(100vh - 68px)', overflowY: 'auto',
        }}>
          <div style={{ padding: '0.75rem 1rem' }}>
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMenuOpen(false)}
                style={({ isActive }) => ({
                  display: 'block', padding: '0.625rem 0.875rem',
                  borderRadius: 8, marginBottom: '0.125rem',
                  fontSize: '0.9375rem', fontWeight: 500,
                  color: isActive ? 'var(--primary)' : '#374151',
                  background: isActive ? 'rgba(var(--primary-rgb),0.06)' : 'transparent',
                  transition: 'all 0.15s', textDecoration: 'none',
                })}
              >
                {link.label}
              </NavLink>
            ))}

            <div style={{ margin: '0.75rem 0', borderTop: '1px solid #f3f4f6' }} />

            {user ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)}
                  className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.5rem', gap: '0.5rem' }}>
                  <User size={16} /> My Profile
                </Link>
                {['SuperAdmin', 'Admin'].includes(user.role) && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)}
                    className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: '0.5rem' }}>
                    <LayoutDashboard size={16} /> Admin Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }}>
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Join Now</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
