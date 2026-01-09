// client/src/pages/public/PublicProduct.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, Badge, Icon} from '../../components/common';
import { productsService, promotionService, paymentsService, usersService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import {
  getTheme,
  getAvatarStyle,
  getButtonStyle,
  getCardStyle,
  getHeaderBackground,
  getFontFamily,
  getSpacingOption
} from '../../config/themes';
import styles from '../../styles/pages/PublicProduct.module.css';

/**
 * Public Product Page
 * Product detail page for buyers
 * URL: /p/:productId?ref=AFFILIATE_CODE
 */
function PublicProduct() {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const affiliateCode = searchParams.get('ref');
  const checkoutStatus = searchParams.get('checkout'); // 'cancelled'
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [affiliateLink, setAffiliateLink] = useState(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Kauf-State
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);

  // Widerrufs-Checkbox State (§ 356 Abs. 5 BGB)
  const [acceptedWaiver, setAcceptedWaiver] = useState(false);

  // Creator Store Settings für Design-Anpassung
  const [creatorSettings, setCreatorSettings] = useState(null);

  // Affiliate-Code speichern & tracken
  useEffect(() => {
    if (affiliateCode) {
      localStorage.setItem('monemee_ref', affiliateCode);
      localStorage.setItem('monemee_ref_product', productId);
      
      // Track click
      promotionService.trackClick(affiliateCode).catch(console.error);
    }
  }, [affiliateCode, productId]);

  // Checkout cancelled Hinweis
  useEffect(() => {
    if (checkoutStatus === 'cancelled') {
      setPurchaseError('Zahlung abgebrochen. Du kannst es jederzeit erneut versuchen.');
    }
  }, [checkoutStatus]);

  // Produkt laden
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await productsService.getPublicProduct(productId);

        if (response.success) {
          setProduct(response.data);
        } else {
          setError('Produkt nicht gefunden');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Produkt konnte nicht geladen werden');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Creator Store Settings laden für Design-Anpassung
  useEffect(() => {
    const fetchCreatorSettings = async () => {
      if (!product?.creator_username) return;

      try {
        const response = await usersService.getPublicStore(product.creator_username);
        if (response.success && response.data?.store?.settings) {
          setCreatorSettings(response.data.store.settings);
        }
      } catch (err) {
        console.error('Error fetching creator settings:', err);
        // Fehler nicht anzeigen, verwende einfach Default-Einstellungen
      }
    };

    fetchCreatorSettings();
  }, [product?.creator_username]);

  // Preis formatieren
  const formatPrice = useCallback((price) => {
    if (!price || price === 0) return 'Kostenlos';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }, []);

  // Provision berechnen
  const calculateCommission = useCallback((price, commissionPercent) => {
    if (!price || price === 0) return '0,00 €';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price * (commissionPercent / 100));
  }, []);

  /**
   * Kaufen Handler
   * Erstellt Stripe Checkout Session und leitet weiter
   *
   * HINWEIS: Gast-Checkout ist erlaubt (kein Login erforderlich)
   * Stripe erfasst die E-Mail im Checkout-Prozess
   */
  const handleBuy = async () => {
    // Prüfe Widerrufs-Checkbox für kostenpflichtige Produkte
    if (product.price > 0 && !acceptedWaiver) {
      setPurchaseError('Bitte bestätige, dass du auf dein Widerrufsrecht verzichtest, um den sofortigen Zugang zu erhalten.');
      return;
    }
    
    // Eigenes Produkt prüfen
    // DUMMY/TESTING: Auskommentiert - eigenes Produkt kaufen erlaubt
    // TODO: Vor Production wieder aktivieren!
    // if (isOwnProduct) {
    //   setPurchaseError('Du kannst dein eigenes Produkt nicht kaufen.');
    //   return;
    // }
    
    try {
      setPurchasing(true);
      setPurchaseError(null);
      
      // Affiliate-Code aus LocalStorage holen
      const refCode = localStorage.getItem('monemee_ref');
      const refProduct = localStorage.getItem('monemee_ref_product');
      
      // Nur Affiliate-Code verwenden wenn er für dieses Produkt gilt
      const useAffiliateCode = (refCode && refProduct === productId) ? refCode : null;
      
      // Stripe Checkout Session erstellen
      const response = await paymentsService.createCheckout(
        parseInt(productId), 
        useAffiliateCode
      );
      
      if (response.success && response.data?.checkoutUrl) {
        // Zu Stripe Checkout weiterleiten
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error(response.message || 'Checkout konnte nicht erstellt werden');
      }
      
    } catch (err) {
      console.error('Checkout error:', err);
      
      // Spezifische Fehlermeldungen
      if (err.code === 'SELLER_NO_STRIPE') {
        setPurchaseError('Der Verkäufer hat noch kein Zahlungskonto eingerichtet. Bitte versuche es später erneut.');
      } else if (err.code === 'SELLER_CHARGES_DISABLED') {
        setPurchaseError('Der Verkäufer kann derzeit keine Zahlungen empfangen.');
      } else if (err.code === 'STRIPE_NOT_CONFIGURED') {
        setPurchaseError('Zahlungen sind derzeit nicht verfügbar. Bitte versuche es später erneut.');
      } else {
        setPurchaseError(err.message || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  // Affiliate-Link generieren
  const handleGenerateLink = async () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(`/p/${productId}`));
      return;
    }

    try {
      setGeneratingLink(true);
      const response = await promotionService.generateLink(parseInt(productId));
      
      if (response.success) {
        setAffiliateLink(response.data.link);
      }
    } catch (err) {
      console.error('Error generating link:', err);
      alert('Link konnte nicht erstellt werden');
    } finally {
      setGeneratingLink(false);
    }
  };

  // Link kopieren
  const handleCopyLink = async () => {
    if (!affiliateLink) return;
    
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Share Handler
  const handleShare = async () => {
    const shareUrl = affiliateLink || window.location.href;
    const shareData = {
      title: product?.title,
      text: product?.description?.substring(0, 100) + '...',
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  // Initials für Avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Loading State
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonText} />
            <div className={styles.skeletonText} />
            <div className={styles.skeletonButton} />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !product) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>
          <Icon name="searchX" size={64} />
        </div>
        <h1 className={styles.errorTitle}>Produkt nicht gefunden</h1>
        <p className={styles.errorText}>
          Dieses Produkt existiert nicht oder wurde entfernt.
        </p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Zur Startseite
        </Button>
      </div>
    );
  }

  const isOwnProduct = false // user?.id === product.user_id;

  // Get theme configuration and styles (vom Creator Store)
  const settings = creatorSettings || {};
  const themeConfig = getTheme(settings.theme || 'classic');
  const avatarStyle = getAvatarStyle(settings.avatarStyle || 'round');
  const buttonStyle = getButtonStyle(settings.buttonStyle || 'rounded');
  const cardStyle = getCardStyle(settings.cardStyle || 'elevated');
  const fontFamily = getFontFamily(settings.fontFamily || 'modern');
  const spacingOption = getSpacingOption(settings.spacing || 'normal');

  return (
    <div
      className={styles.productPage}
      style={{
        '--color-primary': themeConfig.primary,
        '--color-primary-light': themeConfig.primaryLight,
        '--color-primary-dark': themeConfig.primaryDark,
        '--color-bg-primary': themeConfig.background,
        '--color-bg-secondary': themeConfig.backgroundSecondary,
        '--color-bg-tertiary': themeConfig.backgroundTertiary,
        '--color-text-primary': themeConfig.textPrimary,
        '--color-text-secondary': themeConfig.textSecondary,
        '--color-text-tertiary': themeConfig.textTertiary,
        '--color-border': themeConfig.border,
        '--avatar-radius': avatarStyle.borderRadius,
        '--button-radius': buttonStyle.borderRadius,
        '--card-shadow': cardStyle.shadow,
        '--card-border': cardStyle.border,
        '--spacing-multiplier': spacingOption.multiplier,
        fontFamily: fontFamily.fontFamily
      }}
    >
      {/* Back Button */}
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <Icon name="chevronLeft" size="md" />
      </button>

      {/* Hero Image */}
      <div className={styles.heroImage}>
        {product.thumbnail_url ? (
          <img src={product.thumbnail_url} alt={product.title} />
        ) : (
          <div className={styles.heroPlaceholder}>
            <Icon name="package" size={64} />
          </div>
        )}
        <div className={styles.heroGradient} />
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Product Info Card */}
        <div className={styles.productInfo}>
          {/* Badges */}
          <div className={styles.badges}>
            <Badge variant="primary">
              <Icon name="download" size="xs" />
              Digitaler Download
            </Badge>
            {product.sales > 0 && (
              <Badge variant="success">
                {product.sales}+ verkauft
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className={styles.title}>{product.title}</h1>

          {/* Creator */}
          <Link to={`/@${product.creator_username}`} className={styles.creator}>
            <div
              className={styles.creatorAvatar}
              style={{
                borderRadius: avatarStyle.borderRadius,
                clipPath: avatarStyle.clipPath || 'none'
              }}
            >
              {product.creator_avatar ? (
                <img src={product.creator_avatar} alt={product.creator_name} />
              ) : (
                getInitials(product.creator_name)
              )}
            </div>
            <div className={styles.creatorInfo}>
              <span className={styles.creatorName}>{product.creator_name}</span>
              <span className={styles.creatorUsername}>@{product.creator_username}</span>
            </div>
          </Link>

          {/* Ratings (Platzhalter) */}
          <div className={styles.ratings}>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon 
                  key={star} 
                  name="star" 
                  size="sm" 
                  className={star <= 4 ? styles.starFilled : styles.starEmpty}
                />
              ))}
            </div>
            <span className={styles.ratingText}>4.8</span>
            <span className={styles.ratingCount}>(noch keine Bewertungen)</span>
          </div>
        </div>

        {/* Price & CTA */}
        <Card className={styles.priceCard}>
          <div className={styles.priceRow}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
            {product.price > 0 && (
              <span className={styles.priceNote}>Einmalzahlung</span>
            )}
          </div>

          {/* Error Message */}
          {purchaseError && (
            <div className={styles.purchaseError}>
              <Icon name="alertCircle" size="sm" />
              <span>{purchaseError}</span>
            </div>
          )}

          {/* Widerrufs-Checkbox für kostenpflichtige digitale Produkte */}
          {product.price > 0 && !isOwnProduct && (
            <div className={styles.waiverCheckbox}>
              <label className={styles.waiverLabel}>
                <input
                  type="checkbox"
                  checked={acceptedWaiver}
                  onChange={(e) => {
                    setAcceptedWaiver(e.target.checked);
                    setPurchaseError(null);
                  }}
                  className={styles.waiverInput}
                />
                <span className={styles.waiverCustomCheckbox}>
                  {acceptedWaiver && <Icon name="check" size={12} />}
                </span>
                <span className={styles.waiverText}>
                  Ich stimme zu, dass der Zugang zum digitalen Inhalt sofort nach Kauf bereitgestellt wird, 
                  und mir ist bekannt, dass ich dadurch mein{' '}
                  <Link to="/widerruf" target="_blank" className={styles.waiverLink}>
                    Widerrufsrecht
                  </Link>{' '}
                  verliere.
                </span>
              </label>
            </div>
          )}
          
          <Button 
            variant="primary" 
            size="large" 
            fullWidth 
            onClick={handleBuy}
            disabled={purchasing || isOwnProduct || (product.price > 0 && !acceptedWaiver)}
            icon={purchasing ? null : <Icon name="shoppingBag" size="sm" />}
          >
            {purchasing ? 'Weiter zur Zahlung...' : 
             isOwnProduct ? 'Dein eigenes Produkt' :
             product.price > 0 ? 'Jetzt kaufen' : 'Kostenlos herunterladen'}
          </Button>

          <div className={styles.trustBadges}>
            <div className={styles.trustItem}>
              <Icon name="checkCircle" size="sm" />
              <span>Sofortiger Zugang</span>
            </div>
            <div className={styles.trustItem}>
              <Icon name="creditCard" size="sm" />
              <span>Sichere Zahlung via Stripe</span>
            </div>
          </div>
        </Card>

        {/* Description */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Icon name="fileText" size="sm" />
            Beschreibung
          </h2>
          <div className={`${styles.description} ${!showFullDescription ? styles.descriptionClamped : ''}`}>
            {product.description?.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          {product.description?.length > 300 && (
            <button 
              className={styles.showMoreButton}
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? 'Weniger anzeigen' : 'Mehr anzeigen'}
              <Icon 
                name="chevronDown" 
                size="sm" 
                style={{ transform: showFullDescription ? 'rotate(180deg)' : 'none' }}
              />
            </button>
          )}
        </div>

        {/* What's Included - Modules */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Icon name="package" size="sm" />
            Das bekommst du
          </h2>
          
          {product.modules && product.modules.length > 0 ? (
            <div className={styles.modulesList}>
              {product.modules.map((module, index) => (
                <ModulePreviewItem key={module.id || index} module={module} />
              ))}
            </div>
          ) : (
            // Fallback wenn keine Module vorhanden
            <div className={styles.includedGrid}>
              <div className={styles.includedItem}>
                <div className={styles.includedIcon}>
                  <Icon name="download" size="md" />
                </div>
                <span>Sofort-Download</span>
              </div>
              <div className={styles.includedItem}>
                <div className={styles.includedIcon}>
                  <Icon name="fileText" size="md" />
                </div>
                <span>Digitale Dateien</span>
              </div>
              <div className={styles.includedItem}>
                <div className={styles.includedIcon}>
                  <Icon name="refresh" size="md" />
                </div>
                <span>Lebenslanger Zugang</span>
              </div>
            </div>
          )}
        </div>

        {/* Creator Card */}
        <Card className={styles.creatorCard}>
          <h2 className={styles.sectionTitle}>
            <Icon name="user" size="sm" />
            Über den Creator
          </h2>
          <div className={styles.creatorProfile}>
            <div
              className={styles.creatorAvatarLarge}
              style={{
                borderRadius: avatarStyle.borderRadius,
                clipPath: avatarStyle.clipPath || 'none'
              }}
            >
              {product.creator_avatar ? (
                <img src={product.creator_avatar} alt={product.creator_name} />
              ) : (
                getInitials(product.creator_name)
              )}
            </div>
            <div className={styles.creatorDetails}>
              <h3>{product.creator_name}</h3>
              <p>@{product.creator_username}</p>
              {product.creator_product_count > 0 && (
                <span className={styles.creatorStats}>
                  {product.creator_product_count} Produkte
                </span>
              )}
            </div>
          </div>
          <Button 
            variant="secondary" 
            fullWidth
            onClick={() => navigate(`/store/${product.creator_username}`)}
          >
            Store ansehen
            <Icon name="chevronRight" size="sm" />
          </Button>
        </Card>

        {/* Affiliate Section - Nur wenn Provision > 0 und nicht eigenes Produkt */}
        {!isOwnProduct && product.affiliate_commission > 0 && (
          <Card className={styles.affiliateCard} highlight>
            <div className={styles.affiliateHeader}>
              <div className={styles.affiliateIcon}>
                <Icon name="dollarCircle" size="lg" />
              </div>
              <div>
                <h2 className={styles.affiliateTitle}>Verdiene mit diesem Produkt</h2>
                <p className={styles.affiliateSubtitle}>
                  Teile den Link und erhalte {product.affiliate_commission}% Provision
                </p>
              </div>
            </div>

            <div className={styles.affiliateStats}>
              <div className={styles.affiliateStat}>
                <span className={styles.affiliateStatValue}>{product.affiliate_commission}%</span>
                <span className={styles.affiliateStatLabel}>Provision</span>
              </div>
              <div className={styles.affiliateStat}>
                <span className={styles.affiliateStatValue}>
                  {calculateCommission(product.price, product.affiliate_commission)}
                </span>
                <span className={styles.affiliateStatLabel}>Pro Verkauf</span>
              </div>
            </div>

            {affiliateLink ? (
              <div className={styles.affiliateLinkBox}>
                <input 
                  type="text" 
                  value={affiliateLink} 
                  readOnly 
                  className={styles.affiliateLinkInput}
                />
                <Button 
                  variant={linkCopied ? 'success' : 'primary'}
                  onClick={handleCopyLink}
                  icon={<Icon name={linkCopied ? 'check' : 'copy'} size="sm" />}
                >
                  {linkCopied ? 'Kopiert!' : 'Kopieren'}
                </Button>
              </div>
            ) : (
              <Button 
                variant="primary" 
                fullWidth 
                size="large"
                onClick={handleGenerateLink}
                loading={generatingLink}
                icon={<Icon name="link" size="sm" />}
              >
                {user ? 'Affiliate-Link erstellen' : 'Anmelden & Link erstellen'}
              </Button>
            )}

            {affiliateLink && (
              <Button 
                variant="ghost" 
                fullWidth
                onClick={handleShare}
                icon={<Icon name="share" size="sm" />}
              >
                Teilen
              </Button>
            )}

            {!user && (
              <p className={styles.affiliateHint}>
                <Icon name="info" size="xs" />
                Melde dich an, um deinen persönlichen Affiliate-Link zu erhalten
              </p>
            )}
          </Card>
        )}

        {/* Legal Footer */}
        <div className={styles.legalFooter}>
          <Link to="/agb">AGB</Link>
          <span>•</span>
          <Link to="/datenschutz">Datenschutz</Link>
          <span>•</span>
          <Link to="/widerruf">Widerrufsrecht</Link>
          <span>•</span>
          <Link to="/impressum">Impressum</Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Module Preview Item for buyers
 * Shows what's included in the product
 */
function ModulePreviewItem({ module }) {
  const MODULE_CONFIG = {
    file: {
      icon: 'file',
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)',
      getLabel: (m) => m.title || m.file_name || 'Digitale Datei',
      getDescription: (m) => {
        if (m.description) return m.description;
        if (m.file_size) {
          const size = m.file_size;
          if (size < 1024) return `${size} B`;
          if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
          return `${(size / (1024 * 1024)).toFixed(1)} MB`;
        }
        return null;
      }
    },
    url: {
      icon: 'link',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      getLabel: (m) => m.title || m.url_label || 'Externer Link',
      getDescription: (m) => m.description || 'Zugang zu exklusivem Content'
    },
    email: {
      icon: 'mail',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      getLabel: (m) => m.title || 'Newsletter-Zugang',
      getDescription: (m) => m.description || 'Exklusive E-Mail-Inhalte'
    },
    text: {
      icon: 'fileText',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      getLabel: (m) => m.title || 'Anleitung & Text',
      getDescription: (m) => m.description || 'Detaillierte Anleitung'
    },
    videocall: {
      icon: 'video',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      getLabel: (m) => m.title || `${m.duration || 30} Min. Videocall`,
      getDescription: (m) => m.description || 'Persönliches 1:1 Gespräch'
    }
  };

  const config = MODULE_CONFIG[module.type] || MODULE_CONFIG.file;
  const description = config.getDescription(module);

  return (
    <div className={styles.modulePreviewItem}>
      <div 
        className={styles.modulePreviewIcon}
        style={{ 
          backgroundColor: config.bgColor,
          color: config.color 
        }}
      >
        <Icon name={config.icon} size="md" />
      </div>
      <div className={styles.modulePreviewContent}>
        <span className={styles.modulePreviewLabel}>
          {config.getLabel(module)}
        </span>
        {description && (
          <span className={styles.modulePreviewDescription}>
            {description.length > 60 ? description.substring(0, 60) + '...' : description}
          </span>
        )}
      </div>
      <div className={styles.modulePreviewCheck}>
        <Icon name="checkCircle" size="sm" />
      </div>
    </div>
  );
}

export default PublicProduct;
