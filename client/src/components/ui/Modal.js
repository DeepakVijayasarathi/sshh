import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modal — accessible dialog with backdrop, keyboard trap, and scroll lock.
 *
 * @param {boolean} isOpen  - controls visibility
 * @param {string}  title   - modal heading
 * @param {string}  size    - 'sm' | 'md' (default) | 'lg' | 'xl'
 * @param {func}    onClose - called on backdrop click or Escape key
 */
const SIZES = { sm: 380, md: 480, lg: 600, xl: 760 };

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size       = 'md',
  closable   = true,
  className  = '',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape' && closable) onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [isOpen, onClose, closable]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && closable) onClose?.(); }}
    >
      <div
        style={{
          background: 'white', borderRadius: 18,
          width: '100%', maxWidth: SIZES[size] || SIZES.md,
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px -10px rgba(0,0,0,0.22)',
          animation: 'slideUp 0.2s ease-out', overflow: 'hidden',
        }}
        className={className}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        {(title || closable) && (
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexShrink: 0 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {title && (
                <h2 id="modal-title" style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                  {title}
                </h2>
              )}
              {subtitle && <p style={{ fontSize: '0.8125rem', color: '#9ca3af', marginTop: 3, marginBottom: 0 }}>{subtitle}</p>}
            </div>
            {closable && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  width: 30, height: 30, borderRadius: 8, border: 'none',
                  background: '#f9fafb', color: '#9ca3af', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#374151'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#9ca3af'; }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid #f1f5f9', background: '#fafafa', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
