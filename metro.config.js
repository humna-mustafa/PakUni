const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  server: {
    port: 8081,
    // Note: host: '0.0.0.0' should be set via CLI argument --host
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
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
    // Exclude Node.js-only packages from React Native bundle.
    // We use a broad regex to ensure any part of the path matching 'libsql' is ignored.
    // Try both property names for maximum compatibility across Metro versions.
    blockList: [/.*@libsql.*/, /.*libsql.*/],
    blacklistRE: /.*@libsql.*/,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
