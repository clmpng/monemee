import React, { useState, useEffect } from 'react';
import { Modal, Icon } from '../common';
import { 
  PAYOUT_CONFIG, 
  calculatePayoutFee, 
  calculateNetPayout,
  canRequestPayout 
} from '../../config/platform.config';
import styles from '../../styles/components/PayoutModal.module.css';

/**
 * Payout Modal
 * Ermöglicht Auszahlungen mit Gebührenberechnung
 */
function PayoutModal({ 
  isOpen, 
  onClose, 
  availableBalance = 0,
  onRequestPayout,
  loading = false 
}) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  
  // Reset bei Öffnen
  useEffect(() => {
    if (isOpen) {
      setAmount(availableBalance > 0 ? availableBalance.toFixed(2) : '');
      setError(null);
    }
  }, [isOpen, availableBalance]);
  
  const numericAmount = parseFloat(amount) || 0;
  const fee = calculatePayoutFee(numericAmount);
  const netAmount = calculateNetPayout(numericAmount);
  const validation = canRequestPayout(availableBalance, numericAmount);
  
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(',', '.');
    // Nur Zahlen und ein Dezimalpunkt erlauben
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setAmount(value);
      setError(null);
    }
  };
  
  const handleMaxClick = () => {
    setAmount(availableBalance.toFixed(2));
  };
  
  const handleSubmit = async () => {
    if (!validation.allowed) {
      setError(validation.reason);
      return;
    }
    
    try {
      await onRequestPayout(numericAmount);
      onClose();
    } catch (err) {
      setError(err.message || 'Auszahlung fehlgeschlagen');
    }
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Auszahlung anfordern"
      size="default"
      footer={
        <>
          <button 
            className={styles.cancelButton}
            onClick={onClose}
            disabled={loading}
          >
            Abbrechen
          </button>
          <button 
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={loading || !validation.allowed || numericAmount <= 0}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                Wird bearbeitet...
              </>
            ) : (
              <>
                <Icon name="wallet" size="sm" />
                {netAmount > 0 ? `${formatCurrency(netAmount)} auszahlen` : 'Auszahlen'}
              </>
            )}
          </button>
        </>
      }
    >
      <div className={styles.content}>
        {/* Verfügbares Guthaben */}
        <div className={styles.balanceInfo}>
          <span className={styles.balanceLabel}>Verfügbares Guthaben</span>
          <span className={styles.balanceValue}>{formatCurrency(availableBalance)}</span>
        </div>
        
        {/* Betrag eingeben */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Auszahlungsbetrag</label>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0,00"
              className={styles.input}
              disabled={loading}
            />
            <span className={styles.inputSuffix}>€</span>
            <button 
              className={styles.maxButton}
              onClick={handleMaxClick}
              disabled={loading || availableBalance <= 0}
            >
              Max
            </button>
          </div>
        </div>
        
        {/* Gebührenberechnung */}
        {numericAmount > 0 && (
          <div className={styles.calculation}>
            <div className={styles.calcRow}>
              <span>Auszahlungsbetrag</span>
              <span>{formatCurrency(numericAmount)}</span>
            </div>
            <div className={`${styles.calcRow} ${fee > 0 ? styles.feeRow : ''}`}>
              <span>
                Gebühr
                {numericAmount < PAYOUT_CONFIG.minFreePayoutAmount && (
                  <span className={styles.feeHint}>
                    (kostenlos ab {PAYOUT_CONFIG.minFreePayoutAmount}€)
                  </span>
                )}
              </span>
              <span className={fee > 0 ? styles.feeAmount : styles.freeAmount}>
                {fee > 0 ? `- ${formatCurrency(fee)}` : 'Kostenlos'}
              </span>
            </div>
            <div className={`${styles.calcRow} ${styles.totalRow}`}>
              <span>Du erhältst</span>
              <span className={styles.netAmount}>{formatCurrency(netAmount)}</span>
            </div>
          </div>
        )}
        
        {/* Fehler */}
        {error && (
          <div className={styles.error}>
            <Icon name="alertCircle" size="sm" />
            {error}
          </div>
        )}
        
        {/* Info */}
        <div className={styles.infoBox}>
          <Icon name="clock" size="sm" />
          <p>
            Auszahlungen werden innerhalb von {PAYOUT_CONFIG.processingDays} Werktagen bearbeitet.
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default PayoutModal;
