import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../../components/common';
import { usersService, messagesService } from '../../services';
import {
  getTheme,
  getAvatarStyle,
  getButtonStyle,
  getCardStyle,
  getHeaderBackground,
  getFontFamily,
  getSpacingOption
} from '../../config/themes';
import styles from '../../styles/pages/PublicStore.module.css';
import { LegalFooter } from '../../components/common';

/**
 * Public Store Page - Buyer View
 * Modern profile design with contact form
 */
function PublicStore() {
  const { username } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

  // Contact form state
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    sender_name: '',
    sender_email: '',
    message: ''
  });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [messageError, setMessageError] = useState(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await usersService.getPublicStore(username);
        
        if (response.success) {
          setStore(response.data.store);
          setProducts(response.data.products || []);
        } else {
          setError('Store nicht gefunden');
        }
      } catch (err) {
        console.error('Error fetching store:', err);
        setError('Store konnte nicht geladen werden');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchStore();
    }
  }, [username]);

  // Reset avatar error when store avatar changes
  useEffect(() => {
    setAvatarError(false);
  }, [store?.avatar]);

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Format price
  const formatPrice = (price) => {
    if (!price || price === 0) return 'Kostenlos';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Handle contact form change
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
    setMessageError(null);
  };

  // Handle contact form submit
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    if (!contactForm.sender_name.trim() || !contactForm.sender_email.trim() || !contactForm.message.trim()) {
      setMessageError('Bitte fülle alle Felder aus');
      return;
    }
    
    setSendingMessage(true);
    setMessageError(null);
    
    try {
      const response = await messagesService.sendMessage({
        recipient_username: username,
        sender_name: contactForm.sender_name.trim(),
        sender_email: contactForm.sender_email.trim(),
        message: contactForm.message.trim()
      });
      
      if (response.success) {
        setMessageSent(true);
        setContactForm({ sender_name: '', sender_email: '', message: '' });
        setTimeout(() => {
          setShowContactForm(false);
          setMessageSent(false);
        }, 3000);
      } else {
        setMessageError(response.message || 'Fehler beim Senden');
      }
    } catch (err) {
      setMessageError('Nachricht konnte nicht gesendet werden');
    } finally {
      setSendingMessage(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className={styles.publicStore}>
        <Header />
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p>Store wird geladen...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !store) {
    return (
      <div className={styles.publicStore}>
        <Header />
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>
            <Icon name="searchX" size={48} />
          </div>
          <h2>Store nicht gefunden</h2>
          <p>Der Store @{username} existiert nicht oder ist nicht verfügbar.</p>
          <Link to="/" className={styles.backLink}>
            <Icon name="chevronLeft" size="sm" />
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  // Get theme configuration and styles
  const settings = store?.settings || {};
  const themeConfig = getTheme(settings.theme || 'classic');
  const avatarStyle = getAvatarStyle(settings.avatarStyle || 'round');
  const buttonStyle = getButtonStyle(settings.buttonStyle || 'rounded');
  const cardStyle = getCardStyle(settings.cardStyle || 'elevated');
  const headerBackground = getHeaderBackground(settings.headerBackground || 'solid');
  const fontFamily = getFontFamily(settings.fontFamily || 'modern');
  const spacingOption = getSpacingOption(settings.spacing || 'normal');
  const gridLayout = settings.layout?.productGrid || 'two-column';

  // Generate header background style
  const getHeaderBackgroundStyle = () => {
    switch (headerBackground.type) {
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${themeConfig.primary} 0%, ${themeConfig.primaryLight} 100%)`
        };
      case 'pattern':
        return {
          background: themeConfig.primary,
          backgroundImage: `radial-gradient(circle, ${themeConfig.primaryLight} 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        };
      default:
        return {
          background: themeConfig.primary
        };
    }
  };

  return (
    <div
      className={styles.publicStore}
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
      <Header />
      
      {/* Profile Section */}
      <section className={styles.profileSection}>
        {/* Background Decoration */}
        <div className={styles.profileBg} style={getHeaderBackgroundStyle()}>
          <div className={styles.profileBgWave} />
        </div>
        
        <div className={styles.profileContent}>
          {/* Avatar */}
          <div className={styles.avatarWrapper}>
            <div
              className={styles.avatar}
              style={{
                borderRadius: avatarStyle.borderRadius,
                clipPath: avatarStyle.clipPath || 'none'
              }}
            >
              {store.avatar && !avatarError ? (
                <img
                  src={store.avatar}
                  alt={store.name}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span>{getInitials(store.name)}</span>
              )}
            </div>
            {store.level > 1 && (
              <div className={styles.levelBadge}>
                <Icon name="star" size={14} />
              </div>
            )}
          </div>
          
          {/* Profile Info */}
          <h1 className={styles.storeName}>{store.name}</h1>
          <p className={styles.storeHandle}>@{store.username}</p>
          
          {/* Bio */}
          {store.bio && (
            <p className={styles.storeBio}>{store.bio}</p>
          )}
          
          {/* Action Buttons */}
          <div className={styles.profileActions}>
            <button 
              className={styles.contactButton}
              onClick={() => setShowContactForm(true)}
            >
              <Icon name="message" size="sm" />
              Nachricht senden
            </button>
          </div>
          
          {/* Trust Indicators */}
          <div className={styles.trustIndicators}>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>
                <Icon name="lock" size={18} />
              </div>
              <div className={styles.trustText}>
                <span className={styles.trustLabel}>Sichere</span>
                <span className={styles.trustValue}>Zahlung</span>
              </div>
            </div>
            <div className={styles.trustDivider} />
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>
                <Icon name="zap" size={18} />
              </div>
              <div className={styles.trustText}>
                <span className={styles.trustLabel}>Sofort</span>
                <span className={styles.trustValue}>Download</span>
              </div>
            </div>
            <div className={styles.trustDivider} />
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>
                <Icon name="clock" size={18} />
              </div>
              <div className={styles.trustText}>
                <span className={styles.trustLabel}>24/7</span>
                <span className={styles.trustValue}>Verfügbar</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className={styles.productsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            <Icon name="package" size="sm" />
            Produkte
            <span className={styles.productCount}>{products.length}</span>
          </h2>
          
          {products.length > 0 ? (
            <div className={`${styles.productsGrid} ${styles['grid-' + gridLayout]}`}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyProducts}>
              <Icon name="package" size={48} />
              <p>Noch keine Produkte verfügbar</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Modal */}
      {showContactForm && (
        <div className={styles.modalOverlay} onClick={() => !sendingMessage && setShowContactForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.modalClose}
              onClick={() => setShowContactForm(false)}
              disabled={sendingMessage}
            >
              <Icon name="close" size="md" />
            </button>
            
            <div className={styles.modalHeader}>
              <div className={styles.modalAvatar}>
                {store.avatar && !avatarError ? (
                  <img
                    src={store.avatar}
                    alt={store.name}
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span>{getInitials(store.name)}</span>
                )}
              </div>
              <h3>Nachricht an {store.name}</h3>
              <p>@{store.username}</p>
            </div>
            
            {messageSent ? (
              <div className={styles.successMessage}>
                <div className={styles.successIcon}>
                  <Icon name="checkCircle" size={48} />
                </div>
                <h4>Nachricht gesendet!</h4>
                <p>{store.name} erhält deine Nachricht.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className={styles.contactForm}>
                <div className={styles.formField}>
                  <label>Dein Name</label>
                  <input
                    type="text"
                    name="sender_name"
                    value={contactForm.sender_name}
                    onChange={handleContactChange}
                    placeholder="Max Mustermann"
                    disabled={sendingMessage}
                  />
                </div>
                
                <div className={styles.formField}>
                  <label>Deine E-Mail</label>
                  <input
                    type="email"
                    name="sender_email"
                    value={contactForm.sender_email}
                    onChange={handleContactChange}
                    placeholder="max@example.com"
                    disabled={sendingMessage}
                  />
                </div>
                
                <div className={styles.formField}>
                  <label>Deine Nachricht</label>
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    placeholder="Schreibe deine Nachricht hier..."
                    rows={4}
                    disabled={sendingMessage}
                  />
                </div>
                
                {messageError && (
                  <div className={styles.formError}>
                    <Icon name="alertCircle" size="sm" />
                    {messageError}
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className={styles.sendButton}
                  disabled={sendingMessage}
                >
                  {sendingMessage ? (
                    <>
                      <Icon name="loader" size="sm" className={styles.spinner} />
                      Wird gesendet...
                    </>
                  ) : (
                    <>
                      <Icon name="send" size="sm" />
                      Nachricht senden
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <LegalFooter variant="compact" />
    </div>
  );
}

/**
 * Header Component
 */
function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>
            <Icon name="dollarCircle" size="md" />
          </span>
          <span className={styles.logoText}>MoneMee</span>
        </Link>
        
        <Link to="/login" className={styles.loginButton}>
          Anmelden
        </Link>
      </div>
    </header>
  );
}

/**
 * Product Card Component
 */
function ProductCard({ product, formatPrice }) {
  const isFree = !product.price || product.price === 0;
  
  return (
    <Link to={`/p/${product.id}`} className={styles.productCard}>
      {/* Thumbnail */}
      <div className={styles.productThumbnail}>
        {product.thumbnail ? (
          <img src={product.thumbnail} alt={product.title} />
        ) : (
          <div className={styles.productPlaceholder}>
            <Icon name="image" size={32} />
          </div>
        )}
        {isFree && <span className={styles.freeBadge}>Kostenlos</span>}
      </div>
      
      {/* Content */}
      <div className={styles.productContent}>
        <h3 className={styles.productTitle}>{product.title}</h3>
        {product.description && (
          <p className={styles.productDescription}>{product.description}</p>
        )}
        
        <div className={styles.productFooter}>
          <span className={`${styles.productPrice} ${isFree ? styles.productPriceFree : ''}`}>
            {formatPrice(product.price)}
          </span>
          <span className={styles.productCta}>
            Ansehen
            <Icon name="chevronRight" size="sm" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default PublicStore;
