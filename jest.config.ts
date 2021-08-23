import type { Config } from '@jest/types';

export default {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  preset: 'ts-jest',
  testMatch: ['**/tests/**/*.test.ts'],
} as Config.InitialOptions;
