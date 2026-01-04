import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '../../components/common';
import { invoiceService } from '../../services';
import styles from '../../styles/pages/InvoiceView.module.css';

/**
 * Public Invoice View Page
 * Zeigt eine Rechnung öffentlich an (kein Login nötig)
 * Route: /invoice/:token
 */
function InvoiceView() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await invoiceService.getPublicInvoice(token);
        
        if (response.success) {
          setInvoice(response.data.invoice);
        } else {
          setError(response.message || 'Rechnung nicht gefunden');
        }
      } catch (err) {
        setError('Rechnung konnte nicht geladen werden');
        console.error('Fetch invoice error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInvoice();
    }
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount, currency = 'EUR') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency
    }).format(amount);
  };

  // Loading State
  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <Icon name="loader" size="xl" className={styles.spinner} />
        <p>Rechnung wird geladen...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={styles.errorPage}>
        <Icon name="alertCircle" size="xl" />
        <h2>Rechnung nicht gefunden</h2>
        <p>{error}</p>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/')}
        >
          Zur Startseite
        </button>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className={styles.page}>
      {/* Print Header (nur sichtbar beim Drucken) */}
      <div className={styles.printOnly}>
        {/* Wird nur beim Drucken angezeigt */}
      </div>

      {/* Action Bar (nicht beim Drucken) */}
      <div className={styles.actionBar}>
        <div className={styles.actionBarContent}>
          <span className={styles.invoiceLabel}>
            Rechnung {invoice.invoiceNumber}
          </span>
          <button 
            className={styles.printButton}
            onClick={handlePrint}
          >
            <Icon name="printer" size="sm" />
            Drucken / PDF
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className={styles.invoiceWrapper}>
        <div className={styles.invoice}>
          {/* Header */}
          <header className={styles.invoiceHeader}>
            <div className={styles.invoiceTitle}>RECHNUNG</div>
          </header>

          {/* Seller Info */}
          <div className={styles.sellerSection}>
            <div className={styles.sellerAddress}>
              {invoice.seller.name}
              <br />
              {invoice.seller.address.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
              {invoice.seller.taxId && (
                <>
                  <br />
                  {invoice.seller.taxId.startsWith('DE') 
                    ? `USt-IdNr.: ${invoice.seller.taxId}`
                    : `Steuernummer: ${invoice.seller.taxId}`
                  }
                </>
              )}
            </div>
          </div>

          {/* Invoice Meta */}
          <div className={styles.metaSection}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Rechnungsnummer</span>
              <span className={styles.metaValue}>{invoice.invoiceNumber}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Rechnungsdatum</span>
              <span className={styles.metaValue}>{invoice.issuedAt}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Leistungsdatum</span>
              <span className={styles.metaValue}>{invoice.serviceDate}</span>
            </div>
          </div>

          {/* Buyer Info */}
          <div className={styles.buyerSection}>
            <span className={styles.buyerLabel}>Kunde:</span>
            <span className={styles.buyerEmail}>{invoice.buyer.email}</span>
          </div>

          {/* Line Items */}
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th className={styles.thDescription}>Beschreibung</th>
                <th className={styles.thAmount}>Betrag</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className={styles.tdDescription}>
                    {item.description}
                  </td>
                  <td className={styles.tdAmount}>
                    {formatCurrency(item.total, invoice.totals.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className={styles.totalsSection}>
            {/* Bei MwSt: Netto + MwSt anzeigen */}
            {invoice.totals.taxRate > 0 && (
              <>
                <div className={styles.totalRow}>
                  <span>Nettobetrag</span>
                  <span>{formatCurrency(invoice.totals.net, invoice.totals.currency)}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>MwSt. ({invoice.totals.taxRate}%)</span>
                  <span>{formatCurrency(invoice.totals.tax, invoice.totals.currency)}</span>
                </div>
              </>
            )}
            
            <div className={`${styles.totalRow} ${styles.totalGross}`}>
              <span>Gesamtbetrag</span>
              <span>{formatCurrency(invoice.totals.gross, invoice.totals.currency)}</span>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className={styles.notesSection}>
              <p>{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <footer className={styles.invoiceFooter}>
            <p>Vielen Dank für Ihren Einkauf!</p>
            <p className={styles.paymentNote}>
              Zahlung erhalten via Stripe
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default InvoiceView;
