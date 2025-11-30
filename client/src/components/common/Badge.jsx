import React from 'react';
import Icon from './Icon';
import styles from '../../styles/components/Badge.module.css';

/**
 * Badge Component
 */
function Badge({
  children,
  variant = 'default',
  size = 'medium',
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
  // Icon-Namen für die verschiedenen Level
  const levelIcons = ['sprout', 'star', 'rocket', 'gem', 'crown'];
  const iconName = levelIcons[level - 1] || 'star';

  return (
    <span className={styles.levelBadge}>
      <span className={styles.levelIcon}>
        <Icon name={iconName} size="sm" />
      </span>
      Level {level} - {name}
    </span>
  );
}

Badge.Level = LevelBadge;

export default Badge;