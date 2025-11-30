import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/components/Header.module.css';

function Header({ user }) {
  // Get initials from user name
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>💸</span>
          <span className={styles.logoText}>MoneMee</span>
        </Link>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Notifications */}
          <button className={styles.iconButton} title="Benachrichtigungen">
            🔔
            {/* <span className={styles.notificationDot} /> */}
          </button>

          {/* User Avatar */}
          <Link to="/settings" className={styles.avatar} title="Einstellungen">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className={styles.avatarImage} />
            ) : (
              getInitials(user?.name || 'User')
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;