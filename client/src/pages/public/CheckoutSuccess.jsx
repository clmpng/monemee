// client/src/pages/public/CheckoutSuccess.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, Icon } from '../../components/common';
import { paymentsService, invoiceService} from '../../services';
import styles from '../../styles/pages/CheckoutSuccess.module.css';

/**
 * Checkout Success Page
 * Shown after successful Stripe payment
 * URL: /checkout/success?session_id=...
 */
function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [invoiceUrl, setInvoiceUrl] = useState(null);

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

  // Check for invoice (nur bei gewerblichen Verkäufern)
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
              Keine Sorge - wenn die Zahlung erfolgreich war, findest du das Produkt in deinem Account.
            </p>
            <div className={styles.actions}>
              <Button variant="primary" onClick={() => navigate('/dashboard')}>
                Zum Dashboard
              </Button>
              <Button variant="secondary" onClick={() => navigate('/')}>
                Zur Startseite
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Success State
  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.successState}>
          {/* Success Animation */}
          <div className={styles.successIcon}>
            <Icon name="checkCircle" size={80} />
          </div>
          
          <h1 className={styles.title}>Kauf erfolgreich! 🎉</h1>
          
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

          {/* Info Box */}
          <div className={styles.infoBox}>
            <Icon name="info" size="sm" />
            <p>
              Du findest dein Produkt und alle Dateien in deinem{' '}
              <Link to="/dashboard/purchases">Käufe-Bereich</Link>.
            </p>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <Button 
              variant="primary" 
              size="large"
              onClick={() => navigate('/dashboard/purchases')}
              icon={<Icon name="download" size="sm" />}
            >
              Zu meinen Käufen
            </Button>
            
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
            Probleme? <Link to="/support">Kontaktiere unseren Support</Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default CheckoutSuccess;
