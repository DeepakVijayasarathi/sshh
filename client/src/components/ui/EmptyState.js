import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * EmptyState — shown when a list/table has no data.
 */
const EmptyState = ({
  icon: Icon = Inbox,
  title       = 'Nothing here yet',
  description,
  action,
  compact     = false,
}) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    textAlign: 'center', padding: compact ? '3rem 1.5rem' : '5rem 2rem',
  }}>
    <div style={{
      width: compact ? 44 : 56, height: compact ? 44 : 56,
      borderRadius: '50%', background: '#f3f4f6',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '1rem',
    }}>
      <Icon size={compact ? 20 : 26} style={{ color: '#d1d5db' }} />
    </div>
    <p style={{ fontWeight: 600, color: '#374151', fontSize: compact ? '0.875rem' : '1rem', margin: '0 0 0.375rem' }}>
      {title}
    </p>
    {description && (
      <p style={{ fontSize: '0.8125rem', color: '#9ca3af', maxWidth: 320, margin: '0 0 1.5rem', lineHeight: 1.6 }}>
        {description}
      </p>
    )}
    {action}
  </div>
);

export default EmptyState;
