import React, { useState, useEffect } from 'react';
import { Icon } from '../common';
import { invoiceService } from '../../services';
import styles from '../../styles/components/InvoiceList.module.css';

/**
 * Invoice List Component
 * Zeigt Rechnungen für gewerbliche Verkäufer
 * Wird als Tab im Earnings Dashboard verwendet
 */
function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    offset: 0,
    limit: 20,
    hasMore: false
  });

  const fetchInvoices = async (offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await invoiceService.getMyInvoices({ 
        limit: pagination.limit, 
        offset 
      });
      
      if (response.success) {
        if (offset === 0) {
          setInvoices(response.data.invoices);
        } else {
          setInvoices(prev => [...prev, ...response.data.invoices]);
        }
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError('Rechnungen konnten nicht geladen werden');
      console.error('Fetch invoices error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    fetchInvoices(pagination.offset + pagination.limit);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatAmount = (amount, currency = 'EUR') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const handleViewInvoice = (accessToken) => {
    window.open(`/invoice/${accessToken}`, '_blank');
  };

  const handleCopyLink = async (accessToken) => {
    const url = `${window.location.origin}/invoice/${accessToken}`;
    try {
      await navigator.clipboard.writeText(url);
      // TODO: Toast notification
      alert('Link kopiert!');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Loading State
  if (loading && invoices.length === 0) {
    return (
      <div className={styles.loadingState}>
        <Icon name="loader" size="lg" className={styles.spinner} />
        <p>Rechnungen werden geladen...</p>
      </div>
    );
  }

  // Error State
  if (error && invoices.length === 0) {
    return (
      <div className={styles.errorState}>
        <Icon name="alertCircle" size="lg" />
        <p>{error}</p>
        <button onClick={() => fetchInvoices()} className={styles.retryButton}>
          Erneut versuchen
        </button>
      </div>
    );
  }

  // Empty State
  if (!loading && invoices.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Icon name="fileText" size="xl" />
        <h3>Noch keine Rechnungen</h3>
        <p>Sobald du Verkäufe tätigst, erscheinen hier deine Rechnungen.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Icon name="fileText" size="sm" />
          Rechnungen
        </h3>
        <span className={styles.count}>{pagination.total} gesamt</span>
      </div>

      {/* Invoice List */}
      <div className={styles.list}>
        {invoices.map((invoice) => (
          <div key={invoice.id} className={styles.invoiceItem}>
            <div className={styles.invoiceMain}>
              <div className={styles.invoiceInfo}>
                <span className={styles.invoiceNumber}>
                  {invoice.invoiceNumber}
                </span>
                <span className={styles.invoiceDate}>
                  {formatDate(invoice.issuedAt)}
                </span>
              </div>
              <div className={styles.invoiceDetails}>
                <span className={styles.buyerEmail}>{invoice.buyerEmail}</span>
                <span className={styles.productTitle}>{invoice.productTitle}</span>
              </div>
            </div>
            
            <div className={styles.invoiceRight}>
              <span className={styles.amount}>
                {formatAmount(invoice.grossAmount, invoice.currency)}
              </span>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => handleViewInvoice(invoice.accessToken)}
                  title="Rechnung anzeigen"
                >
                  <Icon name="externalLink" size="sm" />
                </button>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => handleCopyLink(invoice.accessToken)}
                  title="Link kopieren"
                >
                  <Icon name="link" size="sm" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {pagination.hasMore && (
        <div className={styles.loadMore}>
          <button
            type="button"
            className={styles.loadMoreButton}
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <Icon name="loader" size="sm" className={styles.spinner} />
                Laden...
              </>
            ) : (
              'Mehr laden'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default InvoiceList;
