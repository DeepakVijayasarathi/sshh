import React, { useState, useRef, useEffect } from 'react';
import { Bell, Info, CheckCircle, AlertTriangle, XCircle, Check } from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';

const TYPE_ICONS = {
  info:    { icon: Info,          color: '#3b82f6', bg: '#eff6ff' },
  success: { icon: CheckCircle,   color: '#059669', bg: '#ecfdf5' },
  warning: { icon: AlertTriangle, color: '#d97706', bg: '#fffbeb' },
  error:   { icon: XCircle,       color: '#dc2626', bg: '#fef2f2' },
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleItemClick = (n) => { if (!n.is_read) markRead(n.id); };

  const typeStyle = (type) => TYPE_ICONS[type] || TYPE_ICONS.info;

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        style={{
          position: 'relative', width: 36, height: 36, borderRadius: 10,
          border: 'none', background: open ? '#f1f5f9' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 0.15s', color: '#4b5563',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = '#f9fafb'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            minWidth: 16, height: 16, borderRadius: 999,
            background: '#ef4444', color: 'white',
            fontSize: '0.5625rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px', lineHeight: 1,
            border: '2px solid white',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute', right: 0, top: 'calc(100% + 10px)', zIndex: 200,
            width: 340, background: 'white', borderRadius: 14,
            boxShadow: '0 8px 30px -4px rgba(0,0,0,0.14), 0 2px 8px -2px rgba(0,0,0,0.08)',
            border: '1px solid #f1f5f9', overflow: 'hidden',
            animation: 'slideDown 0.15s ease-out',
          }}
        >
          {/* Header */}
          <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827', margin: 0 }}>Notifications</p>
              {unreadCount > 0 && (
                <span style={{ padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 700, background: '#fef2f2', color: '#ef4444' }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 360, overflowY: 'auto', scrollbarWidth: 'thin' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
                <Bell size={28} style={{ color: '#e5e7eb', margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', fontWeight: 500, margin: 0 }}>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 20).map(n => {
                const ts = typeStyle(n.type);
                const TypeIcon = ts.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                      width: '100%', padding: '0.75rem 1rem', background: n.is_read ? 'transparent' : 'rgba(59,130,246,0.04)',
                      border: 'none', borderBottom: '1px solid #f9fafb', cursor: 'pointer',
                      textAlign: 'left', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(59,130,246,0.04)'}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: ts.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <TypeIcon size={15} style={{ color: ts.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: n.is_read ? 500 : 600, color: '#111827', margin: '0 0 0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.title}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.message}
                      </p>
                      <p style={{ fontSize: '0.6875rem', color: '#9ca3af', margin: 0 }}>
                        {new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.is_read && (
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b82f6', flexShrink: 0, marginTop: 5 }} />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
