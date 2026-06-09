import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import './AdminLayout.css';

const MENU = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/members', label: 'Members', icon: '👥' },
  { to: '/admin/events', label: 'Events', icon: '📅' },
  { to: '/admin/news', label: 'News', icon: '📰' },
  { to: '/admin/gallery', label: 'Gallery', icon: '🖼️' },
  { to: '/admin/businesses', label: 'Businesses', icon: '🏢' },
  { to: '/admin/jobs', label: 'Jobs', icon: '💼' },
  { to: '/admin/scholarships', label: 'Scholarships', icon: '🎓' },
  { to: '/admin/donations', label: 'Donations', icon: '💰' },
  { to: '/admin/forum', label: 'Forum', icon: '💬' },
  { to: '/admin/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/admin/reports', label: 'Reports', icon: '📈' },
  { to: '/admin/activity-log', label: 'Activity Log', icon: '📋' },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className={`admin-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">SC</div>
          {sidebarOpen && <span className="sidebar-brand">Admin Panel</span>}
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {MENU.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <span className="link-icon">{item.icon}</span>
              {sidebarOpen && <span className="link-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <NavLink to="/" className="sidebar-link">
            <span className="link-icon">🌐</span>
            {sidebarOpen && <span className="link-label">Public Site</span>}
          </NavLink>
          <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
            <span className="link-icon">🚪</span>
            {sidebarOpen && <span className="link-label">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="topbar-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="topbar-right">
            <NotificationBell />
            <span className="topbar-user">
              <span className="user-avatar">{user?.email?.charAt(0).toUpperCase()}</span>
              <span className="user-info">
                <span className="user-role">{user?.role}</span>
                <span className="user-email">{user?.email}</span>
              </span>
            </span>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
