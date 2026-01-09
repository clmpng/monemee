// client/src/pages/dashboard/Purchases.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Button, Card } from '../../components/common';
import { purchasesService } from '../../services';
import styles from '../../styles/pages/Purchases.module.css';

/**
 * Purchases Page (Meine Käufe)
 *
 * Zeigt alle gekauften Produkte des Users mit:
 * - Produktinfo und Kaufdatum
 * - Ausklappbare Module-Ansicht
 * - Download-Buttons für Dateien
 * - Links für URL-Module
 */
function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPurchase, setExpandedPurchase] = useState(null);

  // Käufe laden
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const response = await purchasesService.getMyPurchases();

        if (response.success) {
          setPurchases(response.data || []);
        } else {
          setError(response.message || 'Käufe konnten nicht geladen werden');
        }
      } catch (err) {
        console.error('Fetch purchases error:', err);
        setError('Käufe konnten nicht geladen werden');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  // Datum formatieren
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Preis formatieren
  const formatPrice = (price) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Dateigröße formatieren
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Download-Handler
  const handleDownload = (moduleId) => {
    const downloadUrl = purchasesService.getDownloadUrl(moduleId);
    window.open(downloadUrl, '_blank');
  };

  // Kauf expandieren/kollabieren
  const toggleExpand = (purchaseId) => {
    setExpandedPurchase(expandedPurchase === purchaseId ? null : purchaseId);
  };

  // Icon für Modul-Typ
  const getModuleIcon = (type) => {
    switch (type) {
      case 'file':
        return 'file';
      case 'url':
        return 'link';
      case 'text':
        return 'fileText';
      case 'email':
        return 'mail';
      case 'videocall':
        return 'video';
      default:
        return 'package';
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className={`page ${styles.purchasesPage}`}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p>Käufe werden geladen...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={`page ${styles.purchasesPage}`}>
        <div className={styles.errorState}>
          <Icon name="alertCircle" size="xl" />
          <h3>Fehler beim Laden</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (purchases.length === 0) {
    return (
      <div className={`page ${styles.purchasesPage}`}>
        <div className="page-header">
          <h1 className="page-title">Meine Käufe</h1>
          <p className="page-subtitle">Deine gekauften digitalen Produkte</p>
        </div>

        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Icon name="shoppingBag" size={48} />
          </div>
          <h3>Noch keine Käufe</h3>
          <p>Du hast noch keine digitalen Produkte gekauft.</p>
          <Link to="/" className={styles.browseButton}>
            <Icon name="search" size="sm" />
            Produkte entdecken
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`page ${styles.purchasesPage}`}>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Meine Käufe</h1>
        <p className="page-subtitle">{purchases.length} {purchases.length === 1 ? 'Produkt' : 'Produkte'} gekauft</p>
      </div>

      {/* Purchases List */}
      <div className={styles.purchasesList}>
        {purchases.map((purchase) => {
          const isExpanded = expandedPurchase === purchase.transactionId;
          const hasModules = purchase.modules && purchase.modules.length > 0;
          const downloadableModules = purchase.modules?.filter(m => m.type === 'file' && m.fileUrl) || [];

          return (
            <div key={purchase.transactionId} className={styles.purchaseCard}>
              {/* Purchase Header */}
              <button
                className={styles.purchaseHeader}
                onClick={() => toggleExpand(purchase.transactionId)}
                disabled={!hasModules}
              >
                <div className={styles.productThumb}>
                  {purchase.productThumbnail ? (
                    <img src={purchase.productThumbnail} alt={purchase.productTitle} />
                  ) : (
                    <Icon name="package" size="md" />
                  )}
                </div>

                <div className={styles.purchaseInfo}>
                  <h3 className={styles.productTitle}>{purchase.productTitle}</h3>
                  <div className={styles.purchaseMeta}>
                    <span className={styles.purchaseDate}>
                      <Icon name="calendar" size="xs" />
                      {formatDate(purchase.purchaseDate)}
                    </span>
                    <span className={styles.purchasePrice}>
                      {formatPrice(purchase.amount)}
                    </span>
                  </div>
                  {purchase.sellerName && (
                    <span className={styles.sellerName}>
                      von {purchase.sellerName}
                    </span>
                  )}
                </div>

                {hasModules && (
                  <div className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}>
                    <Icon name="chevronDown" size="sm" />
                  </div>
                )}
              </button>

              {/* Quick Download Button (collapsed) */}
              {!isExpanded && downloadableModules.length > 0 && (
                <div className={styles.quickActions}>
                  <Button
                    variant="secondary"
                    size="small"
                    icon={<Icon name="download" size="sm" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (downloadableModules.length === 1) {
                        handleDownload(downloadableModules[0].id);
                      } else {
                        toggleExpand(purchase.transactionId);
                      }
                    }}
                  >
                    {downloadableModules.length === 1 ? 'Download' : `${downloadableModules.length} Downloads`}
                  </Button>
                </div>
              )}

              {/* Expanded Modules */}
              {isExpanded && hasModules && (
                <div className={styles.modulesSection}>
                  <div className={styles.modulesList}>
                    {purchase.modules.map((module) => (
                      <div key={module.id} className={styles.moduleItem}>
                        <div className={styles.moduleIcon}>
                          <Icon name={getModuleIcon(module.type)} size="sm" />
                        </div>

                        <div className={styles.moduleInfo}>
                          <span className={styles.moduleName}>
                            {module.title || module.fileName || 'Inhalt'}
                          </span>
                          {module.fileSize && (
                            <span className={styles.moduleSize}>
                              {formatFileSize(module.fileSize)}
                            </span>
                          )}
                          {module.type === 'text' && module.content && (
                            <p className={styles.moduleContent}>{module.content}</p>
                          )}
                        </div>

                        {/* Module Actions */}
                        <div className={styles.moduleActions}>
                          {module.type === 'file' && module.fileUrl && (
                            <button
                              className={styles.downloadButton}
                              onClick={() => handleDownload(module.id)}
                            >
                              <Icon name="download" size="sm" />
                              Download
                            </button>
                          )}
                          {module.type === 'url' && module.url && (
                            <a
                              href={module.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.linkButton}
                            >
                              <Icon name="externalLink" size="sm" />
                              {module.urlLabel || 'Öffnen'}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Hint */}
      <div className={styles.infoHint}>
        <Icon name="info" size="sm" />
        <p>
          Deine Käufe und Downloads sind hier dauerhaft verfügbar.
          Bei Problemen kontaktiere den Verkäufer direkt.
        </p>
      </div>
    </div>
  );
}

export default Purchases;
