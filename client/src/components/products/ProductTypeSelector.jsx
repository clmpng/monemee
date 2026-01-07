import React from 'react';
import { Icon } from '../common';
import { PRODUCT_TYPES } from '../../data/productTemplates';
import styles from '../../styles/components/ProductWizard.module.css';

/**
 * ProductTypeSelector Component
 * Schritt 1 des Wizards: Produkttyp auswählen
 */
function ProductTypeSelector({ selectedType, onSelect }) {
  return (
    <div className={styles.typeSelector}>
      <div className={styles.stepIntro}>
        <h2 className={styles.stepTitle}>Was möchtest du verkaufen?</h2>
        <p className={styles.stepDescription}>
          Wähle den Typ, der am besten zu deinem Produkt passt
        </p>
      </div>

      <div className={styles.typeGrid}>
        {PRODUCT_TYPES.map((type) => (
          <button
            key={type.id}
            className={`${styles.typeCard} ${
              selectedType === type.id ? styles.typeCardSelected : ''
            } ${type.comingSoon ? styles.typeCardDisabled : ''}`}
            onClick={() => !type.comingSoon && onSelect(type.id)}
            disabled={type.comingSoon}
            style={{
              '--type-color': type.color
            }}
          >
            {/* Icon */}
            <div className={styles.typeIcon}>
              <Icon name={type.icon} size="lg" />
            </div>

            {/* Content */}
            <div className={styles.typeContent}>
              <span className={styles.typeLabel}>{type.label}</span>
              <span className={styles.typeDescription}>{type.description}</span>
            </div>

            {/* Badges */}
            {type.popular && (
              <span className={styles.popularBadge}>Beliebt</span>
            )}
            {type.comingSoon && (
              <span className={styles.comingSoonBadge}>Bald</span>
            )}

            {/* Selection indicator */}
            {selectedType === type.id && (
              <div className={styles.selectedIndicator}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Hint */}
      <p className={styles.typeHint}>
        <Icon name="info" size="sm" />
        <span>Keine Sorge, du kannst später weitere Inhalte hinzufügen</span>
      </p>
    </div>
  );
}

export default ProductTypeSelector;