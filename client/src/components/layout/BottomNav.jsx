import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../../styles/components/BottomNav.module.css';

function BottomNav() {
  const navItems = [
    { path: '/', icon: '🏪', label: 'Store' },
    { path: '/earnings', icon: '📊', label: 'Statistiken' },
    { path: '/promotion', icon: '📣', label: 'Promotion' },
    { path: '/messages', icon: '💬', label: 'Nachrichten' },
  ];

  return (
    <nav className={styles.bottomNav}>
      <div className={styles.navContent}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className={styles.activeIndicator} />}
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;