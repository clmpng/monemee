/**
 * Seller Billing Controller
 * Verwaltet Seller-Type und Rechnungsdaten
 */

const UserModel = require('../models/User.model');
const SellerBillingModel = require('../models/SellerBilling.model');
const db = require('../config/database');

const sellerBillingController = {
  /**
   * Get seller type and billing info
   * GET /api/v1/users/billing
   */
  async getBillingInfo(req, res, next) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Benutzer nicht gefunden'
        });
      }

      const billingInfo = await SellerBillingModel.findByUserId(userId);
      const isComplete = SellerBillingModel.isComplete(billingInfo);

      res.json({
        success: true,
        data: {
          sellerType: user.seller_type || 'private',
          billingInfo: billingInfo ? {
            businessName: billingInfo.business_name,
            street: billingInfo.street,
            zip: billingInfo.zip,
            city: billingInfo.city,
            country: billingInfo.country,
            isSmallBusiness: billingInfo.is_small_business,
            taxId: billingInfo.tax_id
          } : null,
          isComplete
        }
      });

    } catch (error) {
      console.error('Get billing info error:', error);
      next(error);
    }
  },

  /**
   * Set seller type (private/business)
   * PUT /api/v1/users/seller-type
   */
  async setSellerType(req, res, next) {
    try {
      const userId = req.userId;
      const { sellerType } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      if (!['private', 'business'].includes(sellerType)) {
        return res.status(400).json({
          success: false,
          message: 'Ungültiger Seller-Type. Erlaubt: private, business'
        });
      }

      // User aktualisieren
      const query = `
        UPDATE users 
        SET seller_type = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, seller_type
      `;
      
      const result = await db.query(query, [sellerType, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Benutzer nicht gefunden'
        });
      }

      // Bei Wechsel zu 'private': Billing-Daten löschen (optional behalten)
      // Wir behalten sie, falls User zurückwechselt

      res.json({
        success: true,
        data: {
          sellerType: result.rows[0].seller_type,
          needsBillingInfo: sellerType === 'business'
        }
      });

    } catch (error) {
      console.error('Set seller type error:', error);
      next(error);
    }
  },

  /**
   * Update billing info (für gewerbliche Verkäufer)
   * PUT /api/v1/users/billing
   */
  async updateBillingInfo(req, res, next) {
    try {
      const userId = req.userId;
      const { 
        businessName, 
        street, 
        zip, 
        city, 
        country = 'DE',
        isSmallBusiness = false,
        taxId 
      } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      // User prüfen
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Benutzer nicht gefunden'
        });
      }

      // Validierung: Pflichtfelder
      if (!businessName?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Geschäftsname ist erforderlich'
        });
      }

      if (!street?.trim() || !zip?.trim() || !city?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Vollständige Adresse ist erforderlich'
        });
      }

      // Validierung: Steuernummer bei Nicht-Kleinunternehmer
      if (!isSmallBusiness && !taxId?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'USt-IdNr. oder Steuernummer ist erforderlich (außer bei Kleinunternehmern)'
        });
      }

      // Billing-Daten speichern (upsert)
      const billingInfo = await SellerBillingModel.upsert(userId, {
        business_name: businessName.trim(),
        street: street.trim(),
        zip: zip.trim(),
        city: city.trim(),
        country: country,
        is_small_business: isSmallBusiness,
        tax_id: taxId?.trim() || null
      });

      // Auch seller_type auf 'business' setzen (falls noch nicht)
      if (user.seller_type !== 'business') {
        await db.query(
          'UPDATE users SET seller_type = $1, updated_at = NOW() WHERE id = $2',
          ['business', userId]
        );
      }

      const isComplete = SellerBillingModel.isComplete(billingInfo);

      res.json({
        success: true,
        data: {
          billingInfo: {
            businessName: billingInfo.business_name,
            street: billingInfo.street,
            zip: billingInfo.zip,
            city: billingInfo.city,
            country: billingInfo.country,
            isSmallBusiness: billingInfo.is_small_business,
            taxId: billingInfo.tax_id
          },
          isComplete
        }
      });

    } catch (error) {
      console.error('Update billing info error:', error);
      next(error);
    }
  },

  /**
   * Check if user can sell (Stripe + Billing complete if business)
   * GET /api/v1/users/can-sell
   */
  async checkCanSell(req, res, next) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Benutzer nicht gefunden'
        });
      }

      const reasons = [];

      // Stripe Check
      const hasStripe = user.stripe_account_id && user.stripe_charges_enabled;
      if (!hasStripe) {
        reasons.push('stripe_incomplete');
      }

      // Billing Check (nur für Business)
      let billingComplete = true;
      if (user.seller_type === 'business') {
        const billingInfo = await SellerBillingModel.findByUserId(userId);
        billingComplete = SellerBillingModel.isComplete(billingInfo);
        if (!billingComplete) {
          reasons.push('billing_incomplete');
        }
      }

      const canSell = hasStripe && billingComplete;

      res.json({
        success: true,
        data: {
          canSell,
          sellerType: user.seller_type,
          checks: {
            stripeComplete: hasStripe,
            billingComplete,
            sellerTypeSet: user.seller_type !== null
          },
          reasons: canSell ? [] : reasons
        }
      });

    } catch (error) {
      console.error('Check can sell error:', error);
      next(error);
    }
  }
};

module.exports = sellerBillingController;
