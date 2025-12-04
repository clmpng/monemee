import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { earningsService } from '../services';

/**
 * Messages/Dashboard Page - Smart Notifications based on real user data
 */
function Messages() {
  const { user } = useAuth();
  const { products, stats } = useProducts();
  const [earnings, setEarnings] = useState(null);
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, levelRes] = await Promise.all([
          earningsService.getDashboard(),
          earningsService.getLevelInfo()
        ]);
        if (dashboardRes.success) setEarnings(dashboardRes.data);
        if (levelRes.success) setLevel(levelRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  };

  // Generate dynamic notifications
  const notifications = useMemo(() => {
    const notifs = [];
    
    if (earnings?.thisMonth > 0) {
      notifs.push({
        id: 'earnings', type: 'success', icon: 'wallet',
        message: `Du hast diesen Monat ${formatCurrency(earnings.thisMonth)} verdient!`,
        time: 'Dieser Monat', priority: 1
      });
    }

    if (level?.nextLevel) {
      const remaining = level.nextLevel - level.progress;
      if (remaining > 0 && remaining < 100) {
        notifs.push({
          id: 'level-close', type: 'progress', icon: 'star',
          message: `Noch ${formatCurrency(remaining)} bis Level ${level.current + 1}!`,
          time: 'Level-Fortschritt', priority: 2
        });
      }
    }

    const highViewProducts = products.filter(p => p.views >= 5 && p.views < 10);
    if (highViewProducts.length > 0) {
      notifs.push({
        id: 'views', type: 'info', icon: 'eye',
        message: `"${highViewProducts[0].title}" hat ${highViewProducts[0].views} Views!`,
        time: 'Produkt-Update', priority: 3
      });
    }

    if (stats.totalSales === 1) {
      notifs.push({
        id: 'first-sale', type: 'sale', icon: 'party',
        message: 'Glückwunsch zu deinem ersten Verkauf! 🎉',
        time: 'Meilenstein', priority: 1
      });
    }

    if (earnings?.change > 0) {
      notifs.push({
        id: 'growth', type: 'success', icon: 'trendingUp',
        message: `Deine Einnahmen sind um ${earnings.change}% gestiegen!`,
        time: 'vs. letzter Monat', priority: 3
      });
    }

    if (products.length === 0) {
      notifs.push({
        id: 'no-products', type: 'info', icon: 'package',
        message: 'Erstelle dein erstes Produkt und starte mit dem Verdienen!',
        time: 'Tipp', priority: 1
      });
    }

    const draftProducts = products.filter(p => p.status === 'draft');
    if (draftProducts.length > 0) {
      notifs.push({
        id: 'drafts', type: 'info', icon: 'edit',
        message: `Du hast ${draftProducts.length} Produkt${draftProducts.length > 1 ? 'e' : ''} im Entwurf.`,
        time: 'Erinnerung', priority: 4
      });
    }

    if (!earnings?.total && products.length === 0) {
      notifs.push({
        id: 'welcome', type: 'info', icon: 'sparkles',
        message: `Willkommen bei MoneMee, ${user?.name?.split(' ')[0] || 'Creator'}!`,
        time: 'Willkommen', priority: 0
      });
    }

    return notifs.sort((a, b) => a.priority - b.priority).slice(0, 8);
  }, [earnings, level, products, stats, user]);

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Nachrichten</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-secondary)' }}>
          Wird geladen...
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Nachrichten</h1>
        <p className="page-subtitle">Deine Updates und Benachrichtigungen</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.map((n) => (
          <NotificationCard key={n.id} notification={n} />
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="empty-state">
          <Icon name="bell" size="xxl" />
          <h3>Keine Benachrichtigungen</h3>
        </div>
      )}

      {/* Quick Stats */}
      <div style={{
        marginTop: '32px', padding: '20px',
        background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Dein Überblick</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>{stats.totalProducts}</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Produkte</p>
          </div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>{stats.totalSales}</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Verkäufe</p>
          </div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>{stats.totalViews}</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Views</p>
          </div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-success)' }}>
              {formatCurrency(earnings?.total || 0)}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Verdient</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationCard({ notification }) {
  const colors = {
    success: 'var(--color-success)', info: 'var(--color-primary)',
    progress: 'var(--color-warning)', sale: 'var(--color-success)'
  };
  const bgColors = {
    success: 'rgba(16, 185, 129, 0.15)', info: 'rgba(99, 102, 241, 0.15)',
    progress: 'rgba(245, 158, 11, 0.15)', sale: 'rgba(16, 185, 129, 0.15)'
  };

  return (
    <div style={{
      display: 'flex', gap: '12px', padding: '16px',
      background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)'
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
        background: bgColors[notification.type], color: colors[notification.type],
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <Icon name={notification.icon} size="md" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '14px', marginBottom: '4px', lineHeight: '1.4' }}>{notification.message}</p>
        <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{notification.time}</p>
      </div>
    </div>
  );
}

export default Messages;