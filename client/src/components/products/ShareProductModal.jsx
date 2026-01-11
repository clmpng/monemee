import React, { useState } from 'react';
import { Modal, Button, Icon } from '../common';
import styles from '../../styles/components/ShareProductModal.module.css';

/**
 * ShareProductModal - Erscheint nach erfolgreicher Produkt-Erstellung
 * Zeigt ein einfaches Share-Template mit Link zum Produkt
 */
function ShareProductModal({ isOpen, onClose, product, productUrl }) {
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);

  // Produkttitel kürzen wenn zu lang
  const truncateTitle = (title, maxLength = 50) => {
    if (!title || title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  const productTitle = truncateTitle(product?.title);

  // Allgemeiner Share-Text
  const shareText = `Mein neues Produkt ist da!

"${productTitle}" - jetzt verfügbar!

${productUrl}`;

  // Text in Zwischenablage kopieren
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setTextCopied(true);
      setTimeout(() => setTextCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Nur den Link kopieren
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="default"
      footer={
        <Button onClick={onClose} fullWidth>
          Fertig
        </Button>
      }
    >
      <div className={styles.content}>
        {/* Success Header */}
        <div className={styles.successHeader}>
          <div className={styles.successIcon}>
            <Icon name="check" size={32} />
          </div>
          <h2 className={styles.successTitle}>Produkt veröffentlicht!</h2>
          <p className={styles.successSubtitle}>
            <strong>"{productTitle}"</strong> ist jetzt live
          </p>
        </div>

        {/* Share Section */}
        <div className={styles.shareSection}>
          <p className={styles.shareLabel}>Teile dein Produkt</p>

          {/* Share Text Card */}
          <div className={styles.shareCard}>
            <div className={styles.shareText}>
              {shareText}
            </div>
            <button
              className={`${styles.copyTextButton} ${textCopied ? styles.copied : ''}`}
              onClick={handleCopyText}
            >
              {textCopied ? (
                <>
                  <Icon name="check" size={16} />
                  <span>Kopiert!</span>
                </>
              ) : (
                <>
                  <Icon name="copy" size={16} />
                  <span>Text kopieren</span>
                </>
              )}
            </button>
          </div>

          {/* Link Only */}
          <div className={styles.linkCard}>
            <div className={styles.linkContent}>
              <Icon name="link" size={16} />
              <span className={styles.linkUrl}>{productUrl}</span>
            </div>
            <button
              className={`${styles.copyLinkButton} ${copied ? styles.copied : ''}`}
              onClick={handleCopyLink}
            >
              {copied ? (
                <Icon name="check" size={16} />
              ) : (
                <Icon name="copy" size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ShareProductModal;
