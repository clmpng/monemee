import React from 'react';
import { Modal, Icon } from '../common';
import { LEVELS } from '../../config/platform.config';
import styles from '../../styles/components/LevelInfoModal.module.css';

/**
 * Level Info Modal
 * Zeigt alle Level-Stufen mit Konditionen
 */
function LevelInfoModal({ isOpen, onClose, currentLevel = 1 }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Level-System"
      size="default"
    >
      <div className={styles.content}>
        <p className={styles.intro}>
          Je mehr du verkaufst, desto weniger Gebühren zahlst du. 
          Keine monatlichen Kosten – du zahlst nur bei Verkäufen.
        </p>

        <div className={styles.levelsList}>
          {LEVELS.map((level) => {
            const isActive = level.level === currentLevel;
            const isUnlocked = level.level <= currentLevel;
            
            // Fee kann als 'fee' oder 'platformFee' kommen
            const feeValue = level.fee ?? level.platformFee ?? 0;
            
            return (
              <div 
                key={level.level}
                className={`${styles.levelItem} ${isActive ? styles.active : ''} ${isUnlocked ? styles.unlocked : ''}`}
              >
                <div className={styles.levelHeader}>
                  <div 
                    className={styles.levelBadge}
                    style={{ backgroundColor: isUnlocked ? level.color : 'var(--color-bg-tertiary)' }}
                  >
                    {isActive ? (
                      <Icon name="check" size="sm" />
                    ) : (
                      <span>{level.level}</span>
                    )}
                  </div>
                  <div className={styles.levelInfo}>
                    <h3 className={styles.levelName}>
                      {level.name}
                      {isActive && <span className={styles.currentBadge}>Aktuell</span>}
                    </h3>
                    <p className={styles.levelThreshold}>
                      {level.minEarnings === 0 
                        ? 'Startet bei 0€' 
                        : `Ab ${level.minEarnings.toLocaleString('de-DE')}€ Umsatz`}
                    </p>
                  </div>
                  <div className={styles.levelFee}>
                    <span className={styles.feeValue}>{feeValue}%</span>
                    <span className={styles.feeLabel}>Gebühr</span>
                  </div>
                </div>
                <p className={styles.levelDescription}>{level.description}</p>
              </div>
            );
          })}
        </div>

        <div className={styles.infoBox}>
          <Icon name="info" size="sm" />
          <p>
            Die Gebühr wird nur bei erfolgreichen Verkäufen berechnet. 
            Keine versteckten Kosten, keine Abo-Gebühren.
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default LevelInfoModal;
