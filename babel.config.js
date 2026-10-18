module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Unistyles must run before the React Compiler (added by babel-preset-expo).
      ['react-native-unistyles/plugin', { root: 'src' }],
      // Drizzle migrations are bundled as raw .sql strings.
      ['inline-import', { extensions: ['.sql'] }],
    ],
  };
};
