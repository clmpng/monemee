import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '../common';
import styles from '../../styles/components/BottomNav.module.css';

function BottomNav() {
  const navItems = [
    { path: '/', icon: 'store', label: 'Store' },
    { path: '/earnings', icon: 'chart', label: 'Statistiken' },
    { path: '/promotion', icon: 'megaphone', label: 'Promotion' },
    { path: '/messages', icon: 'message', label: 'Nachrichten' },
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
                <span className={styles.navIcon}>
                  <Icon name={item.icon} size="md" />
                </span>
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