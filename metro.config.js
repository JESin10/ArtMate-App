const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);

// config.resolver.extraNodeModules = {
//   stream: require.resolve("stream-browserify"),
//   timers: require.resolve("timers-browserify"),
//   crypto: require.resolve("react-native-crypto"),
// };

defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);
defaultConfig.resolver.sourceExts = [
  ...defaultConfig.resolver.sourceExts,
  "svg",
];

module.exports = defaultConfig;
