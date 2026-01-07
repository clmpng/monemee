import React from 'react';
import { Icon } from '../common';
import { PRODUCT_TEMPLATES, PRODUCT_TYPES } from '../../data/productTemplates';
import styles from '../../styles/components/ProductWizard.module.css';

/**
 * ProductTemplates Component
 * Schritt 2 des Wizards: Template auswählen oder leer starten
 */
function ProductTemplates({ productType, onSelectTemplate, onSkip }) {
  const templates = PRODUCT_TEMPLATES[productType] || [];
  const typeInfo = PRODUCT_TYPES.find(t => t.id === productType);

  // Keine Templates verfügbar
  if (templates.length === 0) {
    return (
      <div className={styles.templatesSection}>
        <div className={styles.stepIntro}>
          <div className={styles.typeHeaderIcon} style={{ background: typeInfo?.color }}>
            <Icon name={typeInfo?.icon} size="lg" />
          </div>
          <h2 className={styles.stepTitle}>{typeInfo?.label}</h2>
          <p className={styles.stepDescription}>
            Für diesen Typ haben wir noch keine Vorlagen. Starte mit einem leeren Produkt!
          </p>
        </div>

        <button className={styles.startBlankButton} onClick={onSkip}>
          <div className={styles.startBlankIcon}>
            <Icon name="plus" size="lg" />
          </div>
          <div className={styles.startBlankContent}>
            <span className={styles.startBlankTitle}>Leeres Produkt erstellen</span>
            <span className={styles.startBlankDescription}>
              Fülle alle Felder selbst aus
            </span>
          </div>
          <Icon name="chevronRight" size="md" className={styles.startBlankArrow} />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.templatesSection}>
      <div className={styles.stepIntro}>
        <div className={styles.typeHeaderIcon} style={{ background: typeInfo?.color }}>
          <Icon name={typeInfo?.icon} size="lg" />
        </div>
        <h2 className={styles.stepTitle}>Starte mit einer Vorlage</h2>
        <p className={styles.stepDescription}>
          Wähle ein Template als Ausgangspunkt – du kannst alles anpassen
        </p>
      </div>

      {/* Templates Grid */}
      <div className={styles.templatesGrid}>
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            typeColor={typeInfo?.color}
            onClick={() => onSelectTemplate(template)}
          />
        ))}
      </div>

      {/* Divider */}
      <div className={styles.templatesDivider}>
        <span>oder</span>
      </div>

      {/* Start blank option */}
      <button className={styles.startBlankButton} onClick={onSkip}>
        <div className={styles.startBlankIcon}>
          <Icon name="edit" size="md" />
        </div>
        <div className={styles.startBlankContent}>
          <span className={styles.startBlankTitle}>Ohne Vorlage starten</span>
          <span className={styles.startBlankDescription}>
            Komplett von vorne beginnen
          </span>
        </div>
        <Icon name="chevronRight" size="md" className={styles.startBlankArrow} />
      </button>
    </div>
  );
}

/**
 * Template Card Component
 */
function TemplateCard({ template, typeColor, onClick }) {
  const { name, preview, data } = template;
  
  // Format price
  const formatPrice = (price) => {
    if (!price || price === 0) return 'Kostenlos';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Count modules
  const moduleCount = data.modules?.length || 0;
  const moduleTypes = [...new Set(data.modules?.map(m => m.type) || [])];

  return (
    <button className={styles.templateCard} onClick={onClick}>
      {/* Preview Header */}
      <div
        className={styles.templatePreview}
        style={{ '--template-color': typeColor }}
      >
        <Icon name={preview} size="xl" />
      </div>

      {/* Content */}
      <div className={styles.templateContent}>
        <span className={styles.templateName}>{name}</span>
        <h3 className={styles.templateTitle}>{data.title}</h3>
        
        {/* Meta info */}
        <div className={styles.templateMeta}>
          <span className={styles.templatePrice}>
            {formatPrice(data.price)}
          </span>
          <span className={styles.templateDot}>•</span>
          <span className={styles.templateModules}>
            {moduleCount} {moduleCount === 1 ? 'Inhalt' : 'Inhalte'}
          </span>
        </div>

        {/* Module type badges */}
        <div className={styles.templateBadges}>
          {moduleTypes.includes('file') && (
            <span className={styles.templateBadge}>
              <Icon name="file" size="xs" /> Datei
            </span>
          )}
          {moduleTypes.includes('url') && (
            <span className={styles.templateBadge}>
              <Icon name="link" size="xs" /> Link
            </span>
          )}
          {moduleTypes.includes('text') && (
            <span className={styles.templateBadge}>
              <Icon name="fileText" size="xs" /> Text
            </span>
          )}
          {moduleTypes.includes('email') && (
            <span className={styles.templateBadge}>
              <Icon name="mail" size="xs" /> E-Mail
            </span>
          )}
        </div>
      </div>

      {/* Use button */}
      <div className={styles.templateAction}>
        <span>Verwenden</span>
        <Icon name="chevronRight" size="sm" />
      </div>
    </button>
  );
}

export default ProductTemplates;