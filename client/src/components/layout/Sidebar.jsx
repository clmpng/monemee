import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '../common';
import styles from '../../styles/components/Sidebar.module.css';

function Sidebar({ user }) {
  const navItems = [
    { path: '/', icon: 'store', label: 'My Store' },
    { path: '/earnings', icon: 'wallet', label: 'Statistiken' },
    { path: '/promotion', icon: 'megaphone', label: 'Promotion' },
    { path: '/messages', icon: 'message', label: 'Nachrichten' },
  ];

  const secondaryItems = [
    { path: '/settings', icon: 'settings', label: 'Einstellungen' },
  ];

  // Get initials from user name
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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

      {/* User Section */}
      <div className={styles.userSection}>
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            {getInitials(user?.name || 'User')}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.name || 'User'}</div>
            <div className={styles.userRole}>Creator</div>
          </div>
          <span className={styles.userMenuIcon}>
            <Icon name="moreVertical" size="sm" />
          </span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;