import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon } from './icon';
import { Text, type TextProps } from './text';

const CHEVRON_ICON = {
  ios: 'chevron.right',
  android: 'chevron_right',
  web: 'chevron_right',
} as const;

type ListRowProps = {
  label: string;
  /** Right-aligned value. */
  value?: string;
  valueTone?: TextProps['tone'];
  /** Label color for action rows ("Sync now", "Sign out"). */
  tone?: 'normal' | 'primary' | 'dangerText';
  /** Swatch, icon or glyph drawn before the label. */
  leading?: ReactNode;
  onPress?: () => void;
  /** Defaults to on for pressable navigation rows. */
  chevron?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

/** Full-bleed hairline row. Place inside a `Section` so it can reach the screen edges. */
export function ListRow({
  label,
  value,
  valueTone = 'muted',
  tone = 'normal',
  leading,
  onPress,
  chevron = onPress != null && tone === 'normal',
  loading = false,
  accessibilityLabel,
  accessibilityHint,
}: ListRowProps) {
  const { theme } = useUnistyles();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel ?? (value ? `${label}, ${value}` : label)}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy: loading, disabled: loading }}
      disabled={!onPress || loading}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.inner}>
        {leading}
        <Text variant="body" tone={tone} style={styles.label}>
          {label}
        </Text>
        {value ? (
          <Text variant="callout" tone={valueTone} style={styles.value}>
            {value}
          </Text>
        ) : null}
        {loading ? <ActivityIndicator color={theme.colors.textMuted} /> : null}
        {chevron && !loading ? (
          <Icon name={CHEVRON_ICON} size={theme.sizes.iconSm} tone="muted" />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: { paddingHorizontal: theme.space.xl },
  pressed: { backgroundColor: theme.colors.surfaceMuted },
  inner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: theme.space.md,
    rowGap: theme.space.xs,
    minHeight: theme.sizes.hitTarget,
    paddingVertical: theme.space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  label: { flexShrink: 1 },
  value: { marginLeft: 'auto', fontVariant: ['tabular-nums'] },
}));
