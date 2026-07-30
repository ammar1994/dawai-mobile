module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@screens':    './src/screens',
          '@components': './src/components',
          '@navigation': './src/navigation',
          '@services':   './src/services',
          '@hooks':      './src/hooks',
          '@store':      './src/store',
          '@theme':      './src/theme',
          '@types':      './src/types',
          '@assets':     './src/assets',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
