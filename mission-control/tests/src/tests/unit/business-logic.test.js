import { describe, it, expect } from '@jest/globals';

/**
 * Monemee Business Logic Tests
 * Tests für Kernfunktionen der Platform
 */

// ========== LEVEL SYSTEM ==========
describe('Level System', () => {
  const LEVEL_CONFIG = {
    1: { name: 'Starter', fee: 29, minEarnings: 0 },
    2: { name: 'Rising Star', fee: 20, minEarnings: 100 },
    3: { name: 'Creator', fee: 15, minEarnings: 500 },
    4: { name: 'Pro', fee: 12, minEarnings: 2000 },
    5: { name: 'Elite', fee: 9, minEarnings: 10000 }
  };

  function getLevelByEarnings(totalEarnings) {
    if (totalEarnings >= 10000) return 5;
    if (totalEarnings >= 2000) return 4;
    if (totalEarnings >= 500) return 3;
    if (totalEarnings >= 100) return 2;
    return 1;
  }

  function getPlatformFee(level) {
    return LEVEL_CONFIG[level]?.fee || 29;
  }

  function calculateLevelProgress(totalEarnings, currentLevel) {
    if (currentLevel >= 5) return 100;

    const nextLevel = currentLevel + 1;
    const currentThreshold = LEVEL_CONFIG[currentLevel].minEarnings;
    const nextThreshold = LEVEL_CONFIG[nextLevel].minEarnings;
    const range = nextThreshold - currentThreshold;
    const progress = totalEarnings - currentThreshold;

    return Math.min(100, Math.max(0, (progress / range) * 100));
  }

  it('should assign correct level based on earnings', () => {
    expect(getLevelByEarnings(0)).toBe(1);
    expect(getLevelByEarnings(50)).toBe(1);
    expect(getLevelByEarnings(100)).toBe(2);
    expect(getLevelByEarnings(500)).toBe(3);
    expect(getLevelByEarnings(2000)).toBe(4);
    expect(getLevelByEarnings(10000)).toBe(5);
    expect(getLevelByEarnings(50000)).toBe(5);
  });

  it('should return correct platform fees per level', () => {
    expect(getPlatformFee(1)).toBe(29);
    expect(getPlatformFee(2)).toBe(20);
    expect(getPlatformFee(3)).toBe(15);
    expect(getPlatformFee(4)).toBe(12);
    expect(getPlatformFee(5)).toBe(9);
  });

  it('should calculate level progress correctly', () => {
    // Level 1: 0-100 EUR
    expect(calculateLevelProgress(0, 1)).toBe(0);
    expect(calculateLevelProgress(50, 1)).toBe(50);
    expect(calculateLevelProgress(100, 1)).toBe(100);

    // Level 2: 100-500 EUR
    expect(calculateLevelProgress(100, 2)).toBe(0);
    expect(calculateLevelProgress(300, 2)).toBe(50);
    expect(calculateLevelProgress(500, 2)).toBe(100);

    // Level 5: Max level
    expect(calculateLevelProgress(50000, 5)).toBe(100);
  });

  it('should handle edge cases in level calculation', () => {
    expect(getLevelByEarnings(-10)).toBe(1);
    expect(getLevelByEarnings(99.99)).toBe(1);
    expect(getLevelByEarnings(100.01)).toBe(2);
  });
});

// ========== EARNINGS & FEES ==========
describe('Earnings & Fee Calculations', () => {
  function calculatePlatformFee(amount, level) {
    const fees = { 1: 29, 2: 20, 3: 15, 4: 12, 5: 9 };
    const feePercent = fees[level] || 29;
    return Number((amount * (feePercent / 100)).toFixed(2));
  }

  function calculateSellerAmount(amount, level) {
    const platformFee = calculatePlatformFee(amount, level);
    return Number((amount - platformFee).toFixed(2));
  }

  function calculateAffiliateCommission(amount, level) {
    // Affiliate bekommt 50% der Platform Fee
    const platformFee = calculatePlatformFee(amount, level);
    return Number((platformFee * 0.5).toFixed(2));
  }

  it('should calculate platform fees correctly', () => {
    expect(calculatePlatformFee(100, 1)).toBe(29);
    expect(calculatePlatformFee(100, 2)).toBe(20);
    expect(calculatePlatformFee(100, 3)).toBe(15);
    expect(calculatePlatformFee(100, 4)).toBe(12);
    expect(calculatePlatformFee(100, 5)).toBe(9);
  });

  it('should calculate seller amounts correctly', () => {
    expect(calculateSellerAmount(100, 1)).toBe(71);
    expect(calculateSellerAmount(100, 5)).toBe(91);
    expect(calculateSellerAmount(29.99, 3)).toBe(25.49);
  });

  it('should calculate affiliate commission correctly', () => {
    expect(calculateAffiliateCommission(100, 1)).toBe(14.5);
    expect(calculateAffiliateCommission(100, 5)).toBe(4.5);
  });

  it('should handle decimal amounts correctly', () => {
    const amount = 49.99;
    const level = 3;
    const platformFee = calculatePlatformFee(amount, level);
    const sellerAmount = calculateSellerAmount(amount, level);
    const total = platformFee + sellerAmount;

    expect(total).toBeCloseTo(amount, 2);
  });

  it('should handle small amounts', () => {
    expect(calculatePlatformFee(1, 1)).toBe(0.29);
    expect(calculateSellerAmount(1, 1)).toBe(0.71);
  });

  it('should handle large amounts', () => {
    expect(calculatePlatformFee(10000, 1)).toBe(2900);
    expect(calculateSellerAmount(10000, 5)).toBe(9100);
  });
});

// ========== VALIDATION ==========
describe('Validation Functions', () => {
  function isValidPrice(price) {
    const num = parseFloat(price);
    return !isNaN(num) && num > 0 && num <= 10000;
  }

  function isValidLevel(level) {
    return Number.isInteger(level) && level >= 1 && level <= 5;
  }

  function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function isValidUsername(username) {
    // 3-30 chars, alphanumeric + underscore
    const regex = /^[a-zA-Z0-9_]{3,30}$/;
    return regex.test(username);
  }

  it('should validate prices correctly', () => {
    expect(isValidPrice(10)).toBe(true);
    expect(isValidPrice(99.99)).toBe(true);
    expect(isValidPrice(0)).toBe(false);
    expect(isValidPrice(-10)).toBe(false);
    expect(isValidPrice(10001)).toBe(false);
    expect(isValidPrice('abc')).toBe(false);
  });

  it('should validate levels correctly', () => {
    expect(isValidLevel(1)).toBe(true);
    expect(isValidLevel(5)).toBe(true);
    expect(isValidLevel(0)).toBe(false);
    expect(isValidLevel(6)).toBe(false);
    expect(isValidLevel(2.5)).toBe(false);
    expect(isValidLevel('3')).toBe(false);
  });

  it('should validate emails correctly', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.user+tag@domain.co.uk')).toBe(true);
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user @example.com')).toBe(false);
  });

  it('should validate usernames correctly', () => {
    expect(isValidUsername('user123')).toBe(true);
    expect(isValidUsername('test_user')).toBe(true);
    expect(isValidUsername('ab')).toBe(false); // too short
    expect(isValidUsername('a'.repeat(31))).toBe(false); // too long
    expect(isValidUsername('user-name')).toBe(false); // contains hyphen
    expect(isValidUsername('user name')).toBe(false); // contains space
  });
});

// ========== FORMATTING ==========
describe('Formatting Functions', () => {
  function formatCurrency(amount) {
    return `€${parseFloat(amount).toFixed(2)}`;
  }

  function formatPercentage(value) {
    return `${parseFloat(value).toFixed(1)}%`;
  }

  function formatNumber(num) {
    return new Intl.NumberFormat('de-DE').format(num);
  }

  it('should format currency correctly', () => {
    expect(formatCurrency(10)).toBe('€10.00');
    expect(formatCurrency(99.99)).toBe('€99.99');
    expect(formatCurrency(1234.5)).toBe('€1234.50');
  });

  it('should format percentages correctly', () => {
    expect(formatPercentage(29)).toBe('29.0%');
    expect(formatPercentage(12.5)).toBe('12.5%');
    expect(formatPercentage(99.99)).toBe('100.0%');
  });

  it('should format numbers with locale', () => {
    expect(formatNumber(1000)).toBe('1.000');
    expect(formatNumber(1234567)).toBe('1.234.567');
  });
});

// ========== CONVERSION METRICS ==========
describe('Conversion & Analytics', () => {
  function calculateConversionRate(sales, views) {
    if (views === 0) return 0;
    return Number(((sales / views) * 100).toFixed(2));
  }

  function calculateAverageOrderValue(totalRevenue, orderCount) {
    if (orderCount === 0) return 0;
    return Number((totalRevenue / orderCount).toFixed(2));
  }

  function calculateChurnRate(activeUsers, totalUsers) {
    if (totalUsers === 0) return 0;
    const inactive = totalUsers - activeUsers;
    return Number(((inactive / totalUsers) * 100).toFixed(2));
  }

  it('should calculate conversion rate correctly', () => {
    expect(calculateConversionRate(10, 100)).toBe(10);
    expect(calculateConversionRate(5, 200)).toBe(2.5);
    expect(calculateConversionRate(0, 100)).toBe(0);
    expect(calculateConversionRate(10, 0)).toBe(0);
  });

  it('should calculate average order value correctly', () => {
    expect(calculateAverageOrderValue(1000, 10)).toBe(100);
    expect(calculateAverageOrderValue(999.99, 3)).toBe(333.33);
    expect(calculateAverageOrderValue(0, 0)).toBe(0);
  });

  it('should calculate churn rate correctly', () => {
    expect(calculateChurnRate(80, 100)).toBe(20);
    expect(calculateChurnRate(950, 1000)).toBe(5);
    expect(calculateChurnRate(100, 100)).toBe(0);
    expect(calculateChurnRate(0, 100)).toBe(100);
  });
});
