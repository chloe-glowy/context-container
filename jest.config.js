/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  modulePaths: ['<rootDir>', '<rootDir>/node_modules'],
  preset: 'ts-jest',
  rootDir: '',
  testEnvironment: 'node',
  verbose: true,
};
