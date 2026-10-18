const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  globalIgnores(['dist/*', 'drizzle/*', 'ios/*', 'android/*', '.expo/*']),
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['react-native/Libraries/*'], message: 'Use the Strict TypeScript API.' },
            {
              group: ['@react-native-async-storage/*', 'react-native-mmkv'],
              message: 'Use expo-sqlite/kv-store (see CLAUDE.md).',
            },
          ],
        },
      ],
    },
  },
]);
