const TransactionModel = require('../models/Transaction.model');
const UserModel = require('../models/User.model');
const { getLevelByNumber, getNextLevel, calculateLevelProgress, getAllLevels } = require('../config/levels.config');

/**
 * Earnings Controller
 * Handles all earnings/statistics related HTTP requests
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
   * Get detailed statistics with chart data
   * GET /api/v1/earnings/statistics
   * 
   * Query params:
   * - period: '7d' | '30d' | '90d' | '365d' | 'all'
   */
  async getStatistics(req, res, next) {
    try {
      const userId = req.userId;
      const { period = '30d' } = req.query;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }
      
      const now = new Date();
      let startDate, previousStartDate, previousEndDate;
      let days;
      
      // Calculate date ranges based on period
      switch (period) {
        case '7d':
          days = 7;
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
          previousEndDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          days = 90;
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          previousEndDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '365d':
          days = 365;
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          previousStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
          previousEndDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        case 'all':
          days = 9999;
          startDate = new Date('2020-01-01');
          previousStartDate = new Date('2020-01-01');
          previousEndDate = new Date('2020-01-01');
          break;
        case '30d':
        default:
          days = 30;
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
          previousEndDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }
      
      // Get chart data (daily breakdown)
      const chartData = await TransactionModel.getDetailedStatistics(
        userId,
        startDate.toISOString(),
        now.toISOString()
      );
      
      // Get period comparison
      const comparison = await TransactionModel.getPeriodComparison(
        userId,
        startDate.toISOString(),
        now.toISOString(),
        previousStartDate.toISOString(),
        previousEndDate.toISOString()
      );
      
      // Get top products
      const topProducts = await TransactionModel.getTopProductsByRevenue(userId, 5);
      
      // Get recent sales
      const recentSales = await TransactionModel.getRecentSales(userId, 10);
      
      // Get total views
      const totalViews = await TransactionModel.getViewsInPeriod(userId, startDate, now);
      
      // Calculate KPIs
      const currentEarnings = parseFloat(comparison?.current_earnings || 0);
      const previousEarnings = parseFloat(comparison?.previous_earnings || 0);
      const currentSales = parseInt(comparison?.current_sales || 0);
      const previousSales = parseInt(comparison?.previous_sales || 0);
      const currentAvg = parseFloat(comparison?.current_avg || 0);
      const previousAvg = parseFloat(comparison?.previous_avg || 0);
      
      // Calculate changes
      const earningsChange = previousEarnings > 0 
        ? ((currentEarnings - previousEarnings) / previousEarnings * 100) 
        : (currentEarnings > 0 ? 100 : 0);
      
      const salesChange = previousSales > 0 
        ? ((currentSales - previousSales) / previousSales * 100) 
        : (currentSales > 0 ? 100 : 0);
      
      const avgChange = previousAvg > 0 
        ? ((currentAvg - previousAvg) / previousAvg * 100) 
        : (currentAvg > 0 ? 100 : 0);
      
      // Calculate conversion rate
      const conversionRate = totalViews > 0 
        ? (currentSales / totalViews * 100) 
        : 0;
      
      // Fill in missing days for chart (ensure continuous data)
      const filledChartData = fillMissingDays(chartData, startDate, now, days);
      
      res.json({
        success: true,
        data: {
          period,
          dateRange: {
            start: startDate.toISOString(),
            end: now.toISOString()
          },
          
          // KPIs with trends
          kpis: {
            earnings: {
              value: currentEarnings,
              change: Math.round(earningsChange * 10) / 10,
              previousValue: previousEarnings
            },
            sales: {
              value: currentSales,
              change: Math.round(salesChange * 10) / 10,
              previousValue: previousSales
            },
            avgOrderValue: {
              value: currentAvg,
              change: Math.round(avgChange * 10) / 10,
              previousValue: previousAvg
            },
            conversionRate: {
              value: Math.round(conversionRate * 100) / 100,
              views: totalViews
            }
          },
          
          // Chart data (daily)
          chart: filledChartData.map(day => ({
            date: day.date,
            earnings: parseFloat(day.earnings || 0),
            sales: parseInt(day.sales || 0),
            avgOrderValue: parseFloat(day.avg_order_value || 0)
          })),
          
          // Top products with percentages
          topProducts: topProducts.map(p => ({
            id: p.id,
            title: p.title,
            thumbnail: p.thumbnail_url,
            sales: parseInt(p.sales || 0),
            revenue: parseFloat(p.revenue || 0),
            percentage: parseFloat(p.percentage || 0),
            conversionRate: parseFloat(p.conversion_rate || 0),
            views: parseInt(p.views || 0)
          })),
          
          // Recent activity
          recentSales: recentSales.map(s => ({
            id: s.id,
            productTitle: s.product_title,
            productThumbnail: s.product_thumbnail,
            buyerName: s.buyer_name,
            amount: parseFloat(s.seller_amount || 0),
            date: s.created_at,
            // Affiliate info
            isAffiliateSale: !!s.promoter_id,
            affiliateCommission: parseFloat(s.promoter_commission || 0),
            promoterName: s.promoter_name || null,
            promoterUsername: s.promoter_username || null
          }))
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
          revenue: parseFloat(p.revenue || 0),
          percentage: parseFloat(p.percentage || 0),
          conversionRate: parseFloat(p.conversion_rate || 0)
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

/**
 * Helper: Fill missing days in chart data
 */
function fillMissingDays(data, startDate, endDate, maxDays) {
  const result = [];
  const dataMap = new Map();
  
  // Create map from existing data
  data.forEach(day => {
    const dateStr = new Date(day.date).toISOString().split('T')[0];
    dataMap.set(dateStr, day);
  });
  
  // Determine grouping based on period length
  const daysDiff = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));
  
  // For periods > 90 days, group by week
  if (daysDiff > 90) {
    const weekMap = new Map();
    
    data.forEach(day => {
      const date = new Date(day.date);
      const weekStart = getWeekStart(date);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, {
          date: weekKey,
          earnings: 0,
          sales: 0,
          avg_order_value: 0,
          count: 0
        });
      }
      
      const week = weekMap.get(weekKey);
      week.earnings += parseFloat(day.earnings || 0);
      week.sales += parseInt(day.sales || 0);
      week.avg_order_value += parseFloat(day.avg_order_value || 0);
      week.count++;
    });
    
    // Calculate averages and return
    weekMap.forEach(week => {
      if (week.count > 0) {
        week.avg_order_value = week.avg_order_value / week.count;
      }
      result.push(week);
    });
    
    return result.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  
  // For shorter periods, fill each day
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    
    if (dataMap.has(dateStr)) {
      result.push(dataMap.get(dateStr));
    } else {
      result.push({
        date: dateStr,
        earnings: 0,
        sales: 0,
        avg_order_value: 0
      });
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return result;
}

/**
 * Helper: Get week start (Monday)
 */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

module.exports = earningsController;
