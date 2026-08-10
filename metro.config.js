const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  resolver: {
    blockList: [
      // Exclude duplicate dawai/ folder
      /dawai\/.*/,
      // Exclude react-native-screens raw TypeScript fabric sources
      // (use compiled lib/ instead to avoid Codegen parser errors)
      /node_modules\/react-native-screens\/src\/fabric\/.*/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
