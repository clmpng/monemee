import React, { useState } from 'react';
import { Modal, Button, Icon } from '../common';
import styles from '../../styles/components/ShareProductModal.module.css';

/**
 * Share Templates für verschiedene Plattformen
 */
const shareTemplates = [
  {
    id: 'instagram',
    icon: 'camera',
    label: 'Instagram',
    getText: (title, url) => `Mein neues Produkt ist da!

"${title}" - jetzt verfügbar!

Link in Bio oder hier:
${url}

#digitalproducts #creator #monemee`
  },
  {
    id: 'tiktok',
    icon: 'video',
    label: 'TikTok',
    getText: (title, url) => `Neues Produkt online!

"${title}"

Link in Bio!
${url}`
  },
  {
    id: 'whatsapp',
    icon: 'message',
    label: 'WhatsApp',
    getText: (title, url) => `Hey!

Ich hab was Neues für dich: "${title}"

Schau mal hier: ${url}`
  }
];

/**
 * ShareProductModal - Erscheint nach erfolgreicher Produkt-Erstellung
 * Bietet vorgefertigte Share-Texte für Instagram, TikTok und WhatsApp
 */
function ShareProductModal({ isOpen, onClose, product, storeUrl }) {
  const [copiedId, setCopiedId] = useState(null);

  // Text in Zwischenablage kopieren
  const handleCopy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Nur den Link kopieren
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopiedId('link');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Produkttitel kürzen wenn zu lang
  const truncateTitle = (title, maxLength = 50) => {
    if (!title || title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  const productTitle = truncateTitle(product?.title);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Produkt veröffentlicht!"
      size="default"
      footer={
        <Button onClick={onClose} fullWidth>
          Weiter zu meinem Store
        </Button>
      }
    >
      <div className={styles.content}>
        {/* Header mit Celebration */}
        <div className={styles.header}>
          <div className={styles.celebrationIcon}>
            <Icon name="partyPopper" size={48} />
          </div>
          <p className={styles.subtitle}>
            <strong>"{productTitle}"</strong> ist jetzt live.
            <br />
            Teile es mit deiner Community!
          </p>
        </div>

        {/* Share Templates */}
        <div className={styles.templates}>
          {shareTemplates.map((template) => {
            const text = template.getText(productTitle, storeUrl);
            const isCopied = copiedId === template.id;

            return (
              <div key={template.id} className={styles.templateCard}>
                <div className={styles.templateHeader}>
                  <div className={styles.platformLabel}>
                    <Icon name={template.icon} size={16} />
                    <span>{template.label}</span>
                  </div>
                  <button
                    className={styles.copyButton}
                    onClick={() => handleCopy(template.id, text)}
                  >
                    {isCopied ? (
                      <span className={styles.copiedBadge}>
                        <Icon name="check" size={14} />
                        Kopiert!
                      </span>
                    ) : (
                      <>
                        <Icon name="copy" size={14} />
                        <span>Kopieren</span>
                      </>
                    )}
                  </button>
                </div>
                <div className={styles.templateText}>
                  {text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Link Section */}
        <div className={styles.linkSection}>
          <div className={styles.linkDisplay}>
            <Icon name="link" size={14} />
            <span className={styles.linkUrl}>{storeUrl}</span>
          </div>
          <button
            className={styles.linkCopyButton}
            onClick={handleCopyLink}
          >
            {copiedId === 'link' ? (
              <span className={styles.copiedBadge}>
                <Icon name="check" size={14} />
                Kopiert!
              </span>
            ) : (
              <>
                <Icon name="copy" size={14} />
                <span>Nur Link kopieren</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ShareProductModal;
