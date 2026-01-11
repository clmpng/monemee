import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon, Button } from '../../components/common';
import { reportsService } from '../../services';
import styles from '../../styles/pages/ReportContent.module.css';

/**
 * Report Content Form
 *
 * DSA-konformes Meldeformular (Art. 16 DSA)
 * Ermöglicht das Melden von regelwidrigen Inhalten
 *
 * URL: /melden oder /melden?product=123
 */
function ReportContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledProductId = searchParams.get('product');

  // Form State
  const [formData, setFormData] = useState({
    productUrl: prefilledProductId ? `https://monemee.de/p/${prefilledProductId}` : '',
    reason: '',
    description: '',
    reporterEmail: '',
    reporterName: '',
    confirmTruthful: false
  });

  // UI State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [reportId, setReportId] = useState(null);

  // Meldegründe gemäß DSA
  const REPORT_REASONS = [
    { value: '', label: 'Bitte wählen...' },
    { value: 'copyright', label: 'Urheberrechtsverletzung' },
    { value: 'fraud', label: 'Betrug / Irreführung' },
    { value: 'illegal', label: 'Illegale Inhalte' },
    { value: 'harmful', label: 'Schädliche Inhalte (Malware, etc.)' },
    { value: 'hate', label: 'Hassrede / Diskriminierung' },
    { value: 'privacy', label: 'Verletzung der Privatsphäre' },
    { value: 'other', label: 'Sonstiger Verstoß' }
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.productUrl.trim()) {
      newErrors.productUrl = 'Bitte gib die URL oder Produkt-ID an';
    }

    if (!formData.reason) {
      newErrors.reason = 'Bitte wähle einen Meldegrund';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Bitte beschreibe den Verstoß';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Bitte beschreibe den Verstoß ausführlicher (mind. 20 Zeichen)';
    }

    if (!formData.confirmTruthful) {
      newErrors.confirmTruthful = 'Bitte bestätige, dass deine Angaben wahrheitsgemäß sind';
    }

    // E-Mail validieren wenn angegeben
    if (formData.reporterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.reporterEmail)) {
      newErrors.reporterEmail = 'Bitte gib eine gültige E-Mail-Adresse an';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await reportsService.submitReport({
        product_url: formData.productUrl.trim(),
        reason: formData.reason,
        description: formData.description.trim(),
        reporter_email: formData.reporterEmail.trim() || null,
        reporter_name: formData.reporterName.trim() || null
      });

      if (response.success) {
        setReportId(response.data.reportId);
        setIsSubmitted(true);
      } else {
        throw new Error(response.message || 'Meldung konnte nicht gesendet werden');
      }
    } catch (err) {
      console.error('Report submission error:', err);
      setSubmitError(
        err.message || 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success State
  if (isSubmitted) {
    return (
      <div className={styles.reportPage}>
        <header className={styles.header}>
          <button
            className={styles.backButton}
            onClick={() => navigate(-1)}
            aria-label="Zurück"
          >
            <Icon name="chevronLeft" size="md" />
          </button>
          <h1 className={styles.headerTitle}>Meldung eingereicht</h1>
        </header>

        <main className={styles.content}>
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>
              <Icon name="checkCircle" size={64} />
            </div>
            <h1 className={styles.successTitle}>Vielen Dank für deine Meldung</h1>
            <p className={styles.successText}>
              Wir haben deine Meldung erhalten und werden sie zeitnah prüfen.
            </p>

            {reportId && (
              <div className={styles.reportIdBox}>
                <span className={styles.reportIdLabel}>Meldungs-ID:</span>
                <code className={styles.reportIdValue}>{reportId}</code>
              </div>
            )}

            <div className={styles.nextSteps}>
              <h2 className={styles.nextStepsTitle}>Wie geht es weiter?</h2>
              <ul className={styles.nextStepsList}>
                <li>
                  <Icon name="clock" size="sm" />
                  <span>Wir prüfen deine Meldung innerhalb von 24-48 Stunden</span>
                </li>
                <li>
                  <Icon name="shield" size="sm" />
                  <span>Bei berechtigten Meldungen ergreifen wir entsprechende Maßnahmen</span>
                </li>
                {formData.reporterEmail && (
                  <li>
                    <Icon name="mail" size="sm" />
                    <span>Du erhältst eine Benachrichtigung per E-Mail über das Ergebnis</span>
                  </li>
                )}
              </ul>
            </div>

            <div className={styles.successActions}>
              <Button
                variant="primary"
                onClick={() => navigate('/')}
                fullWidth
              >
                Zur Startseite
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    productUrl: '',
                    reason: '',
                    description: '',
                    reporterEmail: formData.reporterEmail,
                    reporterName: formData.reporterName,
                    confirmTruthful: false
                  });
                }}
              >
                Weitere Meldung einreichen
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.reportPage}>
      {/* Header */}
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => navigate(-1)}
          aria-label="Zurück"
        >
          <Icon name="chevronLeft" size="md" />
        </button>
        <h1 className={styles.headerTitle}>Inhalt melden</h1>
      </header>

      {/* Content */}
      <main className={styles.content}>
        <div className={styles.introSection}>
          <h1 className={styles.pageTitle}>Regelwidrigen Inhalt melden</h1>
          <p className={styles.introText}>
            Wenn du auf Inhalte gestoßen bist, die gegen unsere{' '}
            <Link to="/inhaltsrichtlinien" className={styles.link}>Inhaltsrichtlinien</Link>{' '}
            oder geltendes Recht verstoßen, kannst du sie hier melden. Wir prüfen jede
            Meldung sorgfältig und ergreifen bei Verstößen entsprechende Maßnahmen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Product URL */}
          <div className={styles.formGroup}>
            <label htmlFor="productUrl" className={styles.label}>
              Produkt-URL oder Produkt-ID <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="productUrl"
              name="productUrl"
              value={formData.productUrl}
              onChange={handleChange}
              placeholder="z.B. https://monemee.de/p/123 oder 123"
              className={`${styles.input} ${errors.productUrl ? styles.inputError : ''}`}
            />
            {errors.productUrl && (
              <p className={styles.errorText}>{errors.productUrl}</p>
            )}
            <p className={styles.hint}>
              Kopiere die URL aus der Adresszeile oder gib die Produkt-ID an
            </p>
          </div>

          {/* Reason */}
          <div className={styles.formGroup}>
            <label htmlFor="reason" className={styles.label}>
              Meldegrund <span className={styles.required}>*</span>
            </label>
            <select
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className={`${styles.select} ${errors.reason ? styles.inputError : ''}`}
            >
              {REPORT_REASONS.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
            {errors.reason && (
              <p className={styles.errorText}>{errors.reason}</p>
            )}
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Beschreibung des Verstoßes <span className={styles.required}>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Bitte beschreibe genau, warum dieser Inhalt gegen die Richtlinien verstößt..."
              className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
            />
            {errors.description && (
              <p className={styles.errorText}>{errors.description}</p>
            )}
            <p className={styles.hint}>
              Je genauer deine Beschreibung, desto schneller können wir die Meldung bearbeiten
            </p>
          </div>

          {/* Contact Info (optional) */}
          <div className={styles.optionalSection}>
            <h2 className={styles.optionalTitle}>
              <Icon name="mail" size="sm" />
              Kontaktdaten (optional)
            </h2>
            <p className={styles.optionalText}>
              Wenn du über das Ergebnis der Prüfung informiert werden möchtest,
              hinterlasse deine Kontaktdaten. Diese werden vertraulich behandelt.
            </p>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="reporterName" className={styles.label}>
                  Name
                </label>
                <input
                  type="text"
                  id="reporterName"
                  name="reporterName"
                  value={formData.reporterName}
                  onChange={handleChange}
                  placeholder="Max Mustermann"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="reporterEmail" className={styles.label}>
                  E-Mail
                </label>
                <input
                  type="email"
                  id="reporterEmail"
                  name="reporterEmail"
                  value={formData.reporterEmail}
                  onChange={handleChange}
                  placeholder="max@beispiel.de"
                  className={`${styles.input} ${errors.reporterEmail ? styles.inputError : ''}`}
                />
                {errors.reporterEmail && (
                  <p className={styles.errorText}>{errors.reporterEmail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div className={styles.confirmSection}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="confirmTruthful"
                checked={formData.confirmTruthful}
                onChange={handleChange}
                className={styles.checkboxInput}
              />
              <span className={styles.checkboxCustom}>
                {formData.confirmTruthful && <Icon name="check" size="xs" />}
              </span>
              <span className={styles.checkboxText}>
                Ich bestätige, dass die obigen Angaben nach meinem besten Wissen wahrheitsgemäß
                und vollständig sind. Mir ist bekannt, dass wissentlich falsche Angaben
                rechtliche Konsequenzen haben können. <span className={styles.required}>*</span>
              </span>
            </label>
            {errors.confirmTruthful && (
              <p className={styles.errorText}>{errors.confirmTruthful}</p>
            )}
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className={styles.submitError}>
              <Icon name="alertCircle" size="sm" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Wird gesendet...' : 'Meldung absenden'}
          </Button>

          {/* Legal Note */}
          <p className={styles.legalNote}>
            Diese Meldung wird gemäß Art. 16 des Digital Services Act (DSA) bearbeitet.
            Weitere Informationen findest du in unserer{' '}
            <Link to="/datenschutz" className={styles.link}>Datenschutzerklärung</Link>.
          </p>
        </form>
      </main>
    </div>
  );
}

export default ReportContent;
