import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Flow',
  slug: 'flow',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'flow',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
    bundleIdentifier: 'com.muhibullah.flow',
  },
  android: {
    package: 'com.muhibullah.flow',
    adaptiveIcon: {
      backgroundColor: '#F3F4F6',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'server',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    [
      'expo-router',
      // Native builds resolve relative `/api/*` fetches against this origin outside of dev.
      { origin: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8081' },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#F3F4F6',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
        dark: { backgroundColor: '#07090C' },
      },
    ],
    'expo-sqlite',
    'expo-secure-store',
    'expo-localization',
  ],
  owner: 'techknowworld',
  extra: {
    eas: { projectId: 'cf49078b-18d9-4178-a51d-1e30de7bf9d6' },
  },
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
