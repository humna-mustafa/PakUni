module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-gesture-handler|react-native-safe-area-context|react-native-screens|react-native-url-polyfill|react-native-view-shot|react-native-fs|react-native-share|@supabase|@react-native-google-signin|react-native-device-info|react-native-reanimated|react-native-image-picker|react-native-linear-gradient|react-native-vector-icons)/)',
  ],
  moduleNameMapper: {
    '^react-native-view-shot$': '<rootDir>/__mocks__/react-native-view-shot.js',
    '^react-native-fs$': '<rootDir>/__mocks__/react-native-fs.js',
    '^react-native-share$': '<rootDir>/__mocks__/react-native-share.js',
  },
};
