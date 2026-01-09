/**
 * Download Token Model
 * Verwaltet sichere Download-Links für E-Mail-Versand
 *
 * Tokens sind:
 * - 256-bit kryptografisch sicher (hex-encoded)
 * - Begrenzt auf max. 3 Downloads
 * - Gültig für 30 Tage
 */

const db = require('../config/database');
const crypto = require('crypto');

// Konfiguration
const TOKEN_EXPIRY_DAYS = parseInt(process.env.DOWNLOAD_TOKEN_EXPIRY_DAYS) || 30;
const TOKEN_MAX_CLICKS = parseInt(process.env.DOWNLOAD_TOKEN_MAX_CLICKS) || 3;

const DownloadTokenModel = {
  /**
   * Generiert einen sicheren Token
   */
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  },

  /**
   * Berechnet Ablaufdatum
   */
  getExpiryDate() {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + TOKEN_EXPIRY_DAYS);
    return expiry;
  },

  /**
   * Erstellt Download-Tokens für eine Transaktion
   * Ein Token pro herunterladbarem Modul
   *
   * @param {Object} params
   * @param {number} params.transactionId - Transaktions-ID
   * @param {number|null} params.buyerId - Käufer-ID (null für Gäste)
   * @param {string|null} params.buyerEmail - Käufer-E-Mail
   * @param {number} params.productId - Produkt-ID
   * @param {Array} params.modules - Array von Modulen mit {id, title, file_url}
   * @returns {Array} - Array von erstellten Tokens
   */
  async createForTransaction({ transactionId, buyerId, buyerEmail, productId, modules }) {
    const tokens = [];
    const expiresAt = this.getExpiryDate();

    for (const module of modules) {
      // Nur für Module mit Datei-URL
      if (!module.file_url) continue;

      const token = this.generateToken();

      const query = `
        INSERT INTO download_tokens (
          transaction_id, buyer_id, buyer_email, product_id, module_id,
          token, max_clicks, expires_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const values = [
        transactionId,
        buyerId,
        buyerEmail,
        productId,
        module.id,
        token,
        TOKEN_MAX_CLICKS,
        expiresAt
      ];

      const result = await db.query(query, values);
      const tokenRecord = result.rows[0];

      tokens.push({
        ...tokenRecord,
        module_title: module.title || module.file_name,
        file_url: module.file_url
      });
    }

    console.log(`[DownloadToken] ${tokens.length} Tokens erstellt für Transaktion ${transactionId}`);
    return tokens;
  },

  /**
   * Findet einen Token und validiert ihn
   *
   * @param {string} token - Der Token-String
   * @returns {Object|null} - Token-Objekt mit Modul-Daten oder null
   */
  async findByToken(token) {
    const query = `
      SELECT
        dt.*,
        pm.title as module_title,
        pm.file_url,
        pm.file_name,
        pm.file_size,
        p.title as product_title,
        p.thumbnail_url as product_thumbnail
      FROM download_tokens dt
      JOIN product_modules pm ON dt.module_id = pm.id
      JOIN products p ON dt.product_id = p.id
      WHERE dt.token = $1
    `;

    const result = await db.query(query, [token]);
    return result.rows[0] || null;
  },

  /**
   * Prüft ob ein Token gültig ist
   *
   * @param {Object} tokenRecord - Token-Objekt aus der Datenbank
   * @returns {Object} - {valid: boolean, reason?: string}
   */
  validateToken(tokenRecord) {
    if (!tokenRecord) {
      return { valid: false, reason: 'not_found' };
    }

    // Abgelaufen?
    if (new Date(tokenRecord.expires_at) < new Date()) {
      return { valid: false, reason: 'expired' };
    }

    // Klick-Limit erreicht?
    if (tokenRecord.click_count >= tokenRecord.max_clicks) {
      return { valid: false, reason: 'limit_reached' };
    }

    return { valid: true };
  },

  /**
   * Zeichnet Token-Nutzung auf
   *
   * @param {number} tokenId - Token-ID
   * @param {string} ip - IP-Adresse des Downloaders
   */
  async recordUsage(tokenId, ip) {
    const query = `
      UPDATE download_tokens
      SET
        click_count = click_count + 1,
        last_used_at = NOW(),
        last_ip = $2
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, [tokenId, ip]);
    return result.rows[0];
  },

  /**
   * Findet alle Tokens für eine Transaktion
   */
  async findByTransactionId(transactionId) {
    const query = `
      SELECT
        dt.*,
        pm.title as module_title,
        pm.file_url,
        pm.file_name
      FROM download_tokens dt
      JOIN product_modules pm ON dt.module_id = pm.id
      WHERE dt.transaction_id = $1
      ORDER BY dt.created_at ASC
    `;

    const result = await db.query(query, [transactionId]);
    return result.rows;
  },

  /**
   * Findet alle Tokens für einen Käufer (via E-Mail)
   */
  async findByBuyerEmail(email) {
    const query = `
      SELECT
        dt.*,
        pm.title as module_title,
        pm.file_url,
        pm.file_name,
        p.title as product_title
      FROM download_tokens dt
      JOIN product_modules pm ON dt.module_id = pm.id
      JOIN products p ON dt.product_id = p.id
      WHERE dt.buyer_email = $1
      ORDER BY dt.created_at DESC
    `;

    const result = await db.query(query, [email]);
    return result.rows;
  },

  /**
   * Löscht abgelaufene Tokens (für Cleanup-Job)
   */
  async deleteExpired() {
    const query = `
      DELETE FROM download_tokens
      WHERE expires_at < NOW()
      RETURNING id
    `;

    const result = await db.query(query);
    const count = result.rows.length;

    if (count > 0) {
      console.log(`[DownloadToken] ${count} abgelaufene Tokens gelöscht`);
    }

    return count;
  },

  /**
   * Holt Statistiken für einen Token
   */
  async getTokenStats(token) {
    const query = `
      SELECT
        click_count,
        max_clicks,
        max_clicks - click_count as remaining_clicks,
        expires_at,
        EXTRACT(EPOCH FROM (expires_at - NOW())) / 86400 as days_remaining
      FROM download_tokens
      WHERE token = $1
    `;

    const result = await db.query(query, [token]);
    return result.rows[0] || null;
  }
};

module.exports = DownloadTokenModel;
