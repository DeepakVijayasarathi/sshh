import React, { useEffect } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

const VARIANTS = {
  danger:  { icon: AlertTriangle, iconColor: '#dc2626', iconBg: '#fef2f2', btnClass: 'btn-danger' },
  warning: { icon: AlertTriangle, iconColor: '#d97706', iconBg: '#fffbeb', btnClass: 'btn-primary' },
  info:    { icon: Info,          iconColor: '#3b82f6', iconBg: '#eff6ff', btnClass: 'btn-primary' },
};

const ConfirmModal = ({
  isOpen,
  title        = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',
  onConfirm,
  onCancel,
  loading      = false,
}) => {
  const v    = VARIANTS[variant] || VARIANTS.danger;
  const Icon = v.icon;

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      <div
        style={{
          background: 'white', borderRadius: 18, width: '100%', maxWidth: 420,
          boxShadow: '0 20px 60px -10px rgba(0,0,0,0.22)',
          animation: 'slideUp 0.2s ease-out', overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* Header */}
        <div style={{ padding: '1.5rem 1.5rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: v.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={20} style={{ color: v.iconColor }} />
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
            <h3 id="confirm-modal-title" style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 0.375rem' }}>
              {title}
            </h3>
            {message && (
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.65, margin: 0 }}>
                {message}
              </p>
            )}
          </div>
          <button
            onClick={onCancel}
            aria-label="Close"
            style={{
              width: 30, height: 30, borderRadius: 8, border: 'none',
              background: '#f9fafb', color: '#9ca3af', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#374151'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#9ca3af'; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Footer */}
        <div style={{ padding: '0 1.5rem 1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading} style={{ minWidth: 80 }}>
            {cancelLabel}
          </button>
          <button className={`btn ${v.btnClass}`} onClick={onConfirm} disabled={loading} style={{ minWidth: 100 }}>
            {loading
              ? <><span className="spinner-sm" style={{ borderTopColor: 'white' }} /> Working…</>
              : confirmLabel
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
