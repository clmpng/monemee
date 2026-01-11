// client/src/pages/public/CheckoutSuccess.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, Icon } from '../../components/common';
import { paymentsService, invoiceService, purchasesService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/pages/CheckoutSuccess.module.css';

/**
 * Checkout Success Page
 * Shown after successful Stripe payment
 * URL: /checkout/success?session_id=...
 *
 * Unterstützt Gast-Checkout:
 * - Zeigt Download-Buttons direkt an
 * - Zeigt Hinweis für Account-Erstellung
 */
function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const { isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [invoiceUrl, setInvoiceUrl] = useState(null);
  const [purchaseData, setPurchaseData] = useState(null);
  const [modulesLoading, setModulesLoading] = useState(false);

  // Zahlung verifizieren
  useEffect(() => {
    if (!sessionId) {
      setError('Keine Session-ID vorhanden');
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        setLoading(true);

        const response = await paymentsService.verifySession(sessionId);

        if (response.success) {
          setPaymentData(response.data);

          // Affiliate-Code aus LocalStorage entfernen
          localStorage.removeItem('monemee_ref');
          localStorage.removeItem('monemee_ref_product');
        } else {
          setError(response.message || 'Zahlung konnte nicht verifiziert werden');
        }
      } catch (err) {
        console.error('Verify payment error:', err);
        setError('Zahlung konnte nicht verifiziert werden');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  // Produkt-Module laden (für Download-Buttons)
  useEffect(() => {
    if (!sessionId || !paymentData) return;

    const loadPurchaseData = async () => {
      try {
        setModulesLoading(true);
        const response = await purchasesService.getPurchaseBySession(sessionId);

        if (response.success) {
          setPurchaseData(response.data);
        }
      } catch (err) {
        console.error('Load purchase data error:', err);
        // Nicht kritisch - Downloads auch per E-Mail verfügbar
      } finally {
        setModulesLoading(false);
      }
    };

    loadPurchaseData();
  }, [sessionId, paymentData]);

  // Rechnung prüfen (nur bei gewerblichen Verkäufern)
  useEffect(() => {
    if (paymentData?.transactionId) {
      invoiceService.getInvoiceByTransaction(paymentData.transactionId)
        .then(res => {
          if (res.success && res.data.hasInvoice) {
            setInvoiceUrl(res.data.publicUrl);
          }
        })
        .catch(err => {
          console.error('Invoice check error:', err);
        });
    }
  }, [paymentData]);

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
  const handleDownload = (module) => {
    if (module.fileUrl) {
      window.open(module.fileUrl, '_blank');
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}>
            <Icon name="loader" size={48} />
          </div>
          <h2>Zahlung wird bestätigt...</h2>
          <p>Bitte warte einen Moment.</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={styles.container}>
        <Card className={styles.card}>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>
              <Icon name="alertCircle" size={64} />
            </div>
            <h1>Fehler bei der Verifizierung</h1>
            <p>{error}</p>
            <p className={styles.hint}>
              Keine Sorge - wenn die Zahlung erfolgreich war, erhältst du eine E-Mail mit deinem Download-Link.
            </p>
            <div className={styles.actions}>
              <Button variant="primary" onClick={() => navigate('/')}>
                Zur Startseite
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Downloadable modules filtern
  const downloadableModules = purchaseData?.modules?.filter(m => m.type === 'file' && m.fileUrl) || [];
  const otherModules = purchaseData?.modules?.filter(m => m.type !== 'file' || !m.fileUrl) || [];
  const isGuest = purchaseData?.isGuest || !isAuthenticated;

  // Success State
  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.successState}>
          {/* Success Animation */}
          <div className={styles.successIcon}>
            <Icon name="checkCircle" size={80} />
          </div>

          <h1 className={styles.title}>Kauf erfolgreich!</h1>

          <p className={styles.message}>
            Vielen Dank für deinen Einkauf! Du hast jetzt Zugang zu deinem Produkt.
          </p>

          {/* Payment Details */}
          {paymentData && (
            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span>Bezahlter Betrag:</span>
                <span className={styles.amount}>{formatPrice(paymentData.amount)}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Status:</span>
                <span className={styles.status}>
                  <Icon name="checkCircle" size="sm" />
                  Bezahlt
                </span>
              </div>
            </div>
          )}

          {/* Download Section */}
          {modulesLoading ? (
            <div className={styles.modulesLoading}>
              <Icon name="loader" size="sm" />
              <span>Downloads werden geladen...</span>
            </div>
          ) : downloadableModules.length > 0 && (
            <div className={styles.downloadSection}>
              <h3 className={styles.downloadTitle}>
                <Icon name="download" size="sm" />
                Deine Downloads
              </h3>
              <div className={styles.downloadList}>
                {downloadableModules.map((module) => (
                  <button
                    key={module.id}
                    className={styles.downloadItem}
                    onClick={() => handleDownload(module)}
                  >
                    <div className={styles.downloadIcon}>
                      <Icon name="file" size="md" />
                    </div>
                    <div className={styles.downloadInfo}>
                      <span className={styles.downloadName}>
                        {module.title || module.fileName || 'Datei herunterladen'}
                      </span>
                      {module.fileSize && (
                        <span className={styles.downloadSize}>
                          {formatFileSize(module.fileSize)}
                        </span>
                      )}
                    </div>
                    <Icon name="download" size="sm" className={styles.downloadArrow} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Other Modules (URLs, Text, etc.) */}
          {otherModules.length > 0 && (
            <div className={styles.otherModules}>
              {otherModules.map((module) => (
                <div key={module.id} className={styles.moduleItem}>
                  {module.type === 'url' && module.url && (
                    <a
                      href={module.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkModule}
                    >
                      <Icon name="link" size="sm" />
                      <span>{module.urlLabel || module.title || 'Link öffnen'}</span>
                      <Icon name="externalLink" size="sm" />
                    </a>
                  )}
                  {module.type === 'text' && module.content && (
                    <div className={styles.textModule}>
                      <h4>{module.title || 'Inhalt'}</h4>
                      <p>{module.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* E-Mail Info */}
          <div className={styles.infoBox}>
            <Icon name="mail" size="sm" />
            <p>
              Eine Kaufbestätigung mit Download-Link wurde an deine E-Mail gesendet.
            </p>
          </div>

          {/* Guest Hint - Account erstellen */}
          {isGuest && (
            <div className={styles.guestHint}>
              <Icon name="user" size="sm" />
              <div>
                <p>
                  <strong>Tipp:</strong> Erstelle einen kostenlosen Account, um jederzeit auf deine Käufe zuzugreifen.
                </p>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => navigate('/register')}
                  style={{ marginTop: '8px' }}
                >
                  Kostenlos registrieren
                </Button>
              </div>
            </div>
          )}

          {/* Affiliate Promotion Hint */}
          {purchaseData?.productId && (
            <div className={styles.affiliateHint}>
              <Icon name="dollarCircle" size="sm" />
              <div>
                <p>
                  <strong>Hat dir das Produkt gefallen?</strong> Teile es mit deiner Community und verdiene{' '}
                  {purchaseData.affiliateCommission || 30}% an jedem Verkauf.
                </p>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => navigate(`/p/${purchaseData.productId}`)}
                  style={{ marginTop: '8px' }}
                >
                  Affiliate-Link erstellen
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            {isAuthenticated && (
              <Button
                variant="primary"
                size="large"
                onClick={() => navigate('/dashboard/purchases')}
                icon={<Icon name="shoppingBag" size="sm" />}
              >
                Zu meinen Käufen
              </Button>
            )}

            {invoiceUrl && (
              <a
                href={invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.invoiceLink}
              >
                <Icon name="fileText" size="sm" />
                Rechnung anzeigen
              </a>
            )}

            <Button
              variant="secondary"
              onClick={() => navigate('/')}
            >
              Weiter stöbern
            </Button>
          </div>

          {/* Support Hint */}
          <p className={styles.support}>
            Probleme? <Link to="/impressum">Kontaktiere uns</Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default CheckoutSuccess;
