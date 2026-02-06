/**
 * Jest Configuration for PakUni
 * Comprehensive testing setup for React Native 0.83.1
 */

module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-linear-gradient|react-native-safe-area-context|react-native-screens|react-native-gesture-handler|react-native-vector-icons|react-native-fast-image|react-native-config|react-native-haptic-feedback|react-native-device-info|react-native-mmkv|@react-native-async-storage|@react-native-community|@react-native-google-signin|@shopify/flash-list|@supabase|react-native-url-polyfill|react-native-image-picker|lottie-react-native)/)',
  ],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/android/',
    '<rootDir>/ios/',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: '__tests__/coverage',
  testTimeout: 15000,
};
