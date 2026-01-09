import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../common';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/components/Header.module.css';

function Header({ user }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const menuRef = useRef(null);

  // Get initials from user name (max 2 characters)
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset avatar error when user avatar changes
  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

  // Handle logout
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
      setShowUserMenu(false);
    }
  };

  // Navigate to settings
  const handleSettingsClick = () => {
    setShowUserMenu(false);
    navigate('/settings');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>
            <Icon name="dollarCircle" size="lg" />
          </span>
          <span className={styles.logoText}>MoneMee</span>
        </Link>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Notifications */}
          <button className={styles.iconButton} title="Benachrichtigungen">
            <Icon name="bell" size="md" />
          </button>

          {/* User Avatar & Menu */}
          <div className={styles.userMenuContainer} ref={menuRef}>
            <button 
              className={styles.avatar} 
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User Menu"
            >
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
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className={styles.userMenu}>
                {/* User Info */}
                <div className={styles.userMenuHeader}>
                  <div className={styles.userMenuAvatar}>
                    {user?.avatar && !avatarError ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <span>{getInitials(user?.name)}</span>
                    )}
                  </div>
                  <div className={styles.userMenuInfo}>
                    <div className={styles.userMenuName}>{user?.name || 'User'}</div>
                    <div className={styles.userMenuEmail}>{user?.email}</div>
                  </div>
                </div>

                <div className={styles.userMenuDivider} />

                {/* Menu Items */}
                <div className={styles.userMenuItems}>
                  <button className={styles.userMenuItem} onClick={handleSettingsClick}>
                    <Icon name="settings" size="sm" />
                    <span>Einstellungen</span>
                  </button>
                </div>

                <div className={styles.userMenuDivider} />

                {/* Logout */}
                <button 
                  className={`${styles.userMenuItem} ${styles.logoutItem}`}
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <Icon name="logout" size="sm" />
                  <span>{loggingOut ? 'Abmelden...' : 'Abmelden'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
