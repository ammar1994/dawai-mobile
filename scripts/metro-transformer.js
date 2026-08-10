/**
 * Custom Metro transformer that skips React Native Codegen
 * for react-native-screens fabric source files.
 * These files use TypeScript patterns (? with WithDefault) that
 * RN 0.79 Codegen rejects, but they are not needed since
 * newArchEnabled=false (Old Architecture).
 */
const upstreamTransformer = require('@react-native/metro-babel-transformer');

const SCREENS_FABRIC_RE = /node_modules[\\/]react-native-screens[\\/]src[\\/]fabric[\\/].*NativeComponent\.ts$/;

module.exports.transform = function transform(params) {
  if (SCREENS_FABRIC_RE.test(params.filename)) {
    // Return empty module - these are only needed for New Architecture
    return upstreamTransformer.transform({
      ...params,
      src: '// codegen skipped for Old Architecture compatibility',
    });
  }
  return upstreamTransformer.transform(params);
};
