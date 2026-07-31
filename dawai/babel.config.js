module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      ['module-resolver', {
        root: ['./src'],
        alias: {
          '@': './src',
          '@api': './src/api',
          '@screens': './src/screens',
          '@components': './src/components',
          '@store': './src/store',
          '@constants': './src/constants',
          '@hooks': './src/hooks',
        }
      }]
    ],
  };
};
