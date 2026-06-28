import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { Mail, Phone, MapPin } from 'lucide-react';

/* Inline SVG social icons — lucide-react omits brand logos */
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12z"/>
  </svg>
);

const FooterSection = ({ title, children }) => (
  <div>
    <h5 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem', marginTop: 0 }}>
      {title}
    </h5>
    {children}
  </div>
);

const FooterLink = ({ to, children }) => (
  <li style={{ marginBottom: '0.5rem' }}>
    <Link
      to={to}
      style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', transition: 'color 0.15s', display: 'inline-flex', alignItems: 'center', gap: 4 }}
      onMouseEnter={e => e.currentTarget.style.color = 'white'}
      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
    >
      {children}
    </Link>
  </li>
);

const Footer = () => {
  const settings = useSiteSettings();
  const siteName = settings.site_name || 'Sourashtra Community Portal';

  const socialLinks = [
    { href: settings.facebook_url,  Icon: FacebookIcon,  label: 'Facebook'  },
    { href: settings.instagram_url, Icon: InstagramIcon, label: 'Instagram' },
    { href: settings.twitter_url,   Icon: TwitterIcon,   label: 'Twitter'   },
    { href: settings.youtube_url,   Icon: YoutubeIcon,   label: 'YouTube'   },
  ].filter(s => s.href);

  return (
    <footer style={{ background: '#0f172a', color: 'white', marginTop: 'auto' }}>
      {/* Main footer */}
      <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem' }}>

          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--primary)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem',
                flexShrink: 0, overflow: 'hidden',
              }}>
                {settings.logo_url
                  ? <img src={settings.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : siteName.slice(0, 2).toUpperCase()
                }
              </div>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>{siteName}</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '1.25rem', marginTop: 0 }}>
              {settings.site_tagline || 'Connecting and empowering the Sourashtra community through digital innovation and community service.'}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: socialLinks.length ? '1rem' : 0 }}>
              <Link to="/register" className="btn btn-sm" style={{ background: 'var(--primary)', color: 'white', fontSize: '0.75rem' }}>
                Join Community
              </Link>
            </div>
            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {socialLinks.map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    style={{
                      width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <FooterSection title="Quick Links">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/membership">Membership</FooterLink>
              <FooterLink to="/events">Events</FooterLink>
              <FooterLink to="/gallery">Gallery</FooterLink>
            </ul>
          </FooterSection>

          {/* Services */}
          <FooterSection title="Services">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <FooterLink to="/business">Business Directory</FooterLink>

              <FooterLink to="/scholarship">Scholarships</FooterLink>
              <FooterLink to="/forum">Community Forum</FooterLink>
              <FooterLink to="/donate">Donations</FooterLink>
            </ul>
          </FooterSection>

          {/* Contact */}
          <FooterSection title="Contact Us">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {settings.contact_email && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                  <Mail size={15} style={{ color: 'var(--secondary)', marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                    {settings.contact_email}
                  </span>
                </div>
              )}
              {settings.contact_phone && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                  <Phone size={15} style={{ color: 'var(--secondary)', marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                    {settings.contact_phone}
                  </span>
                </div>
              )}
              {settings.contact_address && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                  <MapPin size={15} style={{ color: 'var(--secondary)', marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                    {settings.contact_address}
                  </span>
                </div>
              )}
              {/* Fallback if no settings yet */}
              {!settings.contact_email && !settings.contact_phone && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Mail size={14} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>info@sourashtra.org</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Phone size={14} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>+91 98765 43210</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                    <MapPin size={14} style={{ color: 'var(--secondary)', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>Chennai, Tamil Nadu, India</span>
                  </div>
                </>
              )}
            </div>
          </FooterSection>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1rem 1.5rem' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', padding: 0 }}>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            {settings.footer_text || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[
              { to: '/contact', label: 'Contact' },
              { to: '/membership', label: 'Membership' },
            ].map(l => (
              <Link
                key={l.to}
                to={l.to}
                style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
