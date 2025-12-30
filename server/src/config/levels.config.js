/**
 * Level Configuration - Single Source of Truth
 * 
 * WICHTIG: Diese Datei ist die einzige Stelle, an der Level-Daten definiert werden.
 * Alle anderen Dateien (Controller, Services, Frontend) importieren von hier.
 */

const LEVELS = [
  {
    level: 1,
    name: 'Starter',
    minEarnings: 0,
    fee: 29,
    color: '#64748B',
    description: 'Dein Einstieg als Creator'
  },
  {
    level: 2,
    name: 'Rising Star',
    minEarnings: 100,
    fee: 20,
    color: '#3B82F6',
    description: 'Du hast deine ersten Verkäufe gemacht'
  },
  {
    level: 3,
    name: 'Creator',
    minEarnings: 500,
    fee: 15,
    color: '#8B5CF6',
    description: 'Du bist ein etablierter Creator'
  },
  {
    level: 4,
    name: 'Pro',
    minEarnings: 2000,
    fee: 12,
    color: '#F59E0B',
    description: 'Du gehörst zu den Top-Verkäufern'
  },
  {
    level: 5,
    name: 'Elite',
    minEarnings: 5000,
    fee: 9,
    color: '#10B981',
    description: 'Die höchste Stufe - maximale Vorteile'
  }
];

/**
 * Get level by level number
 */
function getLevelByNumber(levelNumber) {
  return LEVELS.find(l => l.level === levelNumber) || LEVELS[0];
}

/**
 * Get level by total earnings
 */
function getLevelByEarnings(totalEarnings) {
  let currentLevel = LEVELS[0];
  
  for (const level of LEVELS) {
    if (totalEarnings >= level.minEarnings) {
      currentLevel = level;
    }
  }
  
  return currentLevel;
}

/**
 * Get platform fee by level number
 */
function getPlatformFee(levelNumber) {
  const level = getLevelByNumber(levelNumber);
  return level.fee;
}

/**
 * Get next level info
 */
function getNextLevel(currentLevelNumber) {
  const nextIndex = LEVELS.findIndex(l => l.level === currentLevelNumber) + 1;
  return nextIndex < LEVELS.length ? LEVELS[nextIndex] : null;
}

/**
 * Calculate progress to next level
 */
function calculateLevelProgress(totalEarnings, currentLevelNumber) {
  const currentLevel = getLevelByNumber(currentLevelNumber);
  const nextLevel = getNextLevel(currentLevelNumber);
  
  if (!nextLevel) {
    return {
      progress: 100,
      amountToNext: 0,
      progressAmount: totalEarnings - currentLevel.minEarnings
    };
  }
  
  const progressRange = nextLevel.minEarnings - currentLevel.minEarnings;
  const currentProgress = totalEarnings - currentLevel.minEarnings;
  const progressPercent = Math.min((currentProgress / progressRange) * 100, 100);
  
  return {
    progress: Math.round(progressPercent),
    amountToNext: Math.max(nextLevel.minEarnings - totalEarnings, 0),
    progressAmount: currentProgress
  };
}

/**
 * Get all levels (for display)
 */
function getAllLevels() {
  return LEVELS;
}

module.exports = {
  LEVELS,
  getLevelByNumber,
  getLevelByEarnings,
  getPlatformFee,
  getNextLevel,
  calculateLevelProgress,
  getAllLevels
};
