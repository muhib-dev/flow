import type { AndroidSymbol, SFSymbol } from 'expo-symbols';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon } from '@/design-system';

/** Categories store SF Symbol names; these are their Material equivalents. */
const MATERIAL_ICONS: Record<string, AndroidSymbol> = {
  'fork.knife': 'restaurant',
  'car.fill': 'directions_car',
  'bag.fill': 'shopping_bag',
  'doc.text.fill': 'receipt_long',
  'gamecontroller.fill': 'sports_esports',
  'ellipsis.circle.fill': 'more_horiz',
};
const FALLBACK_MATERIAL_ICON: AndroidSymbol = 'category';

/** Hex alpha appended to the category color for the pastel background. */
const TINT_ALPHA = '24';

export function CategoryBadge({ icon, color }: { icon: string; color: string }) {
  const { theme } = useUnistyles();
  const material = MATERIAL_ICONS[icon] ?? FALLBACK_MATERIAL_ICON;
  return (
    <View style={styles.badge(`${color}${TINT_ALPHA}`)}>
      <Icon
        name={{ ios: icon as SFSymbol, android: material, web: material }}
        size={theme.sizes.iconControl}
        color={color}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  badge: (background: string) => ({
    width: theme.sizes.categoryBadge,
    height: theme.sizes.categoryBadge,
    borderRadius: theme.radius.md,
    backgroundColor: background,
    alignItems: 'center',
    justifyContent: 'center',
  }),
}));
