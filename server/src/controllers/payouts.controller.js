const PayoutModel = require('../models/Payout.model');
const UserModel = require('../models/User.model');
const { PAYOUT_CONFIG, calculatePayoutFee, calculateNetPayout, canRequestPayout } = require('../config/payout.config');
const { getAllLevels } = require('../config/levels.config');

/**
 * Payouts Controller
 * Handles all payout-related HTTP requests
 * 
 * DUMMY MODE: Simuliert Auszahlungen ohne echte Stripe-Integration
 * SPÄTER: Stripe Connect für echte Auszahlungen
 */
const payoutsController = {
  /**
   * Get user balance and payout info
   * GET /api/v1/payouts/balance
   */
  async getBalance(req, res, next) {
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
      
      res.json({
        success: true,
        data: {
          availableBalance: parseFloat(user.available_balance || 0),
          pendingBalance: parseFloat(user.pending_balance || 0),
          totalEarnings: parseFloat(user.total_earnings || 0),
          totalPaidOut: payoutStats.totalPaid,
          pendingPayouts: payoutStats.pendingCount,
          pendingPayoutAmount: payoutStats.pendingAmount,
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
   * Request a payout
   * POST /api/v1/payouts/request
   * 
   * DUMMY: Erstellt Payout und markiert sofort als 'processing'
   * SPÄTER: Stripe Transfer erstellen
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
      
      const availableBalance = parseFloat(user.available_balance || 0);
      
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
      
      // Payout erstellen
      const payout = await PayoutModel.create({
        user_id: userId,
        amount: amount,
        fee: fee,
        net_amount: netAmount,
        iban_last4: user.payout_iban ? user.payout_iban.slice(-4) : null,
        account_holder: user.payout_account_holder,
        status: 'pending'
      });
      
      // Balance reduzieren
      await UserModel.updateBalance(userId, -amount);
      
      // ============================================
      // DUMMY: Sofort als 'processing' markieren
      // In Production würde hier Stripe Transfer kommen
      // ============================================
      const updatedPayout = await PayoutModel.updateStatus(payout.id, 'processing');
      
      // DUMMY: Nach 3 Sekunden als 'completed' markieren (simuliert Bearbeitung)
      // In Production: Stripe Webhook würde Status updaten
      setTimeout(async () => {
        try {
          await PayoutModel.updateStatus(payout.id, 'completed', {
            stripe_transfer_id: `DUMMY_TR_${Date.now()}`
          });
          console.log(`[DUMMY PAYOUT] Payout ${payout.id} completed: ${netAmount}€`);
        } catch (err) {
          console.error('Error completing dummy payout:', err);
        }
      }, 3000);
      
      console.log(`[DUMMY PAYOUT] Requested: ${amount}€, Fee: ${fee}€, Net: ${netAmount}€`);
      
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
          // Info für User
          estimatedArrival: new Date(Date.now() + PAYOUT_CONFIG.processingDays * 24 * 60 * 60 * 1000),
          isDummy: true
        },
        message: fee > 0 
          ? `Auszahlung beantragt! Gebühr: ${fee}€` 
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
      const { limit = 20, offset = 0, status } = req.query;
      
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
          statusLabel: PAYOUT_CONFIG.statusLabels[p.status],
          ibanLast4: p.iban_last4,
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
      const { id } = req.params;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }
      
      // Payout laden
      const payout = await PayoutModel.findById(id);
      
      if (!payout) {
        return res.status(404).json({
          success: false,
          message: 'Auszahlung nicht gefunden'
        });
      }
      
      if (payout.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Kein Zugriff auf diese Auszahlung'
        });
      }
      
      if (payout.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Nur ausstehende Auszahlungen können storniert werden'
        });
      }
      
      // Stornieren
      const cancelled = await PayoutModel.cancel(id, userId);
      
      if (cancelled) {
        // Balance zurückbuchen
        await UserModel.updateBalance(userId, parseFloat(payout.amount));
      }
      
      res.json({
        success: true,
        message: 'Auszahlung storniert'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get platform configuration (levels, fees, etc.)
   * GET /api/v1/payouts/config
   */
  async getConfig(req, res, next) {
    try {
      res.json({
        success: true,
        data: {
          levels: getAllLevels(),
          payout: {
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
  }
};

module.exports = payoutsController;
