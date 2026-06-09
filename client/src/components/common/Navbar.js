import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const settings = useSiteSettings();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/membership', label: 'Membership' },
    { to: '/members', label: 'Directory' },
    { to: '/events', label: 'Events' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/business', label: 'Business' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/news', label: 'News' },
    { to: '/forum', label: 'Forum' },
    { to: '/contact', label: 'Contact' },
  ];

  const siteName = settings.site_name || 'Sourashtra';
  const siteSub  = settings.site_tagline || 'Community Portal';

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt={siteName}
              style={{ height: 40, maxWidth: 120, objectFit: 'contain' }}
            />
          ) : (
            <>
              <div className="brand-logo">
                {siteName.slice(0, 2).toUpperCase()}
              </div>
              <div className="brand-text">
                <span className="brand-name">{siteName}</span>
                <span className="brand-sub">{siteSub}</span>
              </div>
            </>
          )}
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>

        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.to === '/'} onClick={() => setMenuOpen(false)}
                className={({ isActive }) => isActive ? 'active' : ''}>
                {link.label}
              </NavLink>
            </li>
          ))}
          <li className="nav-divider" />
          {user ? (
            <>
              <li><Link to="/profile" className="btn btn-sm btn-outline" onClick={() => setMenuOpen(false)}>My Profile</Link></li>
              {['SuperAdmin', 'Admin'].includes(user.role) && (
                <li><Link to="/admin" className="btn btn-sm btn-secondary" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
              )}
              <li><button className="btn btn-sm btn-outline" onClick={handleLogout}>Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="btn btn-sm btn-outline" onClick={() => setMenuOpen(false)}>Login</Link></li>
              <li><Link to="/register" className="btn btn-sm btn-primary" onClick={() => setMenuOpen(false)}>Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
