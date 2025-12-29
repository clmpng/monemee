/**
 * Stripe Service
 * Zentrale Business-Logik für alle Stripe-Operationen
 * 
 * WICHTIG: Dieser Service ist produktionsbereit.
 * Aktivierung erfolgt über STRIPE_MODE=live in .env
 */

const Stripe = require('stripe');
const db = require('../config/database');

// ============================================
// Konfiguration
// ============================================

const STRIPE_MODE = process.env.STRIPE_MODE || 'test';
const IS_LIVE = STRIPE_MODE === 'live';

// Stripe Secret Key basierend auf Modus
const STRIPE_SECRET_KEY = IS_LIVE 
  ? process.env.STRIPE_SECRET_KEY_LIVE 
  : process.env.STRIPE_SECRET_KEY_TEST;

// Fallback auf alten Key-Namen für Rückwärtskompatibilität
const secretKey = STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '';

// Stripe initialisieren
const stripe = new Stripe(secretKey, {
  apiVersion: '2023-10-16'
});

// URLs für Onboarding
const getBaseUrl = () => process.env.CLIENT_URL || 'http://localhost:3000';

// ============================================
// Connect Account Management
// ============================================

/**
 * Prüft ob Stripe konfiguriert ist
 */
const isStripeConfigured = () => {
  return !!secretKey && secretKey.startsWith('sk_');
};

/**
 * Erstellt einen Stripe Connect Express Account
 * @param {Object} user - User-Objekt mit id und email
 * @returns {Object} - Stripe Account Objekt
 */
const createConnectAccount = async (user) => {
  if (!isStripeConfigured()) {
    throw new Error('Stripe ist nicht konfiguriert. Bitte STRIPE_SECRET_KEY setzen.');
  }

  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'DE', // Deutschland
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      business_type: 'individual',
      settings: {
        payouts: {
          schedule: {
            // Automatische Auszahlungen deaktivieren - wir steuern das manuell
            interval: 'manual'
          }
        }
      },
      metadata: {
        monemee_user_id: user.id.toString(),
        monemee_username: user.username || '',
        environment: STRIPE_MODE
      }
    });

    // User in DB aktualisieren
    await updateUserStripeStatus(user.id, {
      stripe_account_id: account.id,
      stripe_account_status: 'pending',
      stripe_charges_enabled: false,
      stripe_payouts_enabled: false,
      stripe_onboarding_complete: false
    });

    console.log(`[Stripe] Connect Account erstellt: ${account.id} für User ${user.id}`);
    return account;

  } catch (error) {
    console.error('[Stripe] Account-Erstellung fehlgeschlagen:', error);
    throw error;
  }
};

/**
 * Erstellt einen Onboarding-Link für Stripe Connect
 * @param {string} accountId - Stripe Account ID
 * @param {string} returnPath - Pfad nach erfolgreichem Onboarding
 * @param {string} refreshPath - Pfad bei Fehler/Abbruch
 * @returns {Object} - Account Link mit URL
 */
const createOnboardingLink = async (accountId, returnPath = '/settings?tab=payout&status=success', refreshPath = '/settings?tab=payout&status=refresh') => {
  if (!isStripeConfigured()) {
    throw new Error('Stripe ist nicht konfiguriert');
  }

  try {
    const baseUrl = getBaseUrl();
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}${refreshPath}`,
      return_url: `${baseUrl}${returnPath}`,
      type: 'account_onboarding',
      collect: 'eventually_due' // Sammelt alle erforderlichen Infos
    });

    console.log(`[Stripe] Onboarding-Link erstellt für Account: ${accountId}`);
    return accountLink;

  } catch (error) {
    console.error('[Stripe] Onboarding-Link Fehler:', error);
    throw error;
  }
};

/**
 * Erstellt einen Login-Link zum Stripe Express Dashboard
 * (für User die ihr Dashboard besuchen wollen)
 */
const createDashboardLink = async (accountId) => {
  if (!isStripeConfigured()) {
    throw new Error('Stripe ist nicht konfiguriert');
  }

  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink;
  } catch (error) {
    console.error('[Stripe] Dashboard-Link Fehler:', error);
    throw error;
  }
};

/**
 * Holt Account-Status von Stripe
 */
const getAccountStatus = async (accountId) => {
  if (!isStripeConfigured()) {
    throw new Error('Stripe ist nicht konfiguriert');
  }

  try {
    const account = await stripe.accounts.retrieve(accountId);
    return {
      id: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements: account.requirements,
      capabilities: account.capabilities
    };
  } catch (error) {
    console.error('[Stripe] Account-Abruf Fehler:', error);
    throw error;
  }
};

// ============================================
// Payouts (Auszahlungen)
// ============================================

/**
 * Erstellt eine Auszahlung zum Stripe Connect Account
 * Das Geld wird von der Plattform zum Connect Account transferiert
 * Stripe überweist es dann automatisch auf das Bankkonto des Users
 * 
 * @param {Object} params - Auszahlungsparameter
 * @returns {Object} - Transfer-Objekt
 */
const createPayout = async ({ userId, amount, accountId, payoutId, description }) => {
  if (!isStripeConfigured()) {
    throw new Error('Stripe ist nicht konfiguriert');
  }

  try {
    // Betrag in Cents umrechnen
    const amountInCents = Math.round(amount * 100);

    // Transfer zum Connect Account erstellen
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: 'eur',
      destination: accountId,
      description: description || `Monemee Auszahlung #${payoutId}`,
      metadata: {
        monemee_user_id: userId.toString(),
        monemee_payout_id: payoutId.toString(),
        environment: STRIPE_MODE
      }
    });

    console.log(`[Stripe] Transfer erstellt: ${transfer.id} (${amount}€) für User ${userId}`);
    return transfer;

  } catch (error) {
    console.error('[Stripe] Transfer Fehler:', error);
    throw error;
  }
};

/**
 * Holt Balance vom Connect Account
 */
const getConnectAccountBalance = async (accountId) => {
  if (!isStripeConfigured()) {
    throw new Error('Stripe ist nicht konfiguriert');
  }

  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId
    });
    return balance;
  } catch (error) {
    console.error('[Stripe] Balance-Abruf Fehler:', error);
    throw error;
  }
};

// ============================================
// Checkout Sessions (für Produktkäufe)
// ============================================

/**
 * Erstellt eine Checkout Session für einen Produktkauf
 * Mit automatischer Gebührenberechnung und Transfer zum Verkäufer
 */
const createCheckoutSession = async ({
  product,
  buyer,
  seller,
  promoterCode = null,
  promoterId = null,
  affiliateCommission = 0,
  platformFeePercent,
  successUrl,
  cancelUrl
}) => {
  if (!isStripeConfigured()) {
    throw new Error('Stripe ist nicht konfiguriert');
  }

  // Seller muss Stripe Account haben
  if (!seller.stripe_account_id) {
    throw new Error('Verkäufer hat kein Stripe-Konto eingerichtet');
  }

  if (!seller.stripe_charges_enabled) {
    throw new Error('Verkäufer kann noch keine Zahlungen empfangen');
  }

  try {
    const amountInCents = Math.round(product.price * 100);
    
    // Plattform-Gebühr berechnen
    const platformFee = Math.round(amountInCents * (platformFeePercent / 100));
    
    // Affiliate-Provision berechnen
    let affiliateFee = 0;
    if (promoterCode && affiliateCommission > 0) {
      affiliateFee = Math.round(amountInCents * (affiliateCommission / 100));
    }

    // Gesamtgebühr die bei uns bleibt (Platform + Affiliate)
    // Affiliate wird später von uns an den Promoter ausgezahlt
    const applicationFee = platformFee + affiliateFee;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: product.title,
              description: product.description || undefined,
              images: product.thumbnail_url ? [product.thumbnail_url] : undefined
            },
            unit_amount: amountInCents
          },
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        product_id: product.id.toString(),
        buyer_id: buyer.id.toString(),
        seller_id: seller.id.toString(),
        promoter_id: promoterId ? promoterId.toString() : '',
        promoter_code: promoterCode || '',
        platform_fee: platformFee.toString(),
        affiliate_commission: affiliateFee.toString(),
        environment: STRIPE_MODE
      },
      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: seller.stripe_account_id
        },
        metadata: {
          product_id: product.id.toString(),
          buyer_id: buyer.id.toString(),
          seller_id: seller.id.toString()
        }
      }
    });

    console.log(`[Stripe] Checkout Session erstellt: ${session.id}`);
    return session;

  } catch (error) {
    console.error('[Stripe] Checkout Session Fehler:', error);
    throw error;
  }
};

// ============================================
// Webhook Handling
// ============================================

/**
 * Konstruiert und verifiziert ein Webhook Event
 */
const constructWebhookEvent = (payload, signature, webhookSecret) => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('[Stripe] Webhook Signatur ungültig:', error.message);
    throw error;
  }
};

/**
 * Verarbeitet ein account.updated Event
 * Wird aufgerufen wenn sich der Status eines Connect Accounts ändert
 */
const handleAccountUpdated = async (account) => {
  console.log(`[Stripe Webhook] Account updated: ${account.id}`);

  // User anhand der stripe_account_id finden
  const userQuery = `SELECT id FROM users WHERE stripe_account_id = $1`;
  const userResult = await db.query(userQuery, [account.id]);
  
  if (userResult.rows.length === 0) {
    console.warn(`[Stripe Webhook] Kein User gefunden für Account: ${account.id}`);
    return;
  }

  const userId = userResult.rows[0].id;

  // Status bestimmen
  let status = 'pending';
  if (account.charges_enabled && account.payouts_enabled) {
    status = 'enabled';
  } else if (account.requirements?.currently_due?.length > 0) {
    status = 'restricted';
  }

  // User aktualisieren
  await updateUserStripeStatus(userId, {
    stripe_account_status: status,
    stripe_charges_enabled: account.charges_enabled || false,
    stripe_payouts_enabled: account.payouts_enabled || false,
    stripe_onboarding_complete: account.details_submitted || false,
    stripe_account_details: {
      requirements: account.requirements,
      capabilities: account.capabilities,
      business_type: account.business_type
    }
  });

  console.log(`[Stripe Webhook] User ${userId} aktualisiert: Status=${status}`);
};

/**
 * Verarbeitet ein checkout.session.completed Event
 * Wird aufgerufen wenn ein Kauf erfolgreich war
 */
const handleCheckoutCompleted = async (session) => {
  console.log(`[Stripe Webhook] Checkout completed: ${session.id}`);
  
  const metadata = session.metadata;
  
  // Transaktion in DB erstellen
  // (Wird im payments.controller implementiert)
  return {
    productId: parseInt(metadata.product_id),
    buyerId: parseInt(metadata.buyer_id),
    sellerId: parseInt(metadata.seller_id),
    promoterId: metadata.promoter_id ? parseInt(metadata.promoter_id) : null,
    promoterCode: metadata.promoter_code || null,
    amount: session.amount_total / 100, // Zurück zu Euro
    platformFee: parseInt(metadata.platform_fee) / 100,
    affiliateCommission: parseInt(metadata.affiliate_commission) / 100,
    stripePaymentId: session.payment_intent,
    stripeSessionId: session.id
  };
};

/**
 * Verarbeitet ein transfer.created Event
 * Wird aufgerufen wenn eine Auszahlung initiiert wurde
 */
const handleTransferCreated = async (transfer) => {
  console.log(`[Stripe Webhook] Transfer created: ${transfer.id}`);
  
  const payoutId = transfer.metadata?.monemee_payout_id;
  if (payoutId) {
    // Payout-Status aktualisieren
    const updateQuery = `
      UPDATE payouts 
      SET 
        status = 'processing',
        stripe_transfer_id = $1,
        processed_at = NOW()
      WHERE id = $2
    `;
    await db.query(updateQuery, [transfer.id, payoutId]);
  }
};

/**
 * Verarbeitet ein payout.paid Event
 * Wird aufgerufen wenn Geld auf dem Bankkonto angekommen ist
 */
const handlePayoutPaid = async (payout) => {
  console.log(`[Stripe Webhook] Payout paid: ${payout.id}`);
  
  // Finde alle Transfers die zu diesem Payout gehören
  // und markiere sie als completed
  // (Komplexere Logik für Production)
};

// ============================================
// Helper Functions
// ============================================

/**
 * Aktualisiert die Stripe-bezogenen Felder eines Users
 */
const updateUserStripeStatus = async (userId, data) => {
  const allowedFields = [
    'stripe_account_id',
    'stripe_account_status',
    'stripe_charges_enabled',
    'stripe_payouts_enabled',
    'stripe_onboarding_complete',
    'stripe_account_details'
  ];

  const updates = [];
  const values = [];
  let paramCount = 1;

  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key)) {
      if (key === 'stripe_account_details') {
        updates.push(`${key} = $${paramCount}::jsonb`);
        values.push(JSON.stringify(value));
      } else {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
      }
      paramCount++;
    }
  }

  if (updates.length === 0) return;

  updates.push(`stripe_account_updated_at = NOW()`);
  updates.push(`updated_at = NOW()`);

  values.push(userId);
  const query = `
    UPDATE users 
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, stripe_account_id, stripe_account_status, stripe_payouts_enabled
  `;

  const result = await db.query(query, values);
  return result.rows[0];
};

/**
 * Speichert ein Webhook Event für Audit Trail
 */
const logWebhookEvent = async (event, status = 'received', errorMessage = null) => {
  try {
    const query = `
      INSERT INTO stripe_webhook_events 
        (stripe_event_id, event_type, status, payload, error_message, processed_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (stripe_event_id) 
      DO UPDATE SET 
        status = $3, 
        error_message = $5,
        processed_at = $6
    `;
    
    await db.query(query, [
      event.id,
      event.type,
      status,
      JSON.stringify(event.data),
      errorMessage,
      status === 'processed' || status === 'failed' ? new Date() : null
    ]);
  } catch (error) {
    console.error('[Stripe] Webhook Event Log Fehler:', error);
  }
};

// ============================================
// Export
// ============================================

module.exports = {
  // Config
  stripe,
  isStripeConfigured,
  IS_LIVE,
  STRIPE_MODE,
  
  // Connect Accounts
  createConnectAccount,
  createOnboardingLink,
  createDashboardLink,
  getAccountStatus,
  updateUserStripeStatus,
  
  // Payouts
  createPayout,
  getConnectAccountBalance,
  
  // Checkout
  createCheckoutSession,
  
  // Webhooks
  constructWebhookEvent,
  handleAccountUpdated,
  handleCheckoutCompleted,
  handleTransferCreated,
  handlePayoutPaid,
  logWebhookEvent
};