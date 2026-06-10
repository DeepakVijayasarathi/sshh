import React from 'react';

/**
 * PageHeader — consistent admin page title + subtitle + action slot.
 */
const PageHeader = ({ title, subtitle, actions, className = '' }) => (
  <div
    className={className}
    style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}
  >
    <div>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: 4, marginBottom: 0 }}>
          {subtitle}
        </p>
      )}
    </div>
    {actions && (
      <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexShrink: 0 }}>
        {actions}
      </div>
    )}
  </div>
);

export default PageHeader;
