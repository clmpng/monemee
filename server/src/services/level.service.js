const UserModel = require('../models/User.model');

/**
 * Level Service
 * Handles level progression and platform fee calculation
 */
const LevelService = {
  /**
   * Level thresholds and fees
   */
  levels: [
    { level: 1, minEarnings: 0, fee: 15, name: 'Starter' },
    { level: 2, minEarnings: 100, fee: 12, name: 'Rising Star' },
    { level: 3, minEarnings: 500, fee: 10, name: 'Creator' },
    { level: 4, minEarnings: 2000, fee: 8, name: 'Pro' },
    { level: 5, minEarnings: 5000, fee: 5, name: 'Elite' }
  ],

  /**
   * Get level info by earnings
   */
  getLevelByEarnings(totalEarnings) {
    let currentLevel = this.levels[0];
    
    for (const level of this.levels) {
      if (totalEarnings >= level.minEarnings) {
        currentLevel = level;
      }
    }
    
    return currentLevel;
  },

  /**
   * Get platform fee percentage for user
   */
  getPlatformFee(level) {
    const levelInfo = this.levels.find(l => l.level === level);
    return levelInfo ? levelInfo.fee : 15;
  },

  /**
   * Calculate progress to next level
   */
  getProgressToNextLevel(totalEarnings, currentLevel) {
    const nextLevelIndex = this.levels.findIndex(l => l.level === currentLevel) + 1;
    
    if (nextLevelIndex >= this.levels.length) {
      // Already at max level
      return {
        currentLevel,
        nextLevel: null,
        progress: 100,
        amountToNext: 0
      };
    }

    const currentLevelInfo = this.levels.find(l => l.level === currentLevel);
    const nextLevelInfo = this.levels[nextLevelIndex];
    
    const progressRange = nextLevelInfo.minEarnings - currentLevelInfo.minEarnings;
    const currentProgress = totalEarnings - currentLevelInfo.minEarnings;
    const progressPercent = Math.min((currentProgress / progressRange) * 100, 100);
    
    return {
      currentLevel: currentLevelInfo,
      nextLevel: nextLevelInfo,
      progress: Math.round(progressPercent),
      amountToNext: Math.max(nextLevelInfo.minEarnings - totalEarnings, 0)
    };
  },

  /**
   * Check if user leveled up after a sale
   */
  async checkLevelUp(userId, newEarnings) {
    const user = await UserModel.findById(userId);
    if (!user) return null;

    const newTotal = parseFloat(user.total_earnings) + newEarnings;
    const newLevelInfo = this.getLevelByEarnings(newTotal);

    if (newLevelInfo.level > user.level) {
      // Level up!
      await UserModel.updateEarnings(userId, newEarnings);
      
      return {
        leveledUp: true,
        oldLevel: user.level,
        newLevel: newLevelInfo.level,
        newLevelName: newLevelInfo.name,
        newFee: newLevelInfo.fee
      };
    }

    // No level up, just update earnings
    await UserModel.updateEarnings(userId, newEarnings);
    
    return {
      leveledUp: false,
      currentLevel: user.level
    };
  }
};

module.exports = LevelService;