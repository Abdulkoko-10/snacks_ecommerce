// jest.config.js
const nextJest = require('next/jest')

// Providing the path to your Next.js app to load next.config.js and .env files in your test environment
const createJestConfig = nextJest({
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    // https://jestjs.io/docs/webpack#mocking-css-modules
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',

    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',

    // Handle image imports
    // https://jestjs.io/docs/webpack#handling-static-assets
    '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i': `<rootDir>/__mocks__/fileMock.js`,
    
    // Handle module aliases (if you have them in your jsconfig.json or tsconfig.json)
    // Example: '^@/components/(.*)$': '<rootDir>/components/$1',

    // Mock Clerk for server-side and client-side testing
    '^@clerk/nextjs/server$': '<rootDir>/__mocks__/@clerk/nextjs/server.js',
    '^@clerk/nextjs$': '<rootDir>/__mocks__/@clerk/nextjs/client.js',
  },
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Already included above
  
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],
  
  // If you're using SWC, you might not need to configure Babel separately.
  // transform: {
  //   '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  // },

  // This is the crucial part:
  // By default, jest ignores node_modules. We need to tell it to *not* ignore swiper and its dependencies.
  transformIgnorePatterns: [
    '/node_modules/(?!swiper|ssr-window|dom7).+\\.js$'
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
