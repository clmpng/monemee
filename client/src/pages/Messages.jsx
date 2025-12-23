import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { earningsService, messagesService } from '../services';
import styles from '../styles/pages/Messages.module.css';

/**
 * Messages Page - Real inbox + Smart Notifications
 */
function Messages() {
  const { user } = useAuth();
  const { products, stats } = useProducts();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('inbox');
  
  // Inbox state
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingMessages, setLoadingMessages] = useState(true);
  
  // Selected message
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  // Notifications state
  const [earnings, setEarnings] = useState(null);
  const [level, setLevel] = useState(null);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  // Fetch inbox messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const response = await messagesService.getInbox();
        if (response.success) {
          setMessages(response.data.messages || []);
          setUnreadCount(response.data.unreadCount || 0);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, []);

  // Fetch notification data
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
        setLoadingNotifications(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min.`;
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
    return date.toLocaleDateString('de-DE');
  };

  // Handle mark as read
  const handleMarkAsRead = async (messageId) => {
    try {
      await messagesService.markAsRead(messageId);
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, is_read: true } : m
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await messagesService.markAllAsRead();
      setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  // Handle archive
  const handleArchive = async (messageId) => {
    try {
      await messagesService.archiveMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      setSelectedMessage(null);
    } catch (err) {
      console.error('Error archiving message:', err);
    }
  };

  // Handle delete
  const handleDelete = async (messageId) => {
    try {
      await messagesService.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      setSelectedMessage(null);
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  // Open message
  const handleOpenMessage = (message) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      handleMarkAsRead(message.id);
    }
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
  }, [earnings, level, products, stats, user, formatCurrency]);

  const tabs = [
    { id: 'inbox', label: 'Posteingang', icon: 'inbox', count: unreadCount },
    { id: 'notifications', label: 'Updates', icon: 'bell', count: 0 }
  ];

  const loading = activeTab === 'inbox' ? loadingMessages : loadingNotifications;

  return (
    <div className={`page ${styles.messagesPage}`}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Nachrichten</h1>
        {activeTab === 'inbox' && unreadCount > 0 && (
          <button 
            className={styles.markAllButton}
            onClick={handleMarkAllAsRead}
          >
            <Icon name="checkCircle" size="sm" />
            Alle gelesen
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon name={tab.icon} size="sm" />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={styles.tabBadge}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p>Wird geladen...</p>
        </div>
      ) : (
        <>
          {activeTab === 'inbox' && (
            <div className={styles.inboxContent}>
              {messages.length > 0 ? (
                <div className={styles.messagesList}>
                  {messages.map((message) => (
                    <MessageItem
                      key={message.id}
                      message={message}
                      onClick={() => handleOpenMessage(message)}
                      formatRelativeTime={formatRelativeTime}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <Icon name="inbox" size={48} />
                  </div>
                  <h3>Keine Nachrichten</h3>
                  <p>Wenn Besucher deines Stores dir schreiben, erscheinen die Nachrichten hier.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className={styles.notificationsContent}>
              {notifications.length > 0 ? (
                <div className={styles.notificationsList}>
                  {notifications.map((n) => (
                    <NotificationCard key={n.id} notification={n} />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <Icon name="bell" size={48} />
                  </div>
                  <h3>Keine Updates</h3>
                  <p>Deine Benachrichtigungen erscheinen hier.</p>
                </div>
              )}

              {/* Quick Stats */}
              <div className={styles.quickStats}>
                <h3 className={styles.quickStatsTitle}>Dein Überblick</h3>
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <p className={styles.statValue}>{stats.totalProducts}</p>
                    <p className={styles.statLabel}>Produkte</p>
                  </div>
                  <div className={styles.statItem}>
                    <p className={styles.statValue}>{stats.totalSales}</p>
                    <p className={styles.statLabel}>Verkäufe</p>
                  </div>
                  <div className={styles.statItem}>
                    <p className={styles.statValue}>{stats.totalViews}</p>
                    <p className={styles.statLabel}>Views</p>
                  </div>
                  <div className={styles.statItem}>
                    <p className={`${styles.statValue} ${styles.statValueSuccess}`}>
                      {formatCurrency(earnings?.total || 0)}
                    </p>
                    <p className={styles.statLabel}>Verdient</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className={styles.modalOverlay} onClick={() => setSelectedMessage(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <button 
                className={styles.modalBack}
                onClick={() => setSelectedMessage(null)}
              >
                <Icon name="chevronLeft" size="md" />
              </button>
              <h2>Nachricht</h2>
              <div className={styles.modalActions}>
                <button 
                  className={styles.modalAction}
                  onClick={() => handleArchive(selectedMessage.id)}
                  title="Archivieren"
                >
                  <Icon name="archive" size="sm" />
                </button>
                <button 
                  className={`${styles.modalAction} ${styles.modalActionDanger}`}
                  onClick={() => handleDelete(selectedMessage.id)}
                  title="Löschen"
                >
                  <Icon name="trash" size="sm" />
                </button>
              </div>
            </div>
            
            <div className={styles.modalContent}>
              {/* Sender Info */}
              <div className={styles.senderInfo}>
                <div className={styles.senderAvatar}>
                  {selectedMessage.sender_avatar ? (
                    <img src={selectedMessage.sender_avatar} alt={selectedMessage.sender_name} />
                  ) : (
                    <span>
                      {selectedMessage.sender_name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div className={styles.senderDetails}>
                  <h3>{selectedMessage.sender_name}</h3>
                  <p>{selectedMessage.sender_email}</p>
                </div>
                <span className={styles.messageTime}>
                  {formatRelativeTime(selectedMessage.created_at)}
                </span>
              </div>
              
              {/* Subject */}
              {selectedMessage.subject && (
                <div className={styles.messageSubject}>
                  {selectedMessage.subject}
                </div>
              )}
              
              {/* Product Reference */}
              {selectedMessage.product_title && (
                <div className={styles.productRef}>
                  <Icon name="package" size="sm" />
                  <span>Bezug: {selectedMessage.product_title}</span>
                </div>
              )}
              
              {/* Message Body */}
              <div className={styles.messageBody}>
                {selectedMessage.message}
              </div>
              
              {/* Reply Button */}
              <a 
                href={`mailto:${selectedMessage.sender_email}?subject=Re: Deine Nachricht auf MoneMee`}
                className={styles.replyButton}
              >
                <Icon name="reply" size="sm" />
                Per E-Mail antworten
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Message Item Component
 */
function MessageItem({ message, onClick, formatRelativeTime }) {
  const getInitial = (name) => {
    return name?.charAt(0).toUpperCase() || '?';
  };

  return (
    <div 
      className={`${styles.messageItem} ${!message.is_read ? styles.messageUnread : ''}`}
      onClick={onClick}
    >
      <div className={styles.messageAvatar}>
        {message.sender_avatar ? (
          <img src={message.sender_avatar} alt={message.sender_name} />
        ) : (
          <span>{getInitial(message.sender_name)}</span>
        )}
        {!message.is_read && <span className={styles.unreadDot} />}
      </div>
      
      <div className={styles.messageContent}>
        <div className={styles.messageHeader}>
          <span className={styles.messageSender}>{message.sender_name}</span>
          <span className={styles.messageDate}>{formatRelativeTime(message.created_at)}</span>
        </div>
        {message.subject && (
          <p className={styles.messageSubjectPreview}>{message.subject}</p>
        )}
        <p className={styles.messagePreview}>{message.message}</p>
      </div>
      
      <Icon name="chevronRight" size="sm" className={styles.messageArrow} />
    </div>
  );
}

/**
 * Notification Card Component
 */
function NotificationCard({ notification }) {
  const colors = {
    success: 'var(--color-success)',
    info: 'var(--color-primary)',
    progress: 'var(--color-warning)',
    sale: 'var(--color-success)'
  };
  
  const bgColors = {
    success: 'rgba(16, 185, 129, 0.15)',
    info: 'rgba(99, 102, 241, 0.15)',
    progress: 'rgba(245, 158, 11, 0.15)',
    sale: 'rgba(16, 185, 129, 0.15)'
  };

  return (
    <div className={styles.notificationCard}>
      <div 
        className={styles.notificationIcon}
        style={{ 
          background: bgColors[notification.type], 
          color: colors[notification.type] 
        }}
      >
        <Icon name={notification.icon} size="md" />
      </div>
      <div className={styles.notificationContent}>
        <p className={styles.notificationMessage}>{notification.message}</p>
        <p className={styles.notificationTime}>{notification.time}</p>
      </div>
    </div>
  );
}

export default Messages;
