/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  testEnvironment: 'node',
  globalSetup: '<rootDir>/.jest/globalSetup.ts',
  modulePaths: ['server/'],
  maxConcurrency: 1,
  forceExit: true,
};
