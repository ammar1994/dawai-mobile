const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const config = {
  resolver: {
    blockList: [
      // Exclude duplicate dawai/ folder
      /dawai\/.*/,
    ],
  },
  transformer: {
    babelTransformerPath: require.resolve('./scripts/metro-transformer.js'),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
