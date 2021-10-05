/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

// TODO: The browserify stuff can probably be removed as it is a relic of choosing a XMPP library
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    extraNodeModules: {
      ...require("node-libs-react-native"),
      vm: require.resolve("vm-browserify")
    },
    sourceExts: ['jsx', 'js', 'ts', 'tsx'],
  },
};
