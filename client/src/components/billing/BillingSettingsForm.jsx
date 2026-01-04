import React, { useState, useEffect } from 'react';
import { Icon } from '../common';
import styles from '../../styles/components/BillingSettingsForm.module.css';

/**
 * Billing Settings Form
 * Formular für gewerbliche Rechnungsdaten
 * Wird in Settings und nach SellerTypeModal verwendet
 */
function BillingSettingsForm({ 
  initialData = null, 
  onSave, 
  onCancel = null,
  loading = false,
  showCancel = true,
  submitLabel = 'Speichern'
}) {
  const [formData, setFormData] = useState({
    businessName: '',
    street: '',
    zip: '',
    city: '',
    country: 'DE',
    isSmallBusiness: false,
    taxId: ''
  });

  const [errors, setErrors] = useState({});

  // Initial Data laden
  useEffect(() => {
    if (initialData) {
      setFormData({
        businessName: initialData.businessName || '',
        street: initialData.street || '',
        zip: initialData.zip || '',
        city: initialData.city || '',
        country: initialData.country || 'DE',
        isSmallBusiness: initialData.isSmallBusiness || false,
        taxId: initialData.taxId || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Fehler bei Änderung löschen
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Name/Firma ist erforderlich';
    }
    if (!formData.street.trim()) {
      newErrors.street = 'Straße ist erforderlich';
    }
    if (!formData.zip.trim()) {
      newErrors.zip = 'PLZ ist erforderlich';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'Stadt ist erforderlich';
    }
    if (!formData.isSmallBusiness && !formData.taxId.trim()) {
      newErrors.taxId = 'USt-IdNr./Steuernummer ist erforderlich';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Business Name */}
      <div className={styles.field}>
        <label htmlFor="businessName" className={styles.label}>
          Name / Firma *
        </label>
        <input
          type="text"
          id="businessName"
          name="businessName"
          value={formData.businessName}
          onChange={handleChange}
          className={`${styles.input} ${errors.businessName ? styles.inputError : ''}`}
          placeholder="Max Mustermann oder Musterfirma GmbH"
          disabled={loading}
        />
        {errors.businessName && (
          <span className={styles.error}>{errors.businessName}</span>
        )}
      </div>

      {/* Street */}
      <div className={styles.field}>
        <label htmlFor="street" className={styles.label}>
          Straße & Hausnummer *
        </label>
        <input
          type="text"
          id="street"
          name="street"
          value={formData.street}
          onChange={handleChange}
          className={`${styles.input} ${errors.street ? styles.inputError : ''}`}
          placeholder="Musterstraße 123"
          disabled={loading}
        />
        {errors.street && (
          <span className={styles.error}>{errors.street}</span>
        )}
      </div>

      {/* PLZ & City */}
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor="zip" className={styles.label}>
            PLZ *
          </label>
          <input
            type="text"
            id="zip"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            className={`${styles.input} ${errors.zip ? styles.inputError : ''}`}
            placeholder="12345"
            maxLength={10}
            disabled={loading}
          />
          {errors.zip && (
            <span className={styles.error}>{errors.zip}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="city" className={styles.label}>
            Stadt *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
            placeholder="Musterstadt"
            disabled={loading}
          />
          {errors.city && (
            <span className={styles.error}>{errors.city}</span>
          )}
        </div>
      </div>

      {/* Small Business Checkbox */}
      <div className={styles.checkboxField}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="isSmallBusiness"
            checked={formData.isSmallBusiness}
            onChange={handleChange}
            className={styles.checkbox}
            disabled={loading}
          />
          <span className={styles.checkboxText}>
            <strong>Kleinunternehmer nach § 19 UStG</strong>
            <span className={styles.checkboxHint}>
              Jahresumsatz unter 22.000 € – keine MwSt. auf Rechnungen
            </span>
          </span>
        </label>
      </div>

      {/* Tax ID (nur wenn nicht Kleinunternehmer) */}
      {!formData.isSmallBusiness && (
        <div className={styles.field}>
          <label htmlFor="taxId" className={styles.label}>
            USt-IdNr. oder Steuernummer *
          </label>
          <input
            type="text"
            id="taxId"
            name="taxId"
            value={formData.taxId}
            onChange={handleChange}
            className={`${styles.input} ${errors.taxId ? styles.inputError : ''}`}
            placeholder="DE123456789 oder 123/456/78901"
            disabled={loading}
          />
          {errors.taxId && (
            <span className={styles.error}>{errors.taxId}</span>
          )}
          <span className={styles.hint}>
            Die USt-IdNr. beginnt mit DE, die Steuernummer hat das Format 123/456/78901
          </span>
        </div>
      )}

      {/* Info Box */}
      <div className={styles.infoBox}>
        <Icon name="info" size="sm" />
        <p>
          Diese Angaben erscheinen auf deinen Rechnungen an Käufer.
          Bei Änderungen werden nur zukünftige Rechnungen aktualisiert.
        </p>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {showCancel && onCancel && (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={loading}
          >
            Abbrechen
          </button>
        )}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? (
            <>
              <Icon name="loader" size="sm" className={styles.spinner} />
              Wird gespeichert...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}

export default BillingSettingsForm;
