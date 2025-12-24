import React from 'react';
import { Icon } from '../common';
import { getStatusLabel, getStatusColor } from '../../config/platform.config';
import styles from '../../styles/components/PayoutHistory.module.css';

/**
 * Payout History
 * Zeigt Liste der Auszahlungen
 */
function PayoutHistory({ payouts = [], loading = false, onCancel }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Lade Auszahlungen...</p>
      </div>
    );
  }

  if (payouts.length === 0) {
    return (
      <div className={styles.empty}>
        <Icon name="wallet" size="xl" />
        <p>Noch keine Auszahlungen</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {payouts.map((payout) => (
        <div key={payout.id} className={styles.item}>
          <div className={styles.itemMain}>
            <div className={styles.itemIcon}>
              <Icon 
                name={payout.status === 'completed' ? 'checkCircle' : 'clock'} 
                size="md" 
              />
            </div>
            <div className={styles.itemInfo}>
              <div className={styles.itemAmount}>
                {formatCurrency(payout.netAmount)}
              </div>
              <div className={styles.itemMeta}>
                <span 
                  className={styles.itemStatus}
                  style={{ color: getStatusColor(payout.status) }}
                >
                  {getStatusLabel(payout.status)}
                </span>
                <span className={styles.itemDate}>
                  {formatDate(payout.createdAt)}
                </span>
              </div>
              {payout.fee > 0 && (
                <div className={styles.itemFee}>
                  Gebühr: {formatCurrency(payout.fee)}
                </div>
              )}
            </div>
          </div>
          
          {payout.status === 'pending' && onCancel && (
            <button 
              className={styles.cancelButton}
              onClick={() => onCancel(payout.id)}
              title="Stornieren"
            >
              <Icon name="close" size="sm" />
            </button>
          )}
          
          {payout.referenceNumber && (
            <div className={styles.itemRef}>
              Ref: {payout.referenceNumber}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default PayoutHistory;
