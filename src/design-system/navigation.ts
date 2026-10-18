import { Stack } from 'expo-router';
import type { ComponentProps } from 'react';
import { useUnistyles } from 'react-native-unistyles';

type ScreenOptions = NonNullable<ComponentProps<typeof Stack>['screenOptions']>;
export type StackScreenOptions = Exclude<ScreenOptions, (...args: never[]) => unknown>;

/** Shared native-stack header styling driven by theme tokens. */
export function useStackScreenOptions(): StackScreenOptions {
  const { theme } = useUnistyles();

  return {
    headerTintColor: theme.colors.primary,
    headerTitleStyle: {
      color: theme.colors.text,
      fontSize: theme.typography.headline.fontSize,
      fontWeight: theme.typography.headline.fontWeight,
    },
    headerLargeTitleStyle: {
      color: theme.colors.text,
      fontSize: theme.typography.display.fontSize,
      fontWeight: theme.typography.display.fontWeight,
    },
    headerLargeStyle: { backgroundColor: theme.colors.background },
    headerLargeTitleShadowVisible: false,
    headerStyle: { backgroundColor: theme.colors.background },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: theme.colors.background },
  };
}
