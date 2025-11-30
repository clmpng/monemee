import React from 'react';
import styles from '../../styles/components/Badge.module.css';

/**
 * Badge Component
 */
function Badge({
  children,
  variant = 'default', // 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size = 'medium', // 'small' | 'medium' | 'large'
  solid = false,
  dot = false,
  className = ''
}) {
  const variantClass = solid 
    ? styles[`solid${variant.charAt(0).toUpperCase() + variant.slice(1)}`]
    : styles[variant];

  const classNames = [
    styles.badge,
    variantClass,
    size === 'small' && styles.small,
    size === 'large' && styles.large,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classNames}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}

/**
 * Level Badge Component
 */
function LevelBadge({ level, name }) {
  const icons = ['🌱', '⭐', '🚀', '💎', '👑'];
  const icon = icons[level - 1] || '⭐';

  return (
    <span className={styles.levelBadge}>
      <span className={styles.levelIcon}>{icon}</span>
      Level {level} - {name}
    </span>
  );
}

Badge.Level = LevelBadge;

export default Badge;