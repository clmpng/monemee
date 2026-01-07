import React, { useEffect } from 'react';
import { Icon } from './Icon';
import styles from '../../styles/components/Toast.module.css';

/**
 * Toast Notification Component
 * Shows temporary notifications (success, error, info)
 */
function Toast({ message, variant = 'success', duration = 4000, onClose }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: 'checkCircle',
    error: 'alertCircle',
    info: 'info'
  };

  return (
    <div className={`${styles.toast} ${styles[`toast-${variant}`]}`}>
      <div className={styles.toastIcon}>
        <Icon name={icons[variant]} size="sm" />
      </div>
      <span className={styles.toastMessage}>{message}</span>
      <button onClick={onClose} className={styles.toastClose}>
        <Icon name="x" size="sm" />
      </button>
    </div>
  );
}

/**
 * Toast Container Component
 * Manages multiple toasts
 */
function ToastContainer({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export { Toast, ToastContainer };
