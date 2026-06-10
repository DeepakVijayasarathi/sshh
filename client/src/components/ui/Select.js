import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Select dropdown with label, error, and custom styling.
 */
const Select = React.forwardRef(({
  label,
  error,
  hint,
  required,
  children,
  className = '',
  containerStyle,
  ...props
}, ref) => (
  <div className="form-group" style={containerStyle}>
    {label && (
      <label className="form-label" htmlFor={props.id}>
        {label}
        {required && <span className="required" aria-hidden="true"> *</span>}
      </label>
    )}
    <div style={{ position: 'relative' }}>
      <select
        ref={ref}
        className={`form-control ${error ? 'error' : ''} ${className}`}
        style={{ appearance: 'none', paddingRight: '2.25rem' }}
        aria-invalid={!!error}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={15} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {hint && !error && <p className="form-hint">{hint}</p>}
  </div>
));

Select.displayName = 'Select';
export default Select;
