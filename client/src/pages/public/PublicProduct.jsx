// client/src/pages/public/PublicProduct.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, Badge, Icon } from '../../components/common';
import { productsService, promotionService } from '../../services';
import { useAuth } from '../../context/AuthContext';
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
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [affiliateLink, setAffiliateLink] = useState(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);


  // Affiliate-Code speichern & tracken
  useEffect(() => {
    if (affiliateCode) {
      localStorage.setItem('monemee_ref', affiliateCode);
      localStorage.setItem('monemee_ref_product', productId);
      
      // Track click
      promotionService.trackClick(affiliateCode).catch(console.error);
    }
  }, [affiliateCode, productId]);

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
    if (!price || price === 0) return '0,00';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price * (commissionPercent / 100));
  }, []);

  // Kaufen Handler
  const handleBuy = async () => {
    const refCode = localStorage.getItem('monemee_ref');
    console.log('Buy product', productId, 'with ref:', refCode);
    alert('Checkout wird bald implementiert! 🚀');
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

  const isOwnProduct = user?.id === product.user_id;

  return (
    <div className={styles.productPage}>
      {/* Back Button */}
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <Icon name="chevronRight" size="md" style={{ transform: 'rotate(180deg)' }} />
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
            <div className={styles.creatorAvatar}>
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
          
          <Button 
            variant="primary" 
            size="large" 
            fullWidth 
            onClick={handleBuy}
            icon={<Icon name="shoppingBag" size="sm" />}
          >
            {product.price > 0 ? 'Jetzt kaufen' : 'Kostenlos herunterladen'}
          </Button>

          <div className={styles.trustBadges}>
            <div className={styles.trustItem}>
              <Icon name="checkCircle" size="sm" />
              <span>Sofortiger Zugang</span>
            </div>
            <div className={styles.trustItem}>
              <Icon name="creditCard" size="sm" />
              <span>Sichere Zahlung</span>
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

        {/* What's Included */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Icon name="package" size="sm" />
            Das bekommst du
          </h2>
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
        </div>

        {/* Creator Card */}
        <Card className={styles.creatorCard}>
          <h2 className={styles.sectionTitle}>
            <Icon name="user" size="sm" />
            Über den Creator
          </h2>
          <div className={styles.creatorProfile}>
            <div className={styles.creatorAvatarLarge}>
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
            onClick={() => navigate(`/@${product.creator_username}`)}
          >
            Store ansehen
            <Icon name="chevronRight" size="sm" />
          </Button>
        </Card>

        {/* Affiliate Section - Immer sichtbar */}
        {!isOwnProduct && (
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
      </div>
    </div>
  );
}

export default PublicProduct;