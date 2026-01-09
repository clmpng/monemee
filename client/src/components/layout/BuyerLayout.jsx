import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Icon } from '../common';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/components/BuyerLayout.module.css';

/**
 * Buyer Layout
 * Minimales Layout für User, die nur Käufe haben (keine eigenen Produkte)
 * Zeigt nur: Logo, Käufe-Link, Logout
 */
function BuyerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className={styles.container}>
      {/* Simple Header */}
      <header className={styles.header}>
        <Link to="/dashboard/purchases" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Icon name="dollarCircle" size={20} />
          </div>
          <span className={styles.logoText}>Monemee</span>
        </Link>

        <div className={styles.headerRight}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || 'User'}</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <Icon name="logOut" size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* Upgrade Hint */}
      <div className={styles.upgradeHint}>
        <Icon name="sparkles" size={16} />
        <span>Du möchtest selbst verkaufen?</span>
        <Link to="/products/new" className={styles.upgradeLink}>
          Produkt erstellen
        </Link>
      </div>
    </div>
  );
}

export default BuyerLayout;
