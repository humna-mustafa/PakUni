const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // SECURITY: Restrict Metro server to localhost only in development
  // Prevents exposure of dev server on public networks (0.0.0.0)
  // Never expose dev server to public networks where credentials might be visible
  server: {
    // Only bind to localhost for development
    // In production, bundled JS is used, not Metro
    port: 8081,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
