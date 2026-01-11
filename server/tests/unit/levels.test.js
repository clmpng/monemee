/**
 * Unit Tests: Level System
 *
 * Testet die Kern-Geschäftslogik des Level-Systems:
 * - Level-Zuordnung basierend auf Einnahmen
 * - Plattform-Gebühren pro Level
 * - Level-Fortschritt Berechnung
 */

const {
  LEVELS,
  getLevelByNumber,
  getLevelByEarnings,
  getPlatformFee,
  getNextLevel,
  calculateLevelProgress,
  getAllLevels
} = require('../../src/config/levels.config');

describe('Level System', () => {

  describe('LEVELS Konstante', () => {
    it('sollte 5 Level definiert haben', () => {
      expect(LEVELS).toHaveLength(5);
    });

    it('sollte aufsteigende Level-Nummern haben (1-5)', () => {
      const levelNumbers = LEVELS.map(l => l.level);
      expect(levelNumbers).toEqual([1, 2, 3, 4, 5]);
    });

    it('sollte aufsteigende minEarnings haben', () => {
      for (let i = 1; i < LEVELS.length; i++) {
        expect(LEVELS[i].minEarnings).toBeGreaterThan(LEVELS[i - 1].minEarnings);
      }
    });

    it('sollte abnehmende Gebühren haben (höheres Level = niedrigere Gebühr)', () => {
      for (let i = 1; i < LEVELS.length; i++) {
        expect(LEVELS[i].fee).toBeLessThan(LEVELS[i - 1].fee);
      }
    });

    it('sollte korrekte Level-Namen haben', () => {
      const names = LEVELS.map(l => l.name);
      expect(names).toEqual(['Starter', 'Rising Star', 'Creator', 'Pro', 'Elite']);
    });

    it('sollte korrekte Gebühren pro Level haben', () => {
      const fees = LEVELS.map(l => l.fee);
      expect(fees).toEqual([29, 20, 15, 12, 9]);
    });
  });

  describe('getLevelByNumber()', () => {
    it('sollte das korrekte Level für gültige Nummern zurückgeben', () => {
      expect(getLevelByNumber(1).name).toBe('Starter');
      expect(getLevelByNumber(2).name).toBe('Rising Star');
      expect(getLevelByNumber(3).name).toBe('Creator');
      expect(getLevelByNumber(4).name).toBe('Pro');
      expect(getLevelByNumber(5).name).toBe('Elite');
    });

    it('sollte Level 1 für ungültige Nummern zurückgeben', () => {
      expect(getLevelByNumber(0).level).toBe(1);
      expect(getLevelByNumber(6).level).toBe(1);
      expect(getLevelByNumber(-1).level).toBe(1);
      expect(getLevelByNumber(100).level).toBe(1);
    });

    it('sollte Level 1 für undefined/null zurückgeben', () => {
      expect(getLevelByNumber(undefined).level).toBe(1);
      expect(getLevelByNumber(null).level).toBe(1);
    });
  });

  describe('getLevelByEarnings()', () => {
    it('sollte Level 1 (Starter) für 0€ Einnahmen zurückgeben', () => {
      const level = getLevelByEarnings(0);
      expect(level.level).toBe(1);
      expect(level.name).toBe('Starter');
    });

    it('sollte Level 2 (Rising Star) für 100€+ zurückgeben', () => {
      expect(getLevelByEarnings(100).level).toBe(2);
      expect(getLevelByEarnings(150).level).toBe(2);
      expect(getLevelByEarnings(499.99).level).toBe(2);
    });

    it('sollte Level 3 (Creator) für 500€+ zurückgeben', () => {
      expect(getLevelByEarnings(500).level).toBe(3);
      expect(getLevelByEarnings(1000).level).toBe(3);
      expect(getLevelByEarnings(1999.99).level).toBe(3);
    });

    it('sollte Level 4 (Pro) für 2000€+ zurückgeben', () => {
      expect(getLevelByEarnings(2000).level).toBe(4);
      expect(getLevelByEarnings(3500).level).toBe(4);
      expect(getLevelByEarnings(4999.99).level).toBe(4);
    });

    it('sollte Level 5 (Elite) für 5000€+ zurückgeben', () => {
      expect(getLevelByEarnings(5000).level).toBe(5);
      expect(getLevelByEarnings(10000).level).toBe(5);
      expect(getLevelByEarnings(100000).level).toBe(5);
    });

    it('sollte an Grenzen korrekt funktionieren', () => {
      expect(getLevelByEarnings(99.99).level).toBe(1);
      expect(getLevelByEarnings(100).level).toBe(2);
      expect(getLevelByEarnings(499.99).level).toBe(2);
      expect(getLevelByEarnings(500).level).toBe(3);
    });
  });

  describe('getPlatformFee()', () => {
    it('sollte korrekte Gebühren pro Level zurückgeben', () => {
      expect(getPlatformFee(1)).toBe(29);
      expect(getPlatformFee(2)).toBe(20);
      expect(getPlatformFee(3)).toBe(15);
      expect(getPlatformFee(4)).toBe(12);
      expect(getPlatformFee(5)).toBe(9);
    });

    it('sollte 29% für ungültige Level zurückgeben (Level 1 Default)', () => {
      expect(getPlatformFee(0)).toBe(29);
      expect(getPlatformFee(6)).toBe(29);
      expect(getPlatformFee(-1)).toBe(29);
    });
  });

  describe('getNextLevel()', () => {
    it('sollte das nächste Level für Level 1-4 zurückgeben', () => {
      expect(getNextLevel(1).level).toBe(2);
      expect(getNextLevel(2).level).toBe(3);
      expect(getNextLevel(3).level).toBe(4);
      expect(getNextLevel(4).level).toBe(5);
    });

    it('sollte null für Level 5 zurückgeben (höchstes Level)', () => {
      expect(getNextLevel(5)).toBeNull();
    });

    it('sollte für ungültige Level-Nummern einen Fallback liefern', () => {
      // getNextLevel(0) sucht Level 0 -> findIndex gibt -1 -> -1 + 1 = 0 -> LEVELS[0] (Level 1)
      // Das ist ein Edge-Case: Level 0 existiert nicht, also wird LEVELS[0] zurückgegeben
      const result = getNextLevel(0);
      // Da Level 0 nicht gefunden wird, ist nextIndex = -1 + 1 = 0, also wird LEVELS[0] (Level 1) zurückgegeben
      expect(result.level).toBe(1);
    });
  });

  describe('calculateLevelProgress()', () => {
    describe('Level 1 → Level 2 (0€ - 100€)', () => {
      it('sollte 0% bei 0€ Einnahmen sein', () => {
        const progress = calculateLevelProgress(0, 1);
        expect(progress.progress).toBe(0);
        expect(progress.amountToNext).toBe(100);
      });

      it('sollte 50% bei 50€ Einnahmen sein', () => {
        const progress = calculateLevelProgress(50, 1);
        expect(progress.progress).toBe(50);
        expect(progress.amountToNext).toBe(50);
      });

      it('sollte 100% bei 100€ Einnahmen sein (aber noch Level 1)', () => {
        const progress = calculateLevelProgress(100, 1);
        expect(progress.progress).toBe(100);
        expect(progress.amountToNext).toBe(0);
      });
    });

    describe('Level 2 → Level 3 (100€ - 500€)', () => {
      it('sollte 0% bei 100€ (gerade Level 2 erreicht) sein', () => {
        const progress = calculateLevelProgress(100, 2);
        expect(progress.progress).toBe(0);
        expect(progress.amountToNext).toBe(400);
      });

      it('sollte 50% bei 300€ sein', () => {
        const progress = calculateLevelProgress(300, 2);
        expect(progress.progress).toBe(50);
        expect(progress.amountToNext).toBe(200);
      });
    });

    describe('Level 5 (Elite) - höchstes Level', () => {
      it('sollte immer 100% Progress haben (kein nächstes Level)', () => {
        const progress = calculateLevelProgress(5000, 5);
        expect(progress.progress).toBe(100);
        expect(progress.amountToNext).toBe(0);
      });

      it('sollte auch bei sehr hohen Einnahmen 100% haben', () => {
        const progress = calculateLevelProgress(100000, 5);
        expect(progress.progress).toBe(100);
        expect(progress.amountToNext).toBe(0);
      });
    });
  });

  describe('getAllLevels()', () => {
    it('sollte alle 5 Level zurückgeben', () => {
      const levels = getAllLevels();
      expect(levels).toHaveLength(5);
      expect(levels).toBe(LEVELS); // Gleiche Referenz
    });
  });
});

describe('Gebührenberechnung (Business Logic)', () => {

  // Helper: Berechnet Seller-Auszahlung nach Gebühren
  const calculateSellerAmount = (salePrice, levelNumber) => {
    const fee = getPlatformFee(levelNumber);
    const platformAmount = (salePrice * fee) / 100;
    return salePrice - platformAmount;
  };

  // Helper: Berechnet Affiliate-Provision (50% der Plattformgebühr)
  const calculateAffiliateCommission = (salePrice, levelNumber) => {
    const fee = getPlatformFee(levelNumber);
    const platformAmount = (salePrice * fee) / 100;
    return platformAmount * 0.5;
  };

  describe('Seller Auszahlung', () => {
    it('sollte korrekte Auszahlung für Level 1 berechnen (29% Gebühr)', () => {
      const seller = calculateSellerAmount(100, 1);
      expect(seller).toBe(71); // 100€ - 29€ = 71€
    });

    it('sollte korrekte Auszahlung für Level 5 berechnen (9% Gebühr)', () => {
      const seller = calculateSellerAmount(100, 5);
      expect(seller).toBe(91); // 100€ - 9€ = 91€
    });

    it('sollte bei 29,99€ Produkt korrekt rechnen', () => {
      const seller = calculateSellerAmount(29.99, 1);
      expect(seller).toBeCloseTo(21.29, 2); // 29.99 - 8.70 = 21.29
    });
  });

  describe('Affiliate Commission', () => {
    it('sollte 50% der Plattformgebühr als Provision berechnen', () => {
      const commission = calculateAffiliateCommission(100, 1);
      expect(commission).toBe(14.5); // 50% von 29€ = 14.50€
    });

    it('sollte niedrigere Provision bei höheren Levels haben', () => {
      const commissionL1 = calculateAffiliateCommission(100, 1);
      const commissionL5 = calculateAffiliateCommission(100, 5);

      expect(commissionL1).toBe(14.5);  // 50% von 29€
      expect(commissionL5).toBe(4.5);   // 50% von 9€
      expect(commissionL1).toBeGreaterThan(commissionL5);
    });
  });

  describe('Gesamt-Verteilung', () => {
    it('sollte bei 100€ Verkauf (Level 1) korrekt aufteilen', () => {
      const salePrice = 100;
      const platformFee = getPlatformFee(1);
      const platformAmount = (salePrice * platformFee) / 100;
      const sellerAmount = salePrice - platformAmount;
      const affiliateAmount = platformAmount * 0.5;

      expect(platformAmount).toBe(29);
      expect(sellerAmount).toBe(71);
      expect(affiliateAmount).toBe(14.5);

      // Bei Affiliate-Verkauf: Seller + Affiliate = Salepreis - Platform Profit
      // Platform behält 50% der Gebühr = 14.50€
    });

    it('sollte Summe = Verkaufspreis ergeben', () => {
      const salePrice = 100;
      const fee = getPlatformFee(1);
      const platformAmount = (salePrice * fee) / 100;
      const sellerAmount = salePrice - platformAmount;

      expect(sellerAmount + platformAmount).toBe(salePrice);
    });
  });
});
