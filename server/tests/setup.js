/**
 * Jest Test Setup
 * Konfiguriert die Test-Umgebung vor allen Tests
 */

// Environment Variables für Tests
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_NAME = process.env.DB_NAME || 'monemee_test';

// Mock für Console Logs (optional, kann auskommentiert werden)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };

// Globale Test-Utilities
global.testUtils = {
  // Generiert eine zufällige Test-ID
  generateTestId: () => `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

  // Wartet auf async Operationen
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock-User Daten
  mockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'testuser',
    level: 1,
    total_earnings: 0,
    created_at: new Date().toISOString(),
    ...overrides
  }),

  // Mock-Product Daten
  mockProduct: (overrides = {}) => ({
    id: 'test-product-id',
    title: 'Test Product',
    description: 'A test product description',
    price: 29.99,
    seller_id: 'test-user-id',
    status: 'active',
    created_at: new Date().toISOString(),
    ...overrides
  })
};

// Jest-Erweiterungen
expect.extend({
  // Custom Matcher: prüft ob ein Wert eine gültige UUID ist
  toBeValidUUID(received) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    return {
      pass,
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid UUID`
    };
  },

  // Custom Matcher: prüft ob ein Wert ein gültiger Euro-Betrag ist
  toBeValidEuroAmount(received) {
    const pass = typeof received === 'number' && received >= 0 && Number.isFinite(received);
    return {
      pass,
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid Euro amount`
    };
  }
});

// Cleanup nach allen Tests
afterAll(async () => {
  // Schließe alle offenen Handles (DB-Connections, etc.)
  await new Promise(resolve => setTimeout(resolve, 100));
});
