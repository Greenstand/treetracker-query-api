/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: '<rootDir>/.jest/globalSetup.ts',
  modulePaths: ['server/'],
  maxConcurrency: 1,
  forceExit: true,
}
