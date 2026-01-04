import React from 'react';
import { Modal, Icon } from '../common';
import styles from '../../styles/components/PricingInfoModal.module.css';

/**
 * Pricing Info Modal
 * Zeigt Tipps zur optimalen Preisgestaltung
 * 
 * Verwendet das einheitliche Icon-System der App (Lucide React)
 */
function PricingInfoModal({ isOpen, onClose }) {
  const tips = [
    {
      icon: 'gem',
      title: 'Wert kommunizieren',
      description: 'Beschreibe klar, welchen Nutzen dein Produkt bietet. Kunden zahlen für Lösungen, nicht für Dateien.'
    },
    {
      icon: 'trendingUp',
      title: 'Nicht zu günstig',
      description: 'Zu niedrige Preise signalisieren geringe Qualität. Ein E-Book für 2,99€ wirkt weniger wertvoll als eines für 19€.'
    },
    {
      icon: 'chart',
      title: 'Markt recherchieren',
      description: 'Schau dir an, was vergleichbare Produkte kosten. Positioniere dich bewusst im Markt.'
    },
    {
      icon: 'rocket',
      title: 'Starter-Preise',
      description: 'Beginne mit einem moderaten Preis und erhöhe ihn später, wenn du Bewertungen und Verkäufe hast.'
    },
    {
      icon: 'package',
      title: 'Bundles anbieten',
      description: 'Kombiniere mehrere Produkte zu einem Paket mit Rabatt – höherer Warenkorbwert, mehr Wert für Kunden.'
    }
  ];

  const priceExamples = [
    { type: 'E-Book / Guide', range: '9 – 29€', recommended: '14,90€' },
    { type: 'Template-Pack', range: '19 – 49€', recommended: '29€' },
    { type: 'Online-Kurs', range: '49 – 199€', recommended: '79€' },
    { type: 'Coaching-Call', range: '49 – 149€', recommended: '89€' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Preisgestaltung"
      size="default"
    >
      <div className={styles.content}>
        <p className={styles.intro}>
          Der richtige Preis entscheidet über deinen Erfolg. Hier sind bewährte Tipps für digitale Produkte.
        </p>

        {/* Tips Section */}
        <div className={styles.tipsSection}>
          <h3 className={styles.sectionTitle}>
            <Icon name="sparkles" size="sm" />
            Tipps zur Preisgestaltung
          </h3>
          <div className={styles.tipsList}>
            {tips.map((tip, index) => (
              <div key={index} className={styles.tipItem}>
                <div className={styles.tipIconWrapper}>
                  <Icon name={tip.icon} size="sm" />
                </div>
                <div className={styles.tipContent}>
                  <h4 className={styles.tipTitle}>{tip.title}</h4>
                  <p className={styles.tipDescription}>{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Examples */}
        <div className={styles.examplesSection}>
          <h3 className={styles.sectionTitle}>
            <Icon name="tag" size="sm" />
            Typische Preisbereiche
          </h3>
          <div className={styles.examplesTable}>
            <div className={styles.tableHeader}>
              <span>Produkttyp</span>
              <span>Bereich</span>
              <span>Empfohlen</span>
            </div>
            {priceExamples.map((example, index) => (
              <div key={index} className={styles.tableRow}>
                <span className={styles.productType}>{example.type}</span>
                <span className={styles.priceRange}>{example.range}</span>
                <span className={styles.recommended}>{example.recommended}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className={styles.infoBox}>
          <Icon name="info" size="sm" />
          <p>
            <strong>Mindestpreis:</strong> Der Mindestpreis für kostenpflichtige Produkte beträgt 2,99€. 
            Kostenlose Produkte (0€) sind weiterhin möglich – perfekt für Lead-Magnets!
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default PricingInfoModal;
