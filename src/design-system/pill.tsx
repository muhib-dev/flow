import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon, type IconName } from './icon';
import { Text } from './text';

export type PillTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

const TEXT_TONE = {
  neutral: 'muted',
  primary: 'primary',
  success: 'successText',
  warning: 'warningText',
  danger: 'dangerText',
} as const;

/** Small status capsule: optional glyph + caption-weight label on a tinted fill. */
export function Pill({
  label,
  tone = 'neutral',
  icon,
  onInk = false,
}: {
  label: string;
  tone?: PillTone;
  icon?: IconName;
  /** On the deep `ink` card: glass fill and light label; only the glyph carries the tone. */
  onInk?: boolean;
}) {
  const { theme } = useUnistyles();
  styles.useVariants({ tone: onInk ? 'ink' : tone });
  const inkGlyph = {
    neutral: theme.colors.onInkMuted,
    primary: theme.colors.inkAccent,
    success: theme.colors.inkAccent,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
  }[tone];
  return (
    <View style={styles.pill}>
      {icon ? (
        <Icon
          name={icon}
          size={theme.sizes.iconXs}
          tone={TEXT_TONE[tone]}
          color={onInk ? inkGlyph : undefined}
        />
      ) : null}
      <Text
        variant="caption"
        weight="semibold"
        tone={onInk ? 'onInk' : TEXT_TONE[tone]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.xs,
    paddingHorizontal: theme.space.sm,
    paddingVertical: theme.space.xxs,
    borderRadius: theme.radius.pill,
    variants: {
      tone: {
        neutral: { backgroundColor: theme.colors.surfaceMuted },
        primary: { backgroundColor: theme.colors.primaryMuted },
        success: { backgroundColor: theme.colors.successMuted },
        warning: { backgroundColor: theme.colors.warningMuted },
        danger: { backgroundColor: theme.colors.dangerMuted },
        ink: { backgroundColor: theme.colors.inkTrack },
      },
    },
  },
}));
