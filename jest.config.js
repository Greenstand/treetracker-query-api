module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  testEnvironment: 'node',
  modulePaths: ['server/'],
  moduleNameMapper: {
    '@test/(.*)': ['<rootDir>/.jest/$1', '<rootDir>/__tests__/$1'],
  },
  globalSetup: '<rootDir>/.jest/globalSetup.ts',
  setupFilesAfterEnv: ['<rootDir>/.jest/setupFile.ts'],
  maxConcurrency: 1,
};
