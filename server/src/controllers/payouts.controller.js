const PayoutModel = require('../models/Payout.model');
const UserModel = require('../models/User.model');
const stripeService = require('../services/stripe.service');
const { PAYOUT_CONFIG, calculatePayoutFee, calculateNetPayout, canRequestPayout } = require('../config/payout.config');
const { getAllLevels } = require('../config/levels.config');

/**
 * Payouts Controller
 * 
 * WICHTIG: Dieser Controller handhabt NUR Affiliate-Auszahlungen!
 * 
 * Produkt-Einnahmen werden automatisch via Stripe Destination Charges
 * direkt an den Seller ausgezahlt - kein manueller Payout nötig.
 * 
 * Affiliate-Provisionen hingegen sammeln sich auf der Plattform und
 * können nach einer 7-Tage Clearing-Phase manuell ausgezahlt werden.
 */
const payoutsController = {
  /**
   * Get affiliate balance info
   * GET /api/v1/payouts/affiliate-balance
   * 
   * Zeigt NUR Affiliate-Provisionen, nicht Produkt-Einnahmen!
   */
  async getAffiliateBalance(req, res, next) {
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
          message: 'User nicht gefunden'
        });
      }
      
      const payoutStats = await PayoutModel.getStats(userId);
      
      // Berechne verfügbare und pending Affiliate-Balance
      // Nach Migration: affiliate_balance und affiliate_pending_balance
      // Fallback für alte Struktur: available_balance und pending_balance
      const availableBalance = parseFloat(user.affiliate_balance ?? user.available_balance ?? 0);
      const pendingBalance = parseFloat(user.affiliate_pending_balance ?? user.pending_balance ?? 0);
      const totalEarnings = parseFloat(user.affiliate_earnings_total ?? 0);
      
      res.json({
        success: true,
        data: {
          // Affiliate-spezifische Balances
          availableBalance: availableBalance,
          pendingBalance: pendingBalance,
          totalEarnings: totalEarnings,
          
          // Payout Stats
          totalPaidOut: payoutStats.totalPaid,
          pendingPayouts: payoutStats.pendingCount,
          pendingPayoutAmount: payoutStats.pendingAmount,
          
          // Stripe Connect Status
          stripeConnected: !!user.stripe_account_id,
          stripePayoutsEnabled: user.stripe_payouts_enabled || false,
          stripeOnboardingComplete: user.stripe_onboarding_complete || false,
          
          // Kann User Auszahlungen anfordern?
          canRequestPayout: !!(
            user.stripe_account_id &&
            user.stripe_payouts_enabled &&
            user.stripe_onboarding_complete &&
            availableBalance >= PAYOUT_CONFIG.absoluteMinPayout
          ),
          
          // Clearing Info
          clearingDays: 7,
          
          // Payout-Regeln für Frontend
          config: {
            minFreePayoutAmount: PAYOUT_CONFIG.minFreePayoutAmount,
            smallPayoutFee: PAYOUT_CONFIG.smallPayoutFee,
            absoluteMinPayout: PAYOUT_CONFIG.absoluteMinPayout,
            processingDays: PAYOUT_CONFIG.processingDays
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Request a payout (nur für Affiliate-Provisionen!)
   * POST /api/v1/payouts/request
   */
  async requestPayout(req, res, next) {
    try {
      const userId = req.userId;
      const { amount } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }
      
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Ungültiger Betrag'
        });
      }
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User nicht gefunden'
        });
      }

      // ============================================
      // Stripe Connect Prüfung
      // ============================================
      
      if (!user.stripe_account_id) {
        return res.status(400).json({
          success: false,
          message: 'Bitte richte zuerst dein Auszahlungskonto in den Einstellungen ein.',
          code: 'NO_STRIPE_ACCOUNT'
        });
      }

      if (!user.stripe_onboarding_complete) {
        return res.status(400).json({
          success: false,
          message: 'Bitte schließe die Kontoeinrichtung bei Stripe ab.',
          code: 'ONBOARDING_INCOMPLETE'
        });
      }

      if (!user.stripe_payouts_enabled) {
        return res.status(400).json({
          success: false,
          message: 'Auszahlungen sind für dein Konto noch nicht freigeschaltet.',
          code: 'PAYOUTS_NOT_ENABLED'
        });
      }
      
      // Affiliate Balance prüfen (nach Migration: affiliate_balance)
      const availableBalance = parseFloat(user.affiliate_balance ?? user.available_balance ?? 0);
      
      // Validierung
      const validation = canRequestPayout(availableBalance, amount);
      if (!validation.allowed) {
        return res.status(400).json({
          success: false,
          message: validation.reason
        });
      }
      
      // Gebühr berechnen
      const fee = calculatePayoutFee(amount);
      const netAmount = calculateNetPayout(amount);
      
      // ============================================
      // Payout erstellen
      // ============================================
      
      const payout = await PayoutModel.create({
        user_id: userId,
        amount: amount,
        fee: fee,
        net_amount: netAmount,
        status: 'pending',
        source_type: 'affiliate',
        stripe_destination: user.stripe_account_id
      });
      
      // Affiliate Balance reduzieren
      await UserModel.updateAffiliateBalance(userId, -amount);
      
      // ============================================
      // Stripe Transfer erstellen
      // ============================================
      
      if (stripeService.isStripeConfigured()) {
        try {
          const transfer = await stripeService.createPayout({
            userId: userId,
            amount: netAmount,
            accountId: user.stripe_account_id,
            payoutId: payout.id,
            description: `Monemee Affiliate-Provision #${payout.reference_number}`
          });
          
          // Payout mit Stripe-Daten aktualisieren
          await PayoutModel.updateStatus(payout.id, 'processing', {
            stripe_transfer_id: transfer.id
          });
          
          console.log(`[Payout] Affiliate Transfer erstellt: ${transfer.id} (${netAmount}€) für User ${userId}`);
          
        } catch (stripeError) {
          // Bei Stripe-Fehler: Payout als failed markieren und Balance zurückgeben
          console.error('[Payout] Stripe Transfer fehlgeschlagen:', stripeError);
          
          await PayoutModel.updateStatus(payout.id, 'failed', {
            failure_reason: stripeError.message
          });
          
          // Balance zurückgeben
          await UserModel.updateAffiliateBalance(userId, amount);
          
          return res.status(500).json({
            success: false,
            message: 'Auszahlung konnte nicht verarbeitet werden. Bitte versuche es später erneut.',
            code: 'STRIPE_ERROR'
          });
        }
      } else {
        console.warn('[Payout] Stripe nicht konfiguriert - Payout wartet auf manuelle Verarbeitung');
      }
      
      // Aktuellen Payout-Status holen
      const updatedPayout = await PayoutModel.findById(payout.id);
      
      res.json({
        success: true,
        data: {
          id: updatedPayout.id,
          referenceNumber: updatedPayout.reference_number,
          amount: parseFloat(updatedPayout.amount),
          fee: parseFloat(updatedPayout.fee),
          netAmount: parseFloat(updatedPayout.net_amount),
          status: updatedPayout.status,
          createdAt: updatedPayout.created_at,
          estimatedArrival: new Date(Date.now() + PAYOUT_CONFIG.processingDays * 24 * 60 * 60 * 1000)
        },
        message: fee > 0 
          ? `Auszahlung beantragt! Gebühr: ${fee.toFixed(2)}€` 
          : 'Auszahlung beantragt!'
      });
      
    } catch (error) {
      console.error('Payout request error:', error);
      next(error);
    }
  },

  /**
   * Get payout history
   * GET /api/v1/payouts/history
   */
  async getHistory(req, res, next) {
    try {
      const userId = req.userId;
      const { limit = 50, offset = 0, status } = req.query;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }
      
      const payouts = await PayoutModel.findByUserId(userId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        status: status || null
      });
      
      res.json({
        success: true,
        data: payouts.map(p => ({
          id: p.id,
          referenceNumber: p.reference_number,
          amount: parseFloat(p.amount),
          fee: parseFloat(p.fee),
          netAmount: parseFloat(p.net_amount),
          status: p.status,
          sourceType: p.source_type || 'affiliate',
          createdAt: p.created_at,
          processedAt: p.processed_at,
          completedAt: p.completed_at,
          failureReason: p.failure_reason
        }))
      });
      
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cancel a pending payout
   * POST /api/v1/payouts/:id/cancel
   */
  async cancelPayout(req, res, next) {
    try {
      const userId = req.userId;
      const payoutId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }
      
      const payout = await PayoutModel.findById(payoutId);
      
      if (!payout) {
        return res.status(404).json({
          success: false,
          message: 'Auszahlung nicht gefunden'
        });
      }
      
      if (payout.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Keine Berechtigung'
        });
      }
      
      // Nur pending Payouts können storniert werden
      if (payout.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Auszahlung kann nicht storniert werden (Status: ${payout.status})`
        });
      }
      
      // Payout stornieren
      await PayoutModel.updateStatus(payoutId, 'cancelled');
      
      // Affiliate Balance zurückgeben
      await UserModel.updateAffiliateBalance(userId, parseFloat(payout.amount));
      
      res.json({
        success: true,
        message: 'Auszahlung storniert'
      });
      
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get platform configuration
   * GET /api/v1/payouts/config
   */
  async getConfig(req, res, next) {
    try {
      const levels = getAllLevels();
      
      res.json({
        success: true,
        data: {
          levels: levels.map(l => ({
            level: l.level,
            name: l.name,
            minEarnings: l.minEarnings,
            platformFee: l.fee,
            color: l.color
          })),
          payout: {
            minFreePayoutAmount: PAYOUT_CONFIG.minFreePayoutAmount,
            smallPayoutFee: PAYOUT_CONFIG.smallPayoutFee,
            absoluteMinPayout: PAYOUT_CONFIG.absoluteMinPayout,
            processingDays: PAYOUT_CONFIG.processingDays,
            clearingDays: 7
          },
          stripeConfigured: stripeService.isStripeConfigured(),
          stripeMode: stripeService.STRIPE_MODE
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
};

module.exports = payoutsController;
