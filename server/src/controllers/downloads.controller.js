/**
 * Downloads Controller
 * Verwaltet digitale Produktauslieferung
 *
 * Zwei Zugriffswege:
 * 1. Token-basiert (E-Mail-Links) - öffentlich, begrenzte Nutzung
 * 2. Authentifiziert (Käufe-Seite) - unbegrenzt für registrierte User
 */

const TransactionModel = require('../models/Transaction.model');
const DownloadTokenModel = require('../models/DownloadToken.model');
const ProductModuleModel = require('../models/ProductModule.model');

const downloadsController = {
  /**
   * Download via Token (E-Mail-Link)
   * GET /api/v1/downloads/token/:token
   *
   * Öffentlich zugänglich, aber begrenzt auf max_clicks und expires_at
   */
  async downloadByToken(req, res, next) {
    try {
      const { token } = req.params;
      const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';

      // Token finden
      const tokenRecord = await DownloadTokenModel.findByToken(token);

      // Validieren
      const validation = DownloadTokenModel.validateToken(tokenRecord);

      if (!validation.valid) {
        const errorMessages = {
          not_found: 'Download-Link nicht gefunden',
          expired: 'Download-Link ist abgelaufen',
          limit_reached: 'Download-Limit erreicht (max. 3 Downloads)'
        };

        return res.status(410).json({
          success: false,
          message: errorMessages[validation.reason] || 'Download-Link ungültig',
          reason: validation.reason,
          hint: 'Melde dich an, um unbegrenzt auf deine Käufe zuzugreifen.'
        });
      }

      // Nutzung aufzeichnen
      await DownloadTokenModel.recordUsage(tokenRecord.id, clientIp);

      // Redirect zur Datei
      // In Produktion könnte man hier signierte URLs generieren
      res.redirect(tokenRecord.file_url);

    } catch (error) {
      console.error('Download by token error:', error);
      next(error);
    }
  },

  /**
   * Token-Info abrufen (ohne Download)
   * GET /api/v1/downloads/token/:token/info
   */
  async getTokenInfo(req, res, next) {
    try {
      const { token } = req.params;

      const tokenRecord = await DownloadTokenModel.findByToken(token);
      const validation = DownloadTokenModel.validateToken(tokenRecord);

      if (!tokenRecord) {
        return res.status(404).json({
          success: false,
          message: 'Token nicht gefunden'
        });
      }

      res.json({
        success: true,
        data: {
          valid: validation.valid,
          reason: validation.reason,
          productTitle: tokenRecord.product_title,
          moduleTitle: tokenRecord.module_title,
          fileName: tokenRecord.file_name,
          clickCount: tokenRecord.click_count,
          maxClicks: tokenRecord.max_clicks,
          remainingClicks: tokenRecord.max_clicks - tokenRecord.click_count,
          expiresAt: tokenRecord.expires_at
        }
      });

    } catch (error) {
      console.error('Get token info error:', error);
      next(error);
    }
  },

  /**
   * Alle Käufe des eingeloggten Users
   * GET /api/v1/downloads/purchases
   */
  async getMyPurchases(req, res, next) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      // Transaktionen laden
      const transactions = await TransactionModel.findByBuyerId(userId, 100, 0);

      // Für jede Transaktion die Module laden
      const purchasesWithModules = await Promise.all(
        transactions.map(async (t) => {
          const modules = await ProductModuleModel.findByProductId(t.product_id);

          return {
            id: t.id,
            productId: t.product_id,
            productTitle: t.product_title,
            productThumbnail: t.product_thumbnail,
            sellerName: t.seller_name,
            amount: parseFloat(t.amount),
            purchaseDate: t.created_at,
            modules: modules.map(m => ({
              id: m.id,
              type: m.type,
              title: m.title || m.file_name,
              description: m.description,
              fileUrl: m.file_url,
              fileName: m.file_name,
              fileSize: m.file_size,
              url: m.url,
              urlLabel: m.url_label,
              content: m.content
            }))
          };
        })
      );

      res.json({
        success: true,
        data: purchasesWithModules
      });

    } catch (error) {
      console.error('Get purchases error:', error);
      next(error);
    }
  },

  /**
   * Einzelnen Kauf mit Modulen abrufen
   * GET /api/v1/downloads/purchase/:transactionId
   */
  async getPurchaseContent(req, res, next) {
    try {
      const { transactionId } = req.params;
      const userId = req.userId;

      // Transaktion laden
      const transaction = await TransactionModel.findById(transactionId);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Kauf nicht gefunden'
        });
      }

      // Berechtigung prüfen (wenn eingeloggt)
      if (userId && transaction.buyer_id && transaction.buyer_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Keine Berechtigung'
        });
      }

      // Module laden
      const modules = await ProductModuleModel.findByProductId(transaction.product_id);

      res.json({
        success: true,
        data: {
          id: transaction.id,
          productId: transaction.product_id,
          productTitle: transaction.product_title,
          sellerName: transaction.seller_name,
          amount: parseFloat(transaction.amount),
          purchaseDate: transaction.created_at,
          modules: modules.map(m => ({
            id: m.id,
            type: m.type,
            title: m.title || m.file_name,
            description: m.description,
            fileUrl: m.file_url,
            fileName: m.file_name,
            fileSize: m.file_size,
            url: m.url,
            urlLabel: m.url_label,
            content: m.content
          }))
        }
      });

    } catch (error) {
      console.error('Get purchase content error:', error);
      next(error);
    }
  },

  /**
   * Kauf über Stripe Session ID abrufen (für Gäste nach Checkout)
   * GET /api/v1/downloads/session/:sessionId
   */
  async getPurchaseBySession(req, res, next) {
    try {
      const { sessionId } = req.params;

      // Transaktion über Session ID finden
      const transaction = await TransactionModel.findByStripeSessionId(sessionId);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Kauf nicht gefunden. Der Webhook wurde möglicherweise noch nicht verarbeitet.',
          hint: 'Bitte warte einen Moment und lade die Seite neu.'
        });
      }

      // Module laden
      const modules = await ProductModuleModel.findByProductId(transaction.product_id);

      res.json({
        success: true,
        data: {
          id: transaction.id,
          productId: transaction.product_id,
          productTitle: transaction.product_title,
          amount: parseFloat(transaction.amount),
          buyerEmail: transaction.buyer_email,
          isGuest: !transaction.buyer_id,
          modules: modules.map(m => ({
            id: m.id,
            type: m.type,
            title: m.title || m.file_name,
            description: m.description,
            fileUrl: m.type === 'file' ? m.file_url : null,
            fileName: m.file_name,
            fileSize: m.file_size,
            url: m.type === 'url' ? m.url : null,
            urlLabel: m.url_label,
            content: m.type === 'text' ? m.content : null
          }))
        }
      });

    } catch (error) {
      console.error('Get purchase by session error:', error);
      next(error);
    }
  },

  /**
   * Direkt-Download für authentifizierte User
   * GET /api/v1/downloads/file/:moduleId
   *
   * Prüft ob User das Produkt gekauft hat
   */
  async downloadFile(req, res, next) {
    try {
      const { moduleId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      // Modul laden
      const module = await ProductModuleModel.findById(moduleId);

      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Datei nicht gefunden'
        });
      }

      if (!module.file_url) {
        return res.status(400).json({
          success: false,
          message: 'Kein Download verfügbar für dieses Modul'
        });
      }

      // Prüfen ob User das Produkt gekauft hat
      const hasPurchased = await TransactionModel.hasPurchased(userId, module.product_id);

      if (!hasPurchased) {
        return res.status(403).json({
          success: false,
          message: 'Du hast dieses Produkt nicht gekauft'
        });
      }

      // Redirect zur Datei
      res.redirect(module.file_url);

    } catch (error) {
      console.error('Download file error:', error);
      next(error);
    }
  }
};

module.exports = downloadsController;
