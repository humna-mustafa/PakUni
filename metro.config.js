const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  server: {
    port: 8081,
    // Allow connections from physical devices over WiFi
    // Use reliable-metro-server.ps1 which binds to 0.0.0.0 for device access
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // Add CORS headers for device access
        res.setHeader('Access-Control-Allow-Origin', '*');
        return middleware(req, res, next);
      };
    },
  },
  // Watchman settings for reliability
  watchFolders: [],
  resolver: {
    // Improve resolution stability
    nodeModulesPaths: [],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
