// module.exports = {
// //   preset: 'ts-jest',
//   testEnvironment: 'jsdom',
//   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
//   moduleNameMapper: {
//     '^@/(.*)$': '<rootDir>/$1'
//   },
//   transform: {
//     '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
//   },
//   setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
//   testMatch: [
//     '**/*.test.ts', 
//     '**/*.test.tsx'
//   ],
//   testPathIgnorePatterns: ['/node_modules/', '/.next/'],
//   transformIgnorePatterns: [
//     '/node_modules/(?!(@radix-ui|@babel|@hookform)/)'
//   ]
// };

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // Handle module aliases (if you configured some in tsconfig.json or next.config.js)
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/*.test.ts',
    '**/*.test.tsx'
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(@radix-ui|@babel|@hookform)/)'
  ]
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);