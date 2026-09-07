module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  coverageProvider: 'v8',
  // Automatically reset module registry for each test to isolate data stores
  resetModules: true,
  testMatch: ['**/test/**/*.test.js'],
};
