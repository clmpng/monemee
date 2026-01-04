const db = require('../config/database');
const ProductModel = require('../models/Product.model');
const UserModel = require('../models/User.model');
const TransactionModel = require('../models/Transaction.model');

/**
 * Webhook Validation Service
 * Umfassende Validierung für Stripe Webhook Events
 */
const WebhookValidationService = {
  /**
   * Validiert eine Checkout Session komplett
   * @param {Object} session - Stripe Checkout Session
   * @returns {Object} { isValid, data, errors, warnings }
   */
  async validateCheckoutSession(session) {
    const errors = [];
    const warnings = [];
    const validatedData = {};

    console.log(`[Webhook Validation] Validiere Session: ${session.id}`);

    try {
      // 1. Metadata extrahieren und parsen
      const metadata = session.metadata || {};
      
      const productId = this.parseId(metadata.product_id);
      const buyerId = this.parseId(metadata.buyer_id);
      const sellerId = this.parseId(metadata.seller_id);
      const promoterId = this.parseId(metadata.promoter_id);

      // 2. Pflicht-IDs validieren
      if (!productId) {
        errors.push({ field: 'product_id', message: 'Produkt-ID fehlt oder ungültig' });
      }
      if (!buyerId) {
        errors.push({ field: 'buyer_id', message: 'Käufer-ID fehlt oder ungültig' });
      }
      if (!sellerId) {
        errors.push({ field: 'seller_id', message: 'Verkäufer-ID fehlt oder ungültig' });
      }

      // Bei fehlenden Pflicht-IDs: Abbruch
      if (errors.length > 0) {
        await this.logValidation(session.id, session.id, false, errors, warnings, metadata, {});
        return { isValid: false, data: null, errors, warnings };
      }

      // 3. Idempotenz-Check
      const existingTransaction = await TransactionModel.findByStripeSessionId(session.id);
      if (existingTransaction) {
        await AdminAlertService.webhookAlert('duplicate_processing_attempt', {
          sessionId: session.id,
          existingTransactionId: existingTransaction.id
        });
        return { 
          isValid: false, 
          data: null, 
          errors: [{ field: 'session_id', message: 'Session bereits verarbeitet' }],
          warnings,
          isDuplicate: true,
          existingTransaction
        };
      }

      // 4. Produkt validieren
      const product = await ProductModel.findById(productId);
      if (!product) {
        errors.push({ field: 'product_id', message: `Produkt ${productId} existiert nicht` });
      } else {
        validatedData.product = product;

        // 5. Seller-Mismatch prüfen
        if (product.user_id !== sellerId) {
          errors.push({ 
            field: 'seller_id', 
            message: `Seller-Mismatch: Produkt gehört zu User ${product.user_id}, nicht ${sellerId}` 
          });
        }
      }

      // 6. Buyer validieren
      const buyer = await UserModel.findById(buyerId);
      if (!buyer) {
        errors.push({ field: 'buyer_id', message: `Käufer ${buyerId} existiert nicht` });
      } else {
        validatedData.buyer = buyer;
      }

      // 7. Seller validieren
      const seller = await UserModel.findById(sellerId);
      if (!seller) {
        errors.push({ field: 'seller_id', message: `Verkäufer ${sellerId} existiert nicht` });
      } else {
        validatedData.seller = seller;
      }

      // 8. Preis validieren (mit Toleranz)
      if (product) {
        const expectedAmount = parseFloat(product.price);
        const actualAmount = session.amount_total / 100;
        const priceDifference = Math.abs(expectedAmount - actualAmount);

        if (priceDifference > 0.01) {
          const priceWarning = {
            field: 'amount',
            message: `Preisabweichung: Erwartet ${expectedAmount}€, erhalten ${actualAmount}€`,
            expected: expectedAmount,
            actual: actualAmount,
            difference: priceDifference
          };

          // Bei sehr großer Abweichung (>10%): Fehler statt Warnung
          if (priceDifference / expectedAmount > 0.1) {
            errors.push(priceWarning);
          } else {
            warnings.push(priceWarning);
          }
        }
      }

      // 9. Promoter validieren (optional)
      let validatedPromoterId = null;
      if (promoterId) {
        const promoter = await UserModel.findById(promoterId);
        if (!promoter) {
          warnings.push({ 
            field: 'promoter_id', 
            message: `Promoter ${promoterId} existiert nicht - Affiliate-Commission wird übersprungen` 
          });
        } else {
          validatedData.promoter = promoter;
          validatedPromoterId = promoterId;
        }
      }

      // 10. Beträge berechnen und validieren
      const amount = session.amount_total / 100;
      const platformFee = this.parseAmount(metadata.platform_fee);
      const affiliateCommission = this.parseAmount(metadata.affiliate_commission);
      const sellerAmount = amount - platformFee - affiliateCommission;

      if (sellerAmount < 0) {
        errors.push({
          field: 'amounts',
          message: `Ungültige Beträge: Seller würde ${sellerAmount}€ erhalten`,
          amount,
          platformFee,
          affiliateCommission
        });
      }

      // 11. Validierte Daten zusammenstellen
      validatedData.ids = {
        productId,
        buyerId,
        sellerId,
        promoterId: validatedPromoterId
      };

      validatedData.amounts = {
        total: amount,
        platformFee,
        affiliateCommission,
        sellerAmount
      };

      validatedData.stripe = {
        sessionId: session.id,
        paymentIntentId: session.payment_intent,
        customerId: session.customer
      };

      validatedData.metadata = metadata;

      // 12. Validation Log erstellen
      const isValid = errors.length === 0;
      await this.logValidation(
        session.id,
        session.id,
        isValid,
        errors,
        warnings,
        metadata,
        validatedData
      );

      console.log(`[Webhook Validation] Session ${session.id}: ${isValid ? 'VALID' : 'INVALID'} (${errors.length} Fehler, ${warnings.length} Warnungen)`);

      return {
        isValid,
        data: isValid ? validatedData : null,
        errors,
        warnings
      };

    } catch (error) {
      console.error('[Webhook Validation] Unerwarteter Fehler:', error);

      return {
        isValid: false,
        data: null,
        errors: [{ field: 'system', message: `Validierungsfehler: ${error.message}` }],
        warnings
      };
    }
  },

  /**
   * Hilfsfunktion: ID parsen und validieren
   */
  parseId(value) {
    if (!value) return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) || parsed <= 0 ? null : parsed;
  },

  /**
   * Hilfsfunktion: Betrag parsen (Cents zu Euro)
   */
  parseAmount(value) {
    if (!value) return 0;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed / 100;
  },

  /**
   * Validation Log in DB speichern
   */
  async logValidation(sessionId, eventId, passed, errors, warnings, metadata, validatedData) {
    try {
      const query = `
        INSERT INTO webhook_validation_logs 
          (stripe_session_id, stripe_event_id, validation_passed, 
           validation_errors, validation_warnings, metadata_received, validated_data)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      await db.query(query, [
        sessionId,
        eventId,
        passed,
        JSON.stringify(errors),
        JSON.stringify(warnings),
        JSON.stringify(metadata),
        JSON.stringify(validatedData)
      ]);
    } catch (error) {
      console.error('[Webhook Validation] Log-Fehler:', error);
    }
  }
};

module.exports = WebhookValidationService;
