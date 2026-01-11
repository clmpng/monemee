export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/src/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};
