import React from 'react';

/**
 * Button component with multiple variants, sizes, and states.
 *
 * @param {string}  variant   - 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
 * @param {string}  size      - 'xs' | 'sm' | 'md' (default) | 'lg'
 * @param {boolean} loading   - shows spinner and disables button
 * @param {boolean} fullWidth - makes button full width
 * @param {node}    leftIcon  - icon before label
 * @param {node}    rightIcon - icon after label
 */
const Button = React.forwardRef(({
  children,
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  style,
  ...props
}, ref) => {
  const variantClasses = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    outline:   'btn-outline',
    ghost:     'btn-ghost',
    danger:    'btn-danger',
    success:   'btn-success',
  };

  const sizeClasses = {
    xs: 'btn-sm',
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  return (
    <button
      ref={ref}
      className={`btn ${variantClasses[variant] || ''} ${sizeClasses[size] || ''} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      style={style}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="spinner-sm"
            style={{ borderTopColor: variant === 'outline' || variant === 'ghost' ? 'var(--primary)' : 'white' }}
          />
          Loading…
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
