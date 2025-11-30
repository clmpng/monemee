import React from 'react';
import { Icon } from '../components/common';

/**
 * Messages/Dashboard Page
 */
function Messages() {
  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: 'success',
      icon: 'wallet',
      message: 'Du hast heute 12,34€ verdient!',
      time: 'Vor 2 Stunden'
    },
    {
      id: 2,
      type: 'info',
      icon: 'eye',
      message: 'Dein Produkt hat 9 Views – willst du den 10. holen?',
      time: 'Vor 4 Stunden'
    },
    {
      id: 3,
      type: 'progress',
      icon: 'star',
      message: 'Noch 266€ bis Level 3!',
      time: 'Heute'
    },
    {
      id: 4,
      type: 'sale',
      icon: 'party',
      message: 'Neuer Verkauf: Ultimate Productivity Guide für 29,99€',
      time: 'Gestern'
    }
  ];

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Nachrichten</h1>
        <p className="page-subtitle">Deine Updates und Benachrichtigungen</p>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </div>

      {/* Empty State (wenn keine Notifications) */}
      {notifications.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Icon name="bell" size="xxl" />
          </div>
          <h3 className="empty-state-title">Keine Benachrichtigungen</h3>
          <p className="empty-state-text">
            Hier erscheinen deine Updates und Neuigkeiten.
          </p>
        </div>
      )}
    </div>
  );
}

// Notification Card Component
function NotificationCard({ notification }) {
  const typeColors = {
    success: 'var(--color-success)',
    info: 'var(--color-primary)',
    progress: 'var(--color-warning)',
    sale: 'var(--color-success)'
  };

  const typeBgColors = {
    success: 'rgba(16, 185, 129, 0.15)',
    info: 'rgba(99, 102, 241, 0.15)',
    progress: 'rgba(245, 158, 11, 0.15)',
    sale: 'rgba(16, 185, 129, 0.15)'
  };

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '16px',
      background: 'var(--color-bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: 'var(--radius-md)',
        background: typeBgColors[notification.type] || typeBgColors.info,
        color: typeColors[notification.type] || typeColors.info,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon name={notification.icon} size="md" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ 
          fontSize: '14px', 
          color: 'var(--color-text-primary)',
          marginBottom: '4px',
          lineHeight: '1.4'
        }}>
          {notification.message}
        </p>
        <p style={{ 
          fontSize: '12px', 
          color: 'var(--color-text-tertiary)'
        }}>
          {notification.time}
        </p>
      </div>
    </div>
  );
}

export default Messages;