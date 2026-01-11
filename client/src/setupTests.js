/**
 * Jest Test Setup für React
 *
 * Wird automatisch vor jedem Test ausgeführt.
 */

import '@testing-library/jest-dom';

// Mock für window.matchMedia (für responsive Komponenten)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock für window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock für IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = MockIntersectionObserver;

// Mock für ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = MockResizeObserver;

// Console Error Unterdrückung für erwartete Warnungen
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    // React Router Warnungen unterdrücken
    if (args[0]?.includes?.('React Router')) return;
    // Act() Warnungen unterdrücken (können in Tests auftreten)
    if (args[0]?.includes?.('act(...)')) return;
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
