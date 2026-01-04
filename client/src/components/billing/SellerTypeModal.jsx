import React, { useState } from 'react';
import { Icon } from '../common';
import styles from '../../styles/components/SellerTypeModal.module.css';

/**
 * Seller Type Modal
 * Wird nach erfolgreichem Stripe-Onboarding angezeigt
 * Fragt ob der Nutzer privat oder gewerblich verkauft
 */
function SellerTypeModal({ isOpen, onClose, onSelect, loading = false }) {
  const [selectedType, setSelectedType] = useState(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedType) {
      onSelect(selectedType);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Icon name="checkCircle" size="xl" />
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
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={!selectedType || loading}
          >
            {loading ? (
              <>
                <Icon name="loader" size="sm" className={styles.spinner} />
                Wird gespeichert...
              </>
            ) : (
              'Weiter'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SellerTypeModal;
