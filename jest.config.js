export default {
    // Use Node environment for testing
    testEnvironment: 'node',

    // Support ES modules
    transform: {},
    extensionsToTreatAsEsm: ['.js'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },

    // Test file patterns
    testMatch: [
        '**/tests/**/*.test.js',
        '**/__tests__/**/*.js',
    ],

    // Coverage configuration
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/app.js',
        '!src/bot/**',
        '!src/commands/**',
        '!src/config/**',
        '!src/routes/router.js',
        '!src/zdebug.js',
    ],

    // Coverage thresholds
    coverageThresholds: {
        global: {
            branches: 60,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    // Timeout for tests (useful for DB operations)
    testTimeout: 10000,

    // Clear mocks between tests
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,

    // Verbose output
    verbose: true,
};
