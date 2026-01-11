import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Icon } from '../common';
import styles from '../../styles/components/Sidebar.module.css';

function Sidebar({ user }) {
  const [avatarError, setAvatarError] = useState(false);

  const navItems = [
    { path: '/', icon: 'store', label: 'Meine Produkte' },
    { path: '/earnings', icon: 'wallet', label: 'Fortschritt' },
    { path: '/promotion', icon: 'megaphone', label: 'Promotion' },
    { path: '/messages', icon: 'message', label: 'Nachrichten' },
  ];

  const secondaryItems = [
    { path: '/settings', icon: 'settings', label: 'Einstellungen' },
  ];

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

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoIcon}>
          <Icon name="dollarCircle" size="lg" />
        </span>
        <span className={styles.logoText}>MoneMee</span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {/* Main Navigation */}
        <div className={styles.navSection}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <span className={styles.navIcon}>
                <Icon name={item.icon} size="md" />
              </span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Secondary Navigation */}
        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>Einstellungen</div>
          {secondaryItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <span className={styles.navIcon}>
                <Icon name={item.icon} size="md" />
              </span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Section - Links to Account Settings */}
      <div className={styles.userSection}>
        <Link
          to="/settings?tab=account"
          className={styles.userCard}
        >
          <div className={styles.userAvatar}>
            {user?.avatar && !avatarError ? (
              <img
                src={user.avatar}
                alt={user.name}
                className={styles.userAvatarImage}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className={styles.userAvatarInitials}>
                {getInitials(user?.name)}
              </span>
            )}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.name || 'User'}</div>
            <div className={styles.userRole}>
              {user?.role === 'both' ? 'Creator & Promoter' :
               user?.role === 'creator' ? 'Creator' : 'Promoter'}
            </div>
          </div>
          <span className={styles.userMenuIcon}>
            <Icon name="chevronRight" size="sm" />
          </span>
        </Link>
      </div>

      {/* Legal Links */}
      <div className={styles.sidebarFooter}>
        <nav className={styles.legalLinks}>
          <NavLink to="/impressum" className={styles.legalLink}>Impressum</NavLink>
          <NavLink to="/datenschutz" className={styles.legalLink}>Datenschutz</NavLink>
          <NavLink to="/agb" className={styles.legalLink}>AGB</NavLink>
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
