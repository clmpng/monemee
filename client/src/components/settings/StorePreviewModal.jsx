import React, { useState } from 'react';
import { Icon, Button } from '../common';
import {
  getTheme,
  getAllThemes,
  getAllLayouts,
  getAvatarStyle,
  getAllAvatarStyles,
  getButtonStyle,
  getAllButtonStyles,
  getCardStyle,
  getAllCardStyles,
  getHeaderBackground,
  getAllHeaderBackgrounds,
  getFontFamily,
  getAllFontFamilies,
  getSpacingOption,
  getAllSpacingOptions
} from '../../config/themes';
import styles from '../../styles/components/StorePreviewModal.module.css';

/**
 * Store Preview Modal
 * Fullscreen preview of store with all customization options
 */
function StorePreviewModal({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  userName,
  userBio
}) {
  const [activeTab, setActiveTab] = useState('theme'); // theme | layout | style

  if (!isOpen) return null;

  const theme = getTheme(settings.theme);
  const avatarStyle = getAvatarStyle(settings.avatarStyle);
  const buttonStyle = getButtonStyle(settings.buttonStyle);
  const cardStyle = getCardStyle(settings.cardStyle);
  const headerBackground = getHeaderBackground(settings.headerBackground);
  const fontFamily = getFontFamily(settings.fontFamily);
  const spacingOption = getSpacingOption(settings.spacing);

  // Generate header background based on type
  const getHeaderBackgroundStyle = () => {
    switch (headerBackground.type) {
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%)`
        };
      case 'pattern':
        return {
          background: theme.primary,
          backgroundImage: `radial-gradient(circle, ${theme.primaryLight} 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        };
      default:
        return {
          background: theme.primary
        };
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h3 className={styles.title}>Store-Vorschau</h3>
            <p className={styles.subtitle}>Passe dein Design an</p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <Icon name="x" size="md" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNav}>
          <button
            onClick={() => setActiveTab('theme')}
            className={`${styles.tabButton} ${activeTab === 'theme' ? styles.tabButtonActive : ''}`}
          >
            <Icon name="palette" size="sm" />
            Theme
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`${styles.tabButton} ${activeTab === 'layout' ? styles.tabButtonActive : ''}`}
          >
            <Icon name="layoutGrid" size="sm" />
            Layout
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`${styles.tabButton} ${activeTab === 'style' ? styles.tabButtonActive : ''}`}
          >
            <Icon name="settings" size="sm" />
            Style
          </button>
        </div>

        {/* Controls Based on Active Tab */}
        <div className={styles.controls}>
          {activeTab === 'theme' && (
            <div className={styles.themeTabs}>
              {getAllThemes().map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSettingsChange({ theme: t.id })}
                  className={`${styles.themeTab} ${settings.theme === t.id ? styles.themeTabActive : ''}`}
                >
                  <div
                    className={styles.themeTabColor}
                    style={{ backgroundColor: t.primary }}
                  />
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'layout' && (
            <div className={styles.layoutControls}>
              {getAllLayouts().map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => onSettingsChange({ layout: { productGrid: layout.id } })}
                  className={`${styles.controlOption} ${settings.layout.productGrid === layout.id ? styles.controlOptionActive : ''}`}
                >
                  <Icon name={layout.icon} size="md" />
                  <span>{layout.name}</span>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'style' && (
            <div className={styles.styleControls}>
              <div className={styles.styleGroup}>
                <span className={styles.styleLabel}>Avatar</span>
                <div className={styles.styleOptions}>
                  {getAllAvatarStyles().map((style) => (
                    <button
                      key={style.id}
                      onClick={() => onSettingsChange({ avatarStyle: style.id })}
                      className={`${styles.styleOption} ${settings.avatarStyle === style.id ? styles.styleOptionActive : ''}`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.styleGroup}>
                <span className={styles.styleLabel}>Button</span>
                <div className={styles.styleOptions}>
                  {getAllButtonStyles().map((style) => (
                    <button
                      key={style.id}
                      onClick={() => onSettingsChange({ buttonStyle: style.id })}
                      className={`${styles.styleOption} ${settings.buttonStyle === style.id ? styles.styleOptionActive : ''}`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.styleGroup}>
                <span className={styles.styleLabel}>Karten</span>
                <div className={styles.styleOptions}>
                  {getAllCardStyles().map((style) => (
                    <button
                      key={style.id}
                      onClick={() => onSettingsChange({ cardStyle: style.id })}
                      className={`${styles.styleOption} ${settings.cardStyle === style.id ? styles.styleOptionActive : ''}`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.styleGroup}>
                <span className={styles.styleLabel}>Header-Hintergrund</span>
                <div className={styles.styleOptions}>
                  {getAllHeaderBackgrounds().map((style) => (
                    <button
                      key={style.id}
                      onClick={() => onSettingsChange({ headerBackground: style.id })}
                      className={`${styles.styleOption} ${settings.headerBackground === style.id ? styles.styleOptionActive : ''}`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.styleGroup}>
                <span className={styles.styleLabel}>Schriftart</span>
                <div className={styles.styleOptions}>
                  {getAllFontFamilies().map((font) => (
                    <button
                      key={font.id}
                      onClick={() => onSettingsChange({ fontFamily: font.id })}
                      className={`${styles.styleOption} ${settings.fontFamily === font.id ? styles.styleOptionActive : ''}`}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.styleGroup}>
                <span className={styles.styleLabel}>Abstände</span>
                <div className={styles.styleOptions}>
                  {getAllSpacingOptions().map((spacing) => (
                    <button
                      key={spacing.id}
                      onClick={() => onSettingsChange({ spacing: spacing.id })}
                      className={`${styles.styleOption} ${settings.spacing === spacing.id ? styles.styleOptionActive : ''}`}
                    >
                      {spacing.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Content */}
        <div
          className={styles.previewContainer}
          style={{
            '--preview-primary': theme.primary,
            '--preview-primary-light': theme.primaryLight,
            '--preview-primary-dark': theme.primaryDark,
            '--preview-bg-primary': theme.background,
            '--preview-bg-secondary': theme.backgroundSecondary,
            '--preview-bg-tertiary': theme.backgroundTertiary,
            '--preview-text-primary': theme.textPrimary,
            '--preview-text-secondary': theme.textSecondary,
            '--preview-text-tertiary': theme.textTertiary,
            '--preview-border': theme.border,
            '--preview-avatar-radius': avatarStyle.borderRadius,
            '--preview-avatar-clip': avatarStyle.clipPath || 'none',
            '--preview-button-radius': buttonStyle.borderRadius,
            '--preview-card-shadow': cardStyle.shadow,
            '--preview-card-border': cardStyle.border,
            '--preview-font-family': fontFamily.fontFamily,
            '--preview-spacing-multiplier': spacingOption.multiplier,
            fontFamily: fontFamily.fontFamily
          }}
        >
          {/* Mock Store Header */}
          <div className={styles.previewHeader}>
            <div className={styles.previewHeaderBg} style={getHeaderBackgroundStyle()}>
              <div className={styles.previewHeaderWave} />
            </div>
            <div className={styles.previewProfile}>
              <div
                className={styles.previewAvatar}
                style={{
                  borderRadius: avatarStyle.borderRadius,
                  clipPath: avatarStyle.clipPath || 'none'
                }}
              >
                {(userName || 'U').charAt(0).toUpperCase()}
              </div>
              <h1 className={styles.previewName}>{userName || 'Dein Name'}</h1>
              <p className={styles.previewHandle}>@{userName?.toLowerCase() || 'username'}</p>
              {userBio && <p className={styles.previewBio}>{userBio}</p>}
              <button
                className={styles.previewButton}
                style={{ borderRadius: buttonStyle.borderRadius }}
              >
                <Icon name="message" size="sm" />
                Nachricht senden
              </button>
            </div>
          </div>

          {/* Mock Products */}
          <div className={styles.previewProducts}>
            <h2 className={styles.previewSectionTitle}>
              <Icon name="package" size="sm" />
              Produkte
              <span className={styles.previewBadge}>2</span>
            </h2>
            <div className={`${styles.previewGrid} ${styles['grid-' + settings.layout.productGrid]}`}>
              {/* Product 1 */}
              <div
                className={styles.previewProductCard}
                style={{
                  boxShadow: cardStyle.shadow,
                  border: cardStyle.border
                }}
              >
                <div className={styles.previewProductThumb}>
                  <Icon name="image" size={32} />
                </div>
                <div className={styles.previewProductContent}>
                  <h3 className={styles.previewProductTitle}>E-Book: Der ultimative Guide</h3>
                  <p className={styles.previewProductDesc}>
                    Lerne alles was du wissen musst in diesem umfangreichen Guide.
                  </p>
                  <div className={styles.previewProductFooter}>
                    <span className={styles.previewProductPrice}>29,99 €</span>
                    <span className={styles.previewProductCta}>
                      Ansehen
                      <Icon name="chevronRight" size="sm" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Product 2 */}
              <div
                className={styles.previewProductCard}
                style={{
                  boxShadow: cardStyle.shadow,
                  border: cardStyle.border
                }}
              >
                <div className={styles.previewProductThumb}>
                  <Icon name="image" size={32} />
                  <span className={styles.previewFreeBadge}>Kostenlos</span>
                </div>
                <div className={styles.previewProductContent}>
                  <h3 className={styles.previewProductTitle}>Gratis Template Pack</h3>
                  <p className={styles.previewProductDesc}>
                    Kostenloses Starter-Pack mit nützlichen Templates.
                  </p>
                  <div className={styles.previewProductFooter}>
                    <span className={`${styles.previewProductPrice} ${styles.previewProductPriceFree}`}>
                      Kostenlos
                    </span>
                    <span className={styles.previewProductCta}>
                      Ansehen
                      <Icon name="chevronRight" size="sm" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>
            Abbrechen
          </Button>
          <Button
            variant="primary"
            onClick={onClose}
            icon={<Icon name="check" size="sm" />}
          >
            Fertig
          </Button>
        </div>
      </div>
    </div>
  );
}

export default StorePreviewModal;
