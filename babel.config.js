module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // keep this plugin last
      "react-native-reanimated/plugin",
    ],
  };
};
