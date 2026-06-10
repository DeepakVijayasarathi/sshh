import React from 'react';

/**
 * Input component with label, error, hint, and icon support.
 */
const Input = React.forwardRef(({
  label,
  error,
  hint,
  required,
  leftIcon,
  rightIcon,
  className = '',
  containerStyle,
  ...props
}, ref) => {
  const hasLeft  = !!leftIcon;
  const hasRight = !!rightIcon;

  return (
    <div className="form-group" style={containerStyle}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required" aria-hidden="true"> *</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {hasLeft && (
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={`form-control ${error ? 'error' : ''} ${className}`}
          style={{ paddingLeft: hasLeft ? '2.25rem' : undefined, paddingRight: hasRight ? '2.25rem' : undefined }}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
          {...props}
        />
        {hasRight && (
          <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p className="form-error" id={`${props.id}-error`} role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="form-hint" id={`${props.id}-hint`}>{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
