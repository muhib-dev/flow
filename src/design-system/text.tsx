import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { lightTheme } from './theme';

type Theme = typeof lightTheme;

export type TextProps = RNTextProps & {
  variant?: keyof Theme['typography'];
  tone?:
    | 'normal'
    | 'muted'
    | 'subtle'
    | 'primary'
    | 'danger'
    | 'dangerText'
    | 'warningText'
    | 'success'
    | 'successText'
    | 'onPrimary'
    | 'onPrimaryMuted'
    | 'onInk'
    | 'onInkMuted';
  align?: 'left' | 'center' | 'right';
  /** Overrides the variant's weight. */
  weight?: keyof Theme['weights'];
  /** Fixed-width digits so amounts line up in columns and don't jitter while animating. */
  tabular?: boolean;
};

export function Text({
  variant = 'body',
  tone = 'normal',
  align = 'left',
  weight,
  tabular = false,
  style,
  ...rest
}: TextProps) {
  styles.useVariants({ variant, tone });
  return (
    <RNText
      {...rest}
      style={[
        styles.text,
        { textAlign: align },
        weight && styles.weight(weight),
        tabular && styles.tabular,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  text: {
    variants: {
      variant: theme.typography,
      tone: {
        normal: { color: theme.colors.text },
        muted: { color: theme.colors.textMuted },
        subtle: { color: theme.colors.textSubtle },
        primary: { color: theme.colors.primary },
        danger: { color: theme.colors.danger },
        dangerText: { color: theme.colors.dangerText },
        warningText: { color: theme.colors.warningText },
        success: { color: theme.colors.success },
        successText: { color: theme.colors.successText },
        onPrimary: { color: theme.colors.onPrimary },
        onPrimaryMuted: { color: theme.colors.onPrimaryMuted },
        onInk: { color: theme.colors.onInk },
        onInkMuted: { color: theme.colors.onInkMuted },
      },
    },
  },
  weight: (weight: keyof Theme['weights']) => ({ fontWeight: theme.weights[weight] }),
  tabular: { fontVariant: ['tabular-nums'] },
}));
