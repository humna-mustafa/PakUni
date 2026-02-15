const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * SVG transformer setup:
 *   .svg files are handled by react-native-svg-transformer so you can
 *   `import Logo from './assets/images/pakuni-logo.svg'` and render
 *   <Logo width={80} height={80} /> as a React component.
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  maxWorkers: 2,
  transformer: {
    inlineRequires: true,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    // SVG is handled by the transformer — remove it from assetExts,
    // add it to sourceExts so Metro treats it as source code.
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
