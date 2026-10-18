import type { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon } from './icon';
import { PressableRow } from './pressable-row';
import { Text, type TextProps } from './text';

const CHEVRON_ICON = {
  ios: 'chevron.right',
  android: 'chevron_right',
  web: 'chevron_right',
} as const;

type ListRowProps = {
  label: string;
  /** Second line under the label. */
  subtitle?: string;
  /** Right-aligned value. */
  value?: string;
  valueTone?: TextProps['tone'];
  /** Label color for action rows ("Sync now", "Sign out"). */
  tone?: 'normal' | 'primary' | 'dangerText';
  /** Badge, icon or glyph drawn before the label. */
  leading?: ReactNode;
  /** Custom right-side content, drawn after `value`. */
  trailing?: ReactNode;
  onPress?: () => void;
  /** Defaults to on for pressable navigation rows. */
  chevron?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

/** Settings-style row. Stack inside a `ListGroup` for the rounded card and separators. */
export function ListRow({
  label,
  subtitle,
  value,
  valueTone = 'muted',
  tone = 'normal',
  leading,
  trailing,
  onPress,
  chevron = onPress != null && tone === 'normal',
  loading = false,
  accessibilityLabel,
  accessibilityHint,
}: ListRowProps) {
  const { theme } = useUnistyles();
  return (
    <PressableRow
      accessibilityLabel={accessibilityLabel ?? (value ? `${label}, ${value}` : label)}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy: loading, disabled: loading }}
      disabled={loading}
      onPress={onPress}
    >
      <View style={styles.inner}>
        {leading}
        <View style={styles.text}>
          <Text variant="body" tone={tone} weight={tone === 'normal' ? undefined : 'semibold'}>
            {label}
          </Text>
          {subtitle ? (
            <Text variant="caption" tone="muted">
              {subtitle}
            </Text>
          ) : null}
        </View>
        {value ? (
          <Text variant="callout" tone={valueTone} tabular style={styles.value} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {trailing}
        {loading ? <ActivityIndicator color={theme.colors.textMuted} /> : null}
        {chevron && !loading ? (
          <Icon name={CHEVRON_ICON} size={theme.sizes.iconSm} tone="subtle" />
        ) : null}
      </View>
    </PressableRow>
  );
}

const styles = StyleSheet.create((theme) => ({
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    minHeight: theme.sizes.listRowCompact,
    paddingVertical: theme.space.sm,
  },
  text: { flex: 1, minWidth: 0, gap: theme.space.xxs },
  value: { flexShrink: 1, maxWidth: '55%' },
}));
