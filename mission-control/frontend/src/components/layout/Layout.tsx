import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  BarChart3,
  Shield,
  Activity,
  TestTube2,
  Zap,
  Trophy,
  LogOut,
  ShieldAlert,
  Code,
  TrendingUp,
  Flag,
} from 'lucide-react';
import styles from '../../styles/components/Layout.module.css';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Users', to: '/users', icon: Users },
  { name: 'Content Reports', to: '/reports', icon: Flag },
  { name: 'Financial', to: '/financial', icon: DollarSign },
  { name: 'Analytics', to: '/analytics', icon: BarChart3 },
  { name: 'Leaderboards', to: '/leaderboards', icon: Trophy },
  { name: 'Security', to: '/security', icon: Shield },
  { name: 'Security Center', to: '/security-center', icon: ShieldAlert },
  { name: 'Developer Tools', to: '/devtools', icon: Code },
  { name: 'Business Intelligence', to: '/bi', icon: TrendingUp },
  { name: 'Performance', to: '/performance', icon: Activity },
  { name: 'Rules', to: '/rules', icon: Zap },
  { name: 'Tests', to: '/tests', icon: TestTube2 },
];

export default function Layout({ children, onLogout }: LayoutProps) {
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    onLogout();
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        {/* Logo */}
        <div className={styles.logo}>
          <h1 className={styles.logoText}>
            <span className={styles.logoIcon}>🚀</span>
            Mission Control
          </h1>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                    }
                  >
                    <Icon size={20} className={styles.navIcon} />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className={styles.logoutContainer}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerDate}>
            {new Date().toLocaleDateString('de-DE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div className={styles.headerStatus}>
            <span className={styles.statusDot}></span>
            <span className={styles.statusText}>System Online</span>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
