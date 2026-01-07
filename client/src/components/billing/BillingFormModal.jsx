import React from 'react';
import { Icon } from '../common';
import BillingSettingsForm from './BillingSettingsForm';
import styles from '../../styles/components/BillingFormModal.module.css';

/**
 * Billing Form Modal
 * Modal für Rechnungsdaten-Eingabe mit einheitlichem Design
 */
function BillingFormModal({ isOpen, onClose, onSave, initialData, loading = false }) {
  if (!isOpen) return null;

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
            <Icon name="receipt" size={32} />
          </div>
          <h2 className={styles.title}>Rechnungsangaben</h2>
          <p className={styles.subtitle}>
            Diese Daten erscheinen auf deinen Rechnungen an Käufer.
          </p>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.infoBox}>
            <Icon name="info" size="sm" />
            <p>
              Als gewerblicher Verkäufer werden automatisch Rechnungen für deine Käufer erstellt.
              Du findest alle Rechnungen unter <strong>Fortschritt → Rechnungen</strong>.
            </p>
          </div>

          <BillingSettingsForm
            initialData={initialData}
            onSave={onSave}
            onCancel={handleClose}
            loading={loading}
            submitLabel="Speichern"
            showCancel={false}
          />
        </div>
      </div>
    </div>
  );
}

export default BillingFormModal;
