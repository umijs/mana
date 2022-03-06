const { defaults } = require('jest-config');

module.exports = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  verbose: true,
  preset: 'ts-jest/presets/default-esm',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__test__/.*|(\\.|/)(test|spec))\\.tsx?$',
  collectCoverageFrom: [
    '**/packages/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/lib/**',
    '!**/dist/**',
    '!**/es/**',
    '!**/examples/**',
  ],
  coveragePathIgnorePatterns: ['/dist/', '/node_modules/', '.umi'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
      useESM: true,
    },
  },
};
