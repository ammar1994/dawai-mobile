module.exports = {
  project: {
    android: {},
    ios: {},
  },
  dependencies: {
    // Disable packages not installed or causing issues
    'react-native-maps':         { platforms: { android: null, ios: null } },
    'react-native-splash-screen':{ platforms: { android: null, ios: null } },
    'react-native-reanimated':   { platforms: { android: null, ios: null } },
    'react-native-mmkv':         { platforms: { android: null, ios: null } },
    'react-native-fast-image':   { platforms: { android: null, ios: null } },
  },
};
