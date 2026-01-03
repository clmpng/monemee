import React, { useState, useEffect } from 'react';
import { Modal, Icon } from '../common';
import { earningsService } from '../../services';
import styles from '../../styles/components/LevelInfoModal.module.css';

/**
 * Level Info Modal
 * Zeigt alle Level-Stufen mit Konditionen
 * 
 * Lädt Level-Daten vom Backend (Single Source of Truth)
 */
function LevelInfoModal({ isOpen, onClose, currentLevel = 1 }) {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lade Levels vom Backend wenn Modal öffnet
  useEffect(() => {
    if (isOpen && levels.length === 0) {
      loadLevels();
    }
  }, [isOpen]);

  const loadLevels = async () => {
    try {
      setLoading(true);
      const response = await earningsService.getAllLevels();
      if (response.success && response.data) {
        setLevels(response.data);
      }
    } catch (error) {
      console.error('Error loading levels:', error);
    } finally {
      setLoading(false);
    }
  };

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

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Lade Level-Daten...</p>
          </div>
        ) : (
          <div className={styles.levelsList}>
            {levels.map((level) => {
              const isActive = level.level === currentLevel;
              const isUnlocked = level.level <= currentLevel;
              
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
                      <span className={styles.feeValue}>{level.fee}%</span>
                      <span className={styles.feeLabel}>Gebühr</span>
                    </div>
                  </div>
                  <p className={styles.levelDescription}>{level.description}</p>
                </div>
              );
            })}
          </div>
        )}

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