import React from 'react';
import styles from '../../styles/components/Card.module.css';

/**
 * Reusable Card Component
 */
function Card({
  children,
  padding = 'medium',
  clickable = false,
  elevated = false,
  highlight = false,
  onClick,
  className = '',
  ...props
}) {
  const classNames = [
    styles.card,
    padding === 'none' && styles.noPadding,
    padding === 'small' && styles.smallPadding,
    padding === 'medium' && styles.padding,
    padding === 'large' && styles.largePadding,
    clickable && styles.clickable,
    elevated && styles.elevated,
    highlight && styles.highlight,
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={classNames} 
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

// Card Header
function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`${styles.header} ${className}`}>
      <div>
        <h3 className={styles.headerTitle}>{title}</h3>
        {subtitle && <p className={styles.headerSubtitle}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// Card Body
function CardBody({ children, className = '' }) {
  return (
    <div className={`${styles.body} ${className}`}>
      {children}
    </div>
  );
}

// Card Footer
function CardFooter({ children, className = '' }) {
  return (
    <div className={`${styles.footer} ${className}`}>
      {children}
    </div>
  );
}

// Stats Card
function StatsCard({ label, value, change, changeType = 'neutral', icon, className = '' }) {
  return (
    <Card className={`${styles.statsCard} ${className}`}>
      {icon && <div className={styles.statsIcon}>{icon}</div>}
      <p className={styles.statsLabel}>{label}</p>
      <p className={styles.statsValue}>{value}</p>
      {change && (
        <p className={`${styles.statsChange} ${changeType === 'positive' ? styles.statsChangePositive : changeType === 'negative' ? styles.statsChangeNegative : ''}`}>
          {change}
        </p>
      )}
    </Card>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Stats = StatsCard;

export default Card;