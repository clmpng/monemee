import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '../common';
import styles from '../../styles/components/Header.module.css';

// Route zu Seitentitel Mapping
const PAGE_TITLES = {
  '/dashboard': 'Store',
  '/earnings': 'Fortschritt',
  '/promotion': 'Promotion',
  '/settings': 'Einstellungen',
  '/messages': 'Nachrichten',
  '/products/new': 'Neues Produkt',
  '/dashboard/purchases': 'Meine Käufe'
};

function Header({ user }) {
  const [avatarError, setAvatarError] = useState(false);
  const location = useLocation();

  // Seitentitel basierend auf Route ermitteln
  const getPageTitle = () => {
    // Exakte Übereinstimmung prüfen
    if (PAGE_TITLES[location.pathname]) {
      return PAGE_TITLES[location.pathname];
    }
    // Produkt bearbeiten Route
    if (location.pathname.match(/^\/products\/\d+\/edit$/)) {
      return 'Produkt bearbeiten';
    }
    // Fallback
    return 'MoneMee';
  };

  // Get initials from user name (max 2 characters)
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Reset avatar error when user avatar changes
  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

  const pageTitle = getPageTitle();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* Logo + Seitentitel */}
        <div className={styles.titleSection}>
          <Link to="/dashboard" className={styles.logoIcon}>
            <Icon name="dollarCircle" size="lg" />
          </Link>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Messages */}
          <Link to="/messages" className={styles.iconButton} title="Nachrichten">
            <Icon name="message" size="md" />
          </Link>

          {/* User Avatar - Links to Account Settings */}
          <Link to="/settings?tab=account" className={styles.avatar} aria-label="Account-Einstellungen">
            {user?.avatar && !avatarError ? (
              <img
                src={user.avatar}
                alt={user.name}
                className={styles.avatarImage}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className={styles.avatarInitials}>
                {getInitials(user?.name)}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
