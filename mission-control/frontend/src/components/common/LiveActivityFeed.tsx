import { useState, useEffect, useCallback } from 'react';
import { useWebSocketContext } from '../../context/WebSocketContext';
import { Activity, Users, ShoppingCart, DollarSign, AlertTriangle, Package, Zap } from 'lucide-react';

interface ActivityEvent {
  type: string;
  data: any;
  timestamp: string;
}

interface LiveActivityFeedProps {
  maxItems?: number;
  height?: string;
  showFilters?: boolean;
}

export default function LiveActivityFeed({
  maxItems = 20,
  height = '400px',
  showFilters = true
}: LiveActivityFeedProps) {
  const { isConnected, lastMessage, subscribe, unsubscribe } = useWebSocketContext();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isPaused, setIsPaused] = useState(false);

  // Subscribe to channels on mount
  useEffect(() => {
    const channels = ['users', 'transactions', 'products', 'payments', 'security', 'alerts'];
    channels.forEach(channel => subscribe(channel));

    return () => {
      channels.forEach(channel => unsubscribe(channel));
    };
  }, [subscribe, unsubscribe]);

  // Handle incoming messages
  useEffect(() => {
    if (!lastMessage || isPaused) return;

    // Filter out system messages
    if (['connected', 'subscribed', 'unsubscribed', 'pong', 'ack'].includes(lastMessage.type)) {
      return;
    }

    // Handle history messages
    if (lastMessage.type === 'history' && Array.isArray(lastMessage.data)) {
      setActivities(prev => {
        const combined = [...lastMessage.data, ...prev];
        const unique = Array.from(new Map(combined.map(item => [item.timestamp, item])).values());
        return unique.slice(0, maxItems);
      });
      return;
    }

    // Add new event
    const newEvent: ActivityEvent = {
      type: lastMessage.type,
      data: lastMessage.data,
      timestamp: lastMessage.timestamp || new Date().toISOString()
    };

    setActivities(prev => {
      const updated = [newEvent, ...prev].slice(0, maxItems);
      return updated;
    });
  }, [lastMessage, isPaused, maxItems]);

  // Get icon for event type
  const getEventIcon = (type: string) => {
    if (type.includes('user')) return <Users size={18} style={{ color: 'var(--color-primary-light)' }} />;
    if (type.includes('transaction') || type.includes('sale')) return <ShoppingCart size={18} style={{ color: 'var(--color-success-light)' }} />;
    if (type.includes('product')) return <Package size={18} style={{ color: '#A78BFA' }} />;
    if (type.includes('payment') || type.includes('payout')) return <DollarSign size={18} style={{ color: 'var(--color-warning-light)' }} />;
    if (type.includes('security') || type.includes('alert')) return <AlertTriangle size={18} style={{ color: 'var(--color-danger-light)' }} />;
    if (type.includes('performance')) return <Zap size={18} style={{ color: 'var(--color-warning)' }} />;
    return <Activity size={18} style={{ color: 'var(--color-text-tertiary)' }} />;
  };

  // Get severity styles
  const getSeverityStyles = (severity?: string): React.CSSProperties => {
    switch (severity) {
      case 'critical': return { backgroundColor: 'var(--color-danger-50)', borderColor: 'rgba(239, 68, 68, 0.3)' };
      case 'high': return { backgroundColor: 'var(--color-warning-50)', borderColor: 'rgba(245, 158, 11, 0.3)' };
      case 'medium': return { backgroundColor: 'var(--color-warning-50)', borderColor: 'rgba(245, 158, 11, 0.2)' };
      case 'low': return { backgroundColor: 'var(--color-primary-50)', borderColor: 'rgba(59, 130, 246, 0.3)' };
      default: return { backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)' };
    }
  };

  // Format event title
  const getEventTitle = (event: ActivityEvent) => {
    const typeMap: { [key: string]: string } = {
      'user.created': 'Neuer User',
      'user.level_up': 'Level-Up',
      'transaction.created': 'Neuer Verkauf',
      'transaction.completed': 'Transaktion abgeschlossen',
      'product.created': 'Neues Produkt',
      'product.published': 'Produkt veröffentlicht',
      'payment.failed': 'Zahlung fehlgeschlagen',
      'payout.requested': 'Auszahlungsanfrage',
      'payout.completed': 'Auszahlung abgeschlossen',
      'security.alert': 'Sicherheitswarnung',
      'security.failed_login': 'Login fehlgeschlagen',
      'performance.alert': 'Performance-Warnung',
      'performance.slow_query': 'Langsame Query',
      'alert': 'Warnung'
    };

    return typeMap[event.type] || event.type.replace(/\./g, ' ').replace(/_/g, ' ');
  };

  // Filter activities
  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.type.includes(filter));

  // Clear activities
  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  return (
    <div className="card">
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-md)' }}>
        <div className="flex items-center gap-sm">
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Live Activity Feed
          </h3>
          <div className="flex items-center gap-xs">
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isConnected ? 'var(--color-success)' : 'var(--color-danger)',
              }}
            ></div>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-xs">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="btn btn-ghost btn-sm"
            style={{ color: isPaused ? 'var(--color-warning-light)' : undefined }}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={clearActivities}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--color-danger-light)' }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex gap-xs" style={{ marginBottom: 'var(--spacing-md)', overflowX: 'auto', paddingBottom: 'var(--spacing-sm)' }}>
          {['all', 'user', 'transaction', 'product', 'payment', 'security', 'alert'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                backgroundColor: filter === f ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                color: filter === f ? 'white' : 'var(--color-text-secondary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Activity List */}
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', overflowY: 'auto', paddingRight: 'var(--spacing-sm)', maxHeight: height }}
      >
        {filteredActivities.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--spacing-2xl)',
              color: 'var(--color-text-muted)',
            }}
          >
            <Activity size={48} style={{ marginBottom: 'var(--spacing-md)', opacity: 0.5 }} />
            <p style={{ fontSize: 'var(--font-size-sm)' }}>
              {isPaused ? 'Feed is paused' : 'Waiting for activity...'}
            </p>
          </div>
        ) : (
          filteredActivities.map((event, index) => (
            <div
              key={`${event.timestamp}-${index}`}
              style={{
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid',
                transition: 'all var(--transition-fast)',
                ...getSeverityStyles(event.data?.severity),
              }}
            >
              <div className="flex items-start gap-sm">
                <div style={{ marginTop: '2px' }}>{getEventIcon(event.type)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-xs)' }}>
                    <p style={{ fontWeight: 500, color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}>
                      {getEventTitle(event)}
                    </p>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', marginLeft: 'var(--spacing-sm)' }}>
                      {new Date(event.timestamp).toLocaleTimeString('de-DE')}
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', wordBreak: 'break-word' }}>
                    {event.data?.message || JSON.stringify(event.data)}
                  </p>
                  {event.data?.details && (
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-xs)', fontFamily: 'var(--font-family-mono)' }}>
                      {typeof event.data.details === 'string'
                        ? event.data.details
                        : JSON.stringify(event.data.details)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div
        className="flex items-center justify-between"
        style={{
          marginTop: 'var(--spacing-md)',
          paddingTop: 'var(--spacing-md)',
          borderTop: '1px solid var(--color-border)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-tertiary)',
        }}
      >
        <span>{filteredActivities.length} activities</span>
        <span>{isPaused && 'Paused'}</span>
      </div>
    </div>
  );
}
