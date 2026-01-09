/**
 * E-Mail Service
 * Unterstützt Resend und SMTP (Nodemailer) als Fallback
 *
 * Priorität:
 * 1. Resend (wenn RESEND_API_KEY gesetzt)
 * 2. SMTP (wenn SMTP_HOST gesetzt)
 *
 * Konfiguration in .env:
 *
 * Option 1 - Resend:
 * - RESEND_API_KEY: API-Key von resend.com
 * - EMAIL_FROM: Absender-E-Mail
 *
 * Option 2 - SMTP:
 * - SMTP_HOST: SMTP Server (z.B. mail.example.com)
 * - SMTP_PORT: Port (default: 587)
 * - SMTP_SECURE: true für SSL/465, false für TLS/587 (default: false)
 * - SMTP_USER: Benutzername
 * - SMTP_PASS: Passwort
 * - EMAIL_FROM: Absender-E-Mail
 */

const nodemailer = require('nodemailer');

// Resend optional laden
let Resend;
try {
  Resend = require('resend').Resend;
} catch (e) {
  // Resend nicht installiert - kein Problem, wir haben SMTP als Fallback
}

// Konfiguration
const EMAIL_FROM = process.env.EMAIL_FROM || 'Monemee <noreply@monemee.app>';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Transport-Provider
let emailProvider = null;
let providerName = 'none';

/**
 * Initialisiert den E-Mail-Provider
 */
const initializeProvider = () => {
  // Option 1: Resend
  if (Resend && process.env.RESEND_API_KEY) {
    emailProvider = new Resend(process.env.RESEND_API_KEY);
    providerName = 'resend';
    console.log('[Email Service] Resend initialisiert');
    return;
  }

  // Option 2: SMTP via Nodemailer
  if (process.env.SMTP_HOST) {
    emailProvider = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    providerName = 'smtp';
    console.log(`[Email Service] SMTP initialisiert (${process.env.SMTP_HOST})`);
    return;
  }

  console.warn('[Email Service] Kein E-Mail-Provider konfiguriert');
  console.warn('[Email Service] Setze RESEND_API_KEY oder SMTP_HOST in .env');
};

// Provider beim Start initialisieren
initializeProvider();

/**
 * Prüft ob E-Mail-Versand verfügbar ist
 */
const isConfigured = () => {
  return emailProvider !== null;
};

/**
 * Gibt den aktiven Provider zurück
 */
const getProvider = () => providerName;

/**
 * Sendet eine E-Mail
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!isConfigured()) {
    console.log(`[Email Service] Nicht konfiguriert - würde senden an: ${to}`);
    return { success: false, reason: 'not_configured' };
  }

  try {
    if (providerName === 'resend') {
      const result = await emailProvider.emails.send({
        from: EMAIL_FROM,
        to,
        subject,
        html
      });
      return { success: true, id: result.data?.id, provider: 'resend' };
    }

    if (providerName === 'smtp') {
      const result = await emailProvider.sendMail({
        from: EMAIL_FROM,
        to,
        subject,
        html
      });
      return { success: true, id: result.messageId, provider: 'smtp' };
    }

    return { success: false, reason: 'unknown_provider' };

  } catch (error) {
    console.error('[Email Service] Fehler beim Senden:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Formatiert einen Preis in Euro
 */
const formatPrice = (price) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

/**
 * Formatiert ein Datum
 */
const formatDate = (date) => {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

/**
 * Generiert HTML für die Kaufbestätigungs-E-Mail
 */
const generatePurchaseConfirmationHtml = ({
  productTitle,
  productThumbnail,
  sellerName,
  amount,
  downloadLinks,
  purchasesUrl,
  invoiceUrl
}) => {
  const downloadLinksHtml = downloadLinks.length > 0
    ? `
      <div style="margin: 24px 0; padding: 20px; background: #f8fafc; border-radius: 12px;">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1e293b;">Deine Downloads</h3>
        ${downloadLinks.map(link => `
          <a href="${link.url}" style="display: block; padding: 12px 16px; margin-bottom: 8px; background: #1e3a8a; color: white; text-decoration: none; border-radius: 8px; text-align: center; font-weight: 500;">
            📥 ${link.title || 'Datei herunterladen'}
          </a>
          <p style="margin: 0 0 16px 0; font-size: 12px; color: #64748b; text-align: center;">
            Gültig bis ${formatDate(link.expiresAt)} (max. 3 Downloads)
          </p>
        `).join('')}
      </div>
    `
    : '';

  const invoiceSection = invoiceUrl
    ? `
      <p style="margin: 16px 0;">
        <a href="${invoiceUrl}" style="color: #1e3a8a; text-decoration: underline;">
          Rechnung ansehen
        </a>
      </p>
    `
    : '';

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kaufbestätigung</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; padding: 12px 20px; background: linear-gradient(135deg, #1e3a8a, #6366f1); border-radius: 12px;">
        <span style="color: white; font-size: 24px; font-weight: bold;">Monemee</span>
      </div>
    </div>

    <!-- Main Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <!-- Success Icon -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 64px; height: 64px; background: #dcfce7; border-radius: 50%; line-height: 64px; font-size: 32px;">
          ✓
        </div>
      </div>

      <h1 style="margin: 0 0 8px 0; font-size: 24px; text-align: center; color: #1e293b;">
        Kauf erfolgreich!
      </h1>
      <p style="margin: 0 0 32px 0; text-align: center; color: #64748b;">
        Vielen Dank für deinen Einkauf.
      </p>

      <!-- Product Info -->
      <div style="display: flex; gap: 16px; padding: 16px; background: #f8fafc; border-radius: 12px; margin-bottom: 24px;">
        ${productThumbnail ? `
          <img src="${productThumbnail}" alt="${productTitle}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
        ` : `
          <div style="width: 80px; height: 80px; background: #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 32px;">
            📦
          </div>
        `}
        <div style="flex: 1;">
          <h2 style="margin: 0 0 4px 0; font-size: 16px; color: #1e293b;">${productTitle}</h2>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;">von ${sellerName}</p>
          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1e3a8a;">${formatPrice(amount)}</p>
        </div>
      </div>

      <!-- Download Links -->
      ${downloadLinksHtml}

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${purchasesUrl}" style="display: inline-block; padding: 14px 32px; background: #1e3a8a; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Zu meinen Käufen
        </a>
      </div>

      <!-- Info -->
      <div style="padding: 16px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #1e3a8a;">
        <p style="margin: 0; font-size: 14px; color: #1e40af;">
          <strong>Tipp:</strong> Erstelle einen kostenlosen Account, um jederzeit auf deine Käufe zuzugreifen.
        </p>
      </div>

      ${invoiceSection}
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; color: #64748b; font-size: 12px;">
      <p style="margin: 0 0 8px 0;">
        Diese E-Mail wurde von Monemee gesendet.
      </p>
      <p style="margin: 0;">
        <a href="${CLIENT_URL}/impressum" style="color: #64748b;">Impressum</a> •
        <a href="${CLIENT_URL}/datenschutz" style="color: #64748b;">Datenschutz</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Sendet eine Kaufbestätigungs-E-Mail
 *
 * @param {Object} params - E-Mail-Parameter
 * @param {string} params.buyerEmail - E-Mail des Käufers
 * @param {string} params.productTitle - Produktname
 * @param {string} params.productThumbnail - Produkt-Thumbnail URL
 * @param {string} params.sellerName - Verkäufername
 * @param {number} params.amount - Kaufbetrag
 * @param {Array} params.downloadLinks - Array von {url, title, expiresAt}
 * @param {string} params.invoiceUrl - URL zur Rechnung (optional)
 */
const sendPurchaseConfirmation = async ({
  buyerEmail,
  productTitle,
  productThumbnail,
  sellerName,
  amount,
  downloadLinks = [],
  invoiceUrl = null
}) => {
  const purchasesUrl = `${CLIENT_URL}/dashboard/purchases`;

  const html = generatePurchaseConfirmationHtml({
    productTitle,
    productThumbnail,
    sellerName,
    amount,
    downloadLinks,
    purchasesUrl,
    invoiceUrl
  });

  const result = await sendEmail({
    to: buyerEmail,
    subject: `Kaufbestätigung: ${productTitle}`,
    html
  });

  if (result.success) {
    console.log(`[Email Service] Kaufbestätigung gesendet an ${buyerEmail} via ${result.provider}`);
  }

  return result;
};

/**
 * Sendet eine Test-E-Mail (für Entwicklung)
 */
const sendTestEmail = async (toEmail) => {
  return sendEmail({
    to: toEmail,
    subject: 'Monemee Test-E-Mail',
    html: '<h1>Test erfolgreich!</h1><p>Der E-Mail-Service funktioniert.</p>'
  });
};

module.exports = {
  isConfigured,
  getProvider,
  sendEmail,
  sendPurchaseConfirmation,
  sendTestEmail
};
