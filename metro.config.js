const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  resolver: {
    // استبعاد ملفات fabric من react-native-screens لتجنب مشاكل codegen
    blockList: [
      /node_modules\/react-native-screens\/src\/fabric\/.*/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
