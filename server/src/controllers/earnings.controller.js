const TransactionModel = require('../models/Transaction.model');
const UserModel = require('../models/User.model');
const { getLevelByNumber, getNextLevel, calculateLevelProgress, getAllLevels } = require('../config/levels.config');

/**
 * Earnings Controller
 * Handles all earnings/statistics related HTTP requests
 * 
 * WICHTIG: Alle Endpoints erfordern Authentifizierung!
 */
const earningsController = {
  /**
   * Get earnings dashboard data
   * GET /api/v1/earnings/dashboard
   */
  async getDashboard(req, res, next) {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }
      
      // Get current month dates
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      
      // Get earnings summaries from DB
      const productEarnings = await TransactionModel.getEarningsSummary(userId);
      const affiliateEarnings = await TransactionModel.getAffiliateEarningsSummary(userId);
      
      // Get this month's earnings
      const thisMonthData = await TransactionModel.getEarningsByPeriod(
        userId, 
        thisMonthStart.toISOString(), 
        now.toISOString()
      );
      
      // Get last month's earnings
      const lastMonthData = await TransactionModel.getEarningsByPeriod(
        userId, 
        lastMonthStart.toISOString(), 
        lastMonthEnd.toISOString()
      );
      
      const thisMonthTotal = thisMonthData.reduce((sum, day) => sum + parseFloat(day.earnings || 0), 0);
      const lastMonthTotal = lastMonthData.reduce((sum, day) => sum + parseFloat(day.earnings || 0), 0);
      
      // Calculate change percentage
      let change = 0;
      if (lastMonthTotal > 0) {
        change = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100);
      } else if (thisMonthTotal > 0) {
        change = 100;
      }
      
      const totalProductEarnings = parseFloat(productEarnings.product_earnings || 0);
      const totalAffiliateEarnings = parseFloat(affiliateEarnings.affiliate_earnings || 0);
      
      res.json({
        success: true,
        data: {
          total: totalProductEarnings + totalAffiliateEarnings,
          productEarnings: totalProductEarnings,
          affiliateEarnings: totalAffiliateEarnings,
          thisMonth: thisMonthTotal,
          lastMonth: lastMonthTotal,
          change: Math.round(change * 10) / 10,
          totalSales: parseInt(productEarnings.total_sales || 0),
          totalReferrals: parseInt(affiliateEarnings.total_referrals || 0)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get earnings by product
   * GET /api/v1/earnings/products
   */
  async getProductEarnings(req, res, next) {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }
      
      const topProducts = await TransactionModel.getTopProductsByRevenue(userId, 10);
      
      res.json({
        success: true,
        data: topProducts.map(p => ({
          id: p.id,
          title: p.title,
          thumbnail: p.thumbnail_url,
          sales: parseInt(p.sales || 0),
          revenue: parseFloat(p.revenue || 0)
        }))
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get affiliate earnings
   * GET /api/v1/earnings/affiliates
   */
  async getAffiliateEarnings(req, res, next) {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }
      
      const affiliateSales = await TransactionModel.findByPromoterId(userId, 50, 0);
      
      res.json({
        success: true,
        data: affiliateSales.map(t => ({
          id: t.id,
          productTitle: t.product_title,
          productThumbnail: t.product_thumbnail,
          commission: parseFloat(t.promoter_commission || 0),
          date: t.created_at
        }))
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get level info
   * GET /api/v1/earnings/level
   */
  async getLevelInfo(req, res, next) {
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
      
      const totalEarnings = parseFloat(user.total_earnings || 0);
      const currentLevel = getLevelByNumber(user.level);
      const nextLevel = getNextLevel(user.level);
      const progress = calculateLevelProgress(totalEarnings, user.level);
      
      res.json({
        success: true,
        data: {
          current: user.level,
          name: currentLevel.name,
          fee: currentLevel.fee,
          color: currentLevel.color,
          description: currentLevel.description,
          progress: totalEarnings,
          nextLevel: nextLevel ? nextLevel.minEarnings : null,
          nextLevelName: nextLevel ? nextLevel.name : null,
          nextLevelFee: nextLevel ? nextLevel.fee : null,
          amountToNext: progress.amountToNext,
          progressPercent: progress.progress
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all levels info (public)
   * GET /api/v1/earnings/levels
   */
  async getAllLevelsInfo(req, res, next) {
    try {
      res.json({
        success: true,
        data: getAllLevels()
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = earningsController;
