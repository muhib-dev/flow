import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon, type IconName } from './icon';
import { withAlpha } from './theme';

const TINT_ALPHA = 0.14;

/** Rounded-square glyph tile. `tint` washes the color behind the glyph; `solid` fills it. */
export function IconBadge({
  icon,
  color,
  size = 'md',
  variant = 'tint',
}: {
  icon: IconName;
  /** Defaults to the theme primary. */
  color?: string;
  size?: 'sm' | 'md';
  variant?: 'tint' | 'solid';
}) {
  const { theme } = useUnistyles();
  const tint = color ?? theme.colors.primary;
  const solid = variant === 'solid';
  return (
    <View
      style={styles.badge(size, solid ? tint : withAlpha(tint, TINT_ALPHA))}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Icon
        name={icon}
        size={size === 'sm' ? theme.sizes.iconSm : theme.sizes.iconControl}
        color={solid ? theme.colors.onPrimary : tint}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  badge: (size: 'sm' | 'md', background: string) => ({
    width: size === 'sm' ? theme.sizes.iconBadgeSm : theme.sizes.categoryBadge,
    height: size === 'sm' ? theme.sizes.iconBadgeSm : theme.sizes.categoryBadge,
    borderRadius: size === 'sm' ? theme.radius.sm : theme.radius.md,
    borderCurve: 'continuous',
    backgroundColor: background,
    alignItems: 'center',
    justifyContent: 'center',
  }),
}));
