import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export type TextProps = RNTextProps & {
  variant?:
    'largeNumber' | 'display' | 'title' | 'headline' | 'body' | 'label' | 'callout' | 'caption';
  tone?: 'normal' | 'muted' | 'primary' | 'danger' | 'success' | 'onPrimary' | 'onPrimaryMuted';
  align?: 'left' | 'center' | 'right';
};

export function Text({
  variant = 'body',
  tone = 'normal',
  align = 'left',
  style,
  ...rest
}: TextProps) {
  styles.useVariants({ variant, tone });
  return <RNText {...rest} style={[styles.text, { textAlign: align }, style]} />;
}

const styles = StyleSheet.create((theme) => ({
  text: {
    variants: {
      variant: theme.typography,
      tone: {
        normal: { color: theme.colors.text },
        muted: { color: theme.colors.textMuted },
        primary: { color: theme.colors.primary },
        danger: { color: theme.colors.danger },
        success: { color: theme.colors.success },
        onPrimary: { color: theme.colors.onPrimary },
        onPrimaryMuted: { color: theme.colors.onPrimaryMuted },
      },
    },
  },
}));
