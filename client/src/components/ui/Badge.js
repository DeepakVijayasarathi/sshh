import React from 'react';

/**
 * Badge component for status indicators and labels.
 *
 * @param {string} variant - 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'primary'
 * @param {boolean} dot    - show a status dot before label
 */
const VARIANT_STYLES = {
  success:   { bg: '#ecfdf5', color: '#059669' },
  warning:   { bg: '#fffbeb', color: '#d97706' },
  danger:    { bg: '#fef2f2', color: '#dc2626' },
  info:      { bg: '#eff6ff', color: '#3b82f6' },
  secondary: { bg: '#f3f4f6', color: '#6b7280' },
  primary:   { bg: null,      color: null },  // uses CSS variables
};

const Badge = ({ children, variant = 'secondary', dot = false, style, ...props }) => {
  const vs = VARIANT_STYLES[variant] || VARIANT_STYLES.secondary;
  const isPrimary = variant === 'primary';

  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: dot ? 5 : 4,
        padding: '0.25rem 0.625rem', borderRadius: 999,
        fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.01em',
        background: isPrimary ? 'rgba(var(--primary-rgb), 0.1)' : vs.bg,
        color:      isPrimary ? 'var(--primary)' : vs.color,
        ...style,
      }}
      {...props}
    >
      {dot && (
        <span style={{
          width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
          background: isPrimary ? 'var(--primary)' : vs.color,
        }} />
      )}
      {children}
    </span>
  );
};

export default Badge;
