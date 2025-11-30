import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from '../../styles/components/Modal.module.css';

/**
 * Modal Component
 * Renders as a bottom sheet on mobile, centered on desktop
 */
function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'default', // 'small' | 'default' | 'large' | 'fullscreen'
  showHandle = true,
  closeOnOverlayClick = true
}) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  const modalClasses = [
    styles.modal,
    size !== 'default' && styles[size]
  ].filter(Boolean).join(' ');

  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={modalClasses} role="dialog" aria-modal="true">
        {/* Handle for mobile */}
        {showHandle && <div className={styles.handle} />}

        {/* Header */}
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button 
              className={styles.closeButton} 
              onClick={onClose}
              aria-label="Schließen"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body */}
        <div className={styles.body}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default Modal;