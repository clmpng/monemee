import React from 'react';

/**
 * Messages/Dashboard Page
 * Shows smart notifications and updates
 */
function Messages() {
  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: 'success',
      icon: '💰',
      message: 'Du hast heute 12,34€ verdient!',
      time: 'Vor 2 Stunden'
    },
    {
      id: 2,
      type: 'info',
      icon: '👁️',
      message: 'Dein Produkt hat 9 Views – willst du den 10. holen?',
      time: 'Vor 4 Stunden'
    },
    {
      id: 3,
      type: 'progress',
      icon: '⭐',
      message: 'Noch 266€ bis Level 3!',
      time: 'Heute'
    },
    {
      id: 4,
      type: 'sale',
      icon: '🎉',
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
          <div className="empty-state-icon">🔔</div>
          <h3 className="empty-state-title">Keine Benachrichtigungen</h3>
          <p className="empty-state-text">
            Hier erscheinen deine Updates und Neuigkeiten.
          </p>
        </div>
      )}
    </div>
  );
}

// Notification Card
function NotificationCard({ notification }) {
  const getTypeStyle = (type) => {
    switch (type) {
      case 'success':
        return { borderLeft: '3px solid var(--color-success)' };
      case 'sale':
        return { borderLeft: '3px solid var(--color-primary)' };
      case 'progress':
        return { borderLeft: '3px solid var(--color-warning)' };
      default:
        return { borderLeft: '3px solid var(--color-border-light)' };
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '16px',
      background: 'var(--color-bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      ...getTypeStyle(notification.type)
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-bg-tertiary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        flexShrink: 0
      }}>
        {notification.icon}
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