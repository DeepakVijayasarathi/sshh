import React from 'react';

/**
 * Card component with optional header, body, and footer sections.
 */
export const Card = ({ children, className = '', style, noPadding = false, ...props }) => (
  <div
    className={`card ${className}`}
    style={style}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, title, subtitle, actions, className = '', style }) => (
  <div
    className={`card-header ${className}`}
    style={style}
  >
    {title ? (
      <>
        <div>
          <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#111827', margin: 0 }}>{title}</p>
          {subtitle && <p style={{ fontSize: '0.8125rem', color: '#9ca3af', marginTop: 2, marginBottom: 0 }}>{subtitle}</p>}
        </div>
        {actions && <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>{actions}</div>}
      </>
    ) : children}
  </div>
);

export const CardBody = ({ children, className = '', style }) => (
  <div className={`card-body ${className}`} style={style}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', style }) => (
  <div
    className={className}
    style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid #f1f5f9', background: '#fafafa', ...style }}
  >
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body   = CardBody;
Card.Footer = CardFooter;

export default Card;
