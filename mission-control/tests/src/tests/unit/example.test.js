import { describe, it, expect } from '@jest/globals';

describe('Example Unit Tests', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    const str = 'Mission Control';
    expect(str).toContain('Mission');
    expect(str.length).toBe(15);
  });

  it('should work with arrays', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr).toHaveLength(5);
    expect(arr).toContain(3);
  });

  it('should handle objects', () => {
    const obj = { name: 'Admin', role: 'super-admin' };
    expect(obj).toHaveProperty('name');
    expect(obj.role).toBe('super-admin');
  });
});

describe('Monemee Business Logic Tests', () => {
  // Beispiel: Level-Fee Berechnung
  function getPlatformFee(level) {
    const fees = { 1: 29, 2: 20, 3: 15, 4: 12, 5: 9 };
    return fees[level] || 29;
  }

  it('should calculate correct platform fees', () => {
    expect(getPlatformFee(1)).toBe(29);
    expect(getPlatformFee(2)).toBe(20);
    expect(getPlatformFee(3)).toBe(15);
    expect(getPlatformFee(4)).toBe(12);
    expect(getPlatformFee(5)).toBe(9);
  });

  it('should default to level 1 fee for invalid levels', () => {
    expect(getPlatformFee(0)).toBe(29);
    expect(getPlatformFee(99)).toBe(29);
  });

  // Beispiel: Earnings Berechnung
  function calculateSellerAmount(amount, level) {
    const fee = getPlatformFee(level);
    const platformFee = amount * (fee / 100);
    return amount - platformFee;
  }

  it('should calculate seller amount correctly', () => {
    const amount = 100;

    // Level 1: 29% Fee -> €71
    expect(calculateSellerAmount(amount, 1)).toBe(71);

    // Level 5: 9% Fee -> €91
    expect(calculateSellerAmount(amount, 5)).toBe(91);
  });
});
