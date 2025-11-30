import React from 'react';
import styles from '../../styles/components/Button.module.css';

/**
 * Reusable Button Component
 * 
 * @param {string} variant - 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
 * @param {string} size - 'small' | 'medium' | 'large'
 * @param {boolean} fullWidth - Button takes full width
 * @param {boolean} loading - Shows loading spinner
 * @param {boolean} disabled - Disables button
 * @param {string} icon - Icon element (left side)
 * @param {boolean} iconOnly - Only show icon
 * @param {function} onClick - Click handler
 * @param {string} type - 'button' | 'submit' | 'reset'
 * @param {React.ReactNode} children - Button content
 */
function Button({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconOnly = false,
  onClick,
  type = 'button',
  className = '',
  children,
  ...props
}) {
  const classNames = [
    styles.button,
    styles[variant],
    size === 'small' && styles.small,
    size === 'large' && styles.large,
    fullWidth && styles.fullWidth,
    iconOnly && styles.iconOnly,
    loading && styles.loading,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className={styles.spinner} />}
      {icon && <span className={styles.icon}>{icon}</span>}
      {!iconOnly && children}
    </button>
  );
}

export default Button;