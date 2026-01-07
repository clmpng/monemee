import React, { useState } from 'react';
import { Icon, Button } from '../common';
import styles from '../../styles/components/SellerTypeModal.module.css';

/**
 * Seller Type Modal
 * Wird nach erfolgreichem Stripe-Onboarding angezeigt
 * Fragt ob der Nutzer privat oder gewerblich verkauft
 */
function SellerTypeModal({ isOpen, onClose, onSelect, loading = false, error = null }) {
  const [selectedType, setSelectedType] = useState(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedType) {
      onSelect(selectedType);
    }
  };

  const handleClose = () => {
    if (!loading && onClose) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          disabled={loading}
          aria-label="Schließen"
        >
          <Icon name="x" size={20} />
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Icon name="checkCircle" size={32} />
          </div>
          <h2 className={styles.title}>Stripe eingerichtet!</h2>
          <p className={styles.subtitle}>
            Nur noch eine kurze Frage, dann kannst du loslegen.
          </p>
        </div>

        {/* Question */}
        <div className={styles.content}>
          <h3 className={styles.question}>Verkaufst du gewerblich?</h3>
          
          <div className={styles.options}>
            {/* Private Option */}
            <button
              type="button"
              className={`${styles.option} ${selectedType === 'private' ? styles.selected : ''}`}
              onClick={() => setSelectedType('private')}
            >
              <div className={styles.optionIcon}>
                <Icon name="user" size="lg" />
              </div>
              <div className={styles.optionContent}>
                <span className={styles.optionTitle}>Nein, privat</span>
                <span className={styles.optionDesc}>
                  Ich verkaufe als Privatperson
                </span>
              </div>
              <div className={styles.optionCheck}>
                {selectedType === 'private' && <Icon name="check" size="sm" />}
              </div>
            </button>

            {/* Business Option */}
            <button
              type="button"
              className={`${styles.option} ${selectedType === 'business' ? styles.selected : ''}`}
              onClick={() => setSelectedType('business')}
            >
              <div className={styles.optionIcon}>
                <Icon name="briefcase" size="lg" />
              </div>
              <div className={styles.optionContent}>
                <span className={styles.optionTitle}>Ja, gewerblich</span>
                <span className={styles.optionDesc}>
                  Ich bin selbstständig oder habe ein Gewerbe
                </span>
              </div>
              <div className={styles.optionCheck}>
                {selectedType === 'business' && <Icon name="check" size="sm" />}
              </div>
            </button>
          </div>

          <p className={styles.hint}>
            <Icon name="info" size="sm" />
            Du kannst das später in den Einstellungen ändern.
          </p>

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              <Icon name="alertCircle" size="sm" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button
            variant="primary"
            fullWidth
            loading={loading}
            disabled={!selectedType}
            onClick={handleConfirm}
          >
            {loading ? 'Wird gespeichert...' : 'Weiter'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SellerTypeModal;
