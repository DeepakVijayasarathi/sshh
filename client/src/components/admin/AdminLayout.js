import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import NotificationBell from './NotificationBell';
import './AdminLayout.css';
import {
  LayoutDashboard, Users, Calendar, Newspaper, Image, Building2,
  Briefcase, GraduationCap, Heart, MessageSquare, Bell, BarChart2,
  Activity, Settings, Globe, LogOut, ChevronLeft, ChevronRight,
  Menu, X, Search, ChevronDown, UserCog, Crown,
} from 'lucide-react';

const MENU_GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/members',           label: 'Members',          icon: Users  },
      { to: '/admin/membership-plans', label: 'Membership Plans',  icon: Crown  },
      { to: '/admin/events',        label: 'Events',        icon: Calendar },
      { to: '/admin/news',          label: 'News',          icon: Newspaper },
      { to: '/admin/gallery',       label: 'Gallery',       icon: Image },
      { to: '/admin/forum',         label: 'Forum',         icon: MessageSquare },
    ],
  },
  {
    label: 'Business',
    items: [
      { to: '/admin/businesses',    label: 'Businesses',    icon: Building2 },
      { to: '/admin/scholarships',  label: 'Scholarships',  icon: GraduationCap },
      { to: '/admin/donations',     label: 'Donations',     icon: Heart },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/notifications', label: 'Notifications', icon: Bell },
      { to: '/admin/reports',       label: 'Reports',       icon: BarChart2 },
      { to: '/admin/activity-log',  label: 'Activity Log',  icon: Activity },
      { to: '/admin/team',          label: 'Team Members',  icon: UserCog  },
      { to: '/admin/settings',      label: 'Settings',      icon: Settings },
    ],
  },
];

const ALL_MENU = MENU_GROUPS.flatMap(g => g.items);

const AdminLayout = () => {
  const [collapsed, setCollapsed]       = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop]       = useState(() => window.innerWidth >= 1024);
  const userMenuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const settings  = useSiteSettings();

  // Track viewport for responsive sidebar
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  // Breadcrumb page name
  const currentPage = ALL_MENU.find(item =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );

  const userInitial  = user?.email?.charAt(0).toUpperCase() ?? 'A';
  const sidebarWidth = collapsed ? 72 : 240;

  return (
    <div className="flex min-h-screen" style={{ background: '#f8fafc' }}>

      {/* ── Mobile overlay ─────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────── */}
      <aside
        className="fixed left-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{
          width: mobileOpen ? 240 : sidebarWidth,
          background: '#0f172a',
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
          transform: mobileOpen
            ? 'translateX(0)'
            : isDesktop
            ? 'translateX(0)'
            : 'translateX(-100%)',
        }}
      >
        {/* Logo row */}
        <div
          className="flex items-center h-16 flex-shrink-0 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.08)', padding: '0 1rem', gap: '0.625rem' }}
        >
          <div
            className="flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center font-bold text-white text-sm"
            style={{ width: 36, height: 36, background: 'var(--primary)' }}
          >
            {settings.logo_url
              ? <img src={settings.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <span>{(settings.site_name || 'SC').slice(0, 2).toUpperCase()}</span>
            }
          </div>

          {(!collapsed || mobileOpen) && (
            <div className="overflow-hidden flex-1">
              <p className="text-white font-semibold text-sm truncate leading-tight">
                {settings.site_name || 'Admin Panel'}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6875rem' }}>
                Admin Portal
              </p>
            </div>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="hidden lg:flex items-center justify-center rounded-md transition-colors"
            style={{
              width: 24, height: 24, marginLeft: 'auto', flexShrink: 0,
              color: 'rgba(255,255,255,0.3)',
            }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="flex lg:hidden items-center justify-center rounded-md transition-colors"
            style={{ width: 28, height: 28, color: 'rgba(255,255,255,0.5)', marginLeft: 'auto' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav
          className="flex-1 py-3 overflow-y-auto overflow-x-hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {MENU_GROUPS.map(group => (
            <div key={group.label} className="mb-1">
              {(!collapsed || mobileOpen) && (
                <p
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: 'rgba(255,255,255,0.25)',
                    padding: '0.5rem 1rem 0.25rem',
                    textTransform: 'uppercase',
                  }}
                >
                  {group.label}
                </p>
              )}
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  title={collapsed && !mobileOpen ? label : undefined}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.5rem 0.75rem',
                    margin: '0 0.5rem',
                    borderRadius: 8,
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                    color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
                    background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                    position: 'relative',
                  })}
                  className={({ isActive }) => isActive ? 'sidebar-active' : ''}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          style={{
                            position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)',
                            width: 3, height: 18, borderRadius: '0 3px 3px 0',
                            background: 'var(--primary)',
                          }}
                        />
                      )}
                      <Icon size={17} style={{ flexShrink: 0 }} />
                      {(!collapsed || mobileOpen) && (
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {label}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          className="flex-shrink-0 py-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <NavLink
            to="/"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.5rem 0.75rem', margin: '0 0.5rem', borderRadius: 8,
              fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(255,255,255,0.45)',
              transition: 'all 0.15s',
            }}
            title={collapsed && !mobileOpen ? 'Public Site' : undefined}
          >
            <Globe size={17} style={{ flexShrink: 0 }} />
            {(!collapsed || mobileOpen) && <span>Public Site</span>}
          </NavLink>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.5rem 0.75rem', margin: '0 0.5rem', borderRadius: 8,
              fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(248, 113, 113, 0.8)',
              background: 'none', border: 'none', width: 'calc(100% - 1rem)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            title={collapsed && !mobileOpen ? 'Sign Out' : undefined}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(248,113,113,0.8)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={17} style={{ flexShrink: 0 }} />
            {(!collapsed || mobileOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────── */}
      <div
        className="flex flex-col flex-1 min-h-screen min-w-0"
        style={{
          marginLeft: isDesktop ? sidebarWidth : 0,
          transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 flex items-center h-16 gap-4"
          style={{
            background: 'white',
            borderBottom: '1px solid #f1f5f9',
            boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06)',
            padding: '0 1.5rem',
          }}
        >
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden flex items-center justify-center rounded-lg transition-colors"
            style={{ width: 36, height: 36, color: '#4b5563' }}
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="flex-1 flex items-center gap-2" style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
            <span>Admin</span>
            {currentPage && (
              <>
                <ChevronRight size={13} />
                <span style={{ fontWeight: 600, color: '#111827' }}>{currentPage.label}</span>
              </>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <NotificationBell />

            {/* User dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-2.5 rounded-xl transition-colors"
                style={{ padding: '0.375rem 0.625rem', background: userMenuOpen ? '#f9fafb' : 'transparent' }}
              >
                <div
                  className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                  style={{ width: 32, height: 32, background: 'var(--primary)', fontSize: '0.8125rem' }}
                >
                  {userInitial}
                </div>
                <div className="hidden sm:block text-left">
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', lineHeight: 1.2, textTransform: 'capitalize' }}>
                    {user?.role}
                  </p>
                  <p style={{ fontSize: '0.6875rem', color: '#9ca3af', lineHeight: 1.3, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email}
                  </p>
                </div>
                <ChevronDown size={14} style={{ color: '#9ca3af', transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 rounded-xl overflow-hidden"
                  style={{
                    width: 200, background: 'white', zIndex: 200,
                    boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12), 0 2px 8px -2px rgba(0,0,0,0.08)',
                    border: '1px solid #f1f5f9',
                    animation: 'slideDown 0.15s ease-out',
                  }}
                >
                  <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', marginBottom: 2 }}>
                      {user?.email}
                    </p>
                    <span
                      className="badge"
                      style={{ background: 'rgba(var(--primary-rgb),0.1)', color: 'var(--primary)', fontSize: '0.6875rem', textTransform: 'capitalize' }}
                    >
                      {user?.role}
                    </span>
                  </div>
                  <NavLink
                    to="/"
                    onClick={() => setUserMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', fontSize: '0.8125rem', color: '#4b5563', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Globe size={14} /> Public Site
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', fontSize: '0.8125rem', color: '#ef4444', background: 'none', border: 'none', width: '100%', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6" style={{ maxWidth: '100%' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
