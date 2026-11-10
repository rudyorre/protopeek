const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/app/utils/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/components/ui/(.*)$': '<rootDir>/app/components/ui/$1',
    '^@/lib/(.*)$': '<rootDir>/app/lib/$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transformIgnorePatterns: ['/node_modules/(?!(@radix-ui|@babel)/)'],
};

module.exports = createJestConfig(customJestConfig);
