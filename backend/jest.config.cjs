module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/database/migrate.js'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  moduleFileExtensions: ['js', 'json'],
  testTimeout: 10000,
  verbose: true
};
