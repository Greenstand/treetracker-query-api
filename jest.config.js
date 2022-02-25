module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  testEnvironment: 'node',
  modulePaths: ['server/'],
  moduleNameMapper: {
    '@test/(.*)': ['<rootDir>/.jest/$1', '<rootDir>/__tests__/$1'],
    '@mocks/(.*)': ['<rootDir>/docs/api/spec/examples/$1'],
  },
  globalSetup: '<rootDir>/.jest/globalSetup.ts',
  setupFilesAfterEnv: ['<rootDir>/.jest/setupFile.ts'],
  maxConcurrency: 1,
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
};
