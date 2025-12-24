const UserModel = require('../models/User.model');
const { 
  LEVELS,
  getLevelByNumber,
  getLevelByEarnings,
  getPlatformFee,
  getNextLevel,
  calculateLevelProgress
} = require('../config/levels.config');

/**
 * Level Service
 * Handles level progression and platform fee calculation
 * 
 * Nutzt zentrale Konfiguration aus /config/levels.config.js
 */
const LevelService = {
  /**
   * Level thresholds and fees (re-export from config)
   */
  levels: LEVELS,

  /**
   * Get level info by earnings
   */
  getLevelByEarnings,

  /**
   * Get platform fee percentage for user
   */
  getPlatformFee,

  /**
   * Calculate progress to next level
   */
  getProgressToNextLevel(totalEarnings, currentLevel) {
    const currentLevelInfo = getLevelByNumber(currentLevel);
    const nextLevelInfo = getNextLevel(currentLevel);
    
    if (!nextLevelInfo) {
      return {
        currentLevel: currentLevelInfo,
        nextLevel: null,
        progress: 100,
        amountToNext: 0
      };
    }
    
    const progress = calculateLevelProgress(totalEarnings, currentLevel);
    
    return {
      currentLevel: currentLevelInfo,
      nextLevel: nextLevelInfo,
      progress: progress.progress,
      amountToNext: progress.amountToNext
    };
  },

  /**
   * Check if user leveled up after a sale
   */
  async checkLevelUp(userId, newEarnings) {
    const user = await UserModel.findById(userId);
    if (!user) return null;

    const newTotal = parseFloat(user.total_earnings) + newEarnings;
    const newLevelInfo = getLevelByEarnings(newTotal);

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
  },

  /**
   * Calculate fee savings compared to starter level
   */
  calculateFeeSavings(totalEarnings, currentLevel) {
    const starterFee = LEVELS[0].fee;
    const currentFee = getPlatformFee(currentLevel);
    const feeReduction = starterFee - currentFee;
    
    // Berechne wie viel gespart wurde basierend auf bisherigen Einnahmen
    const savedAmount = totalEarnings * (feeReduction / 100);
    
    return {
      starterFee,
      currentFee,
      feeReduction,
      savedAmount: Math.round(savedAmount * 100) / 100
    };
  }
};

module.exports = LevelService;
