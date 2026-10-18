import type { AndroidSymbol, SFSymbol } from 'expo-symbols';
import { useUnistyles } from 'react-native-unistyles';

import { categoryColor, IconBadge } from '@/design-system';

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

/** Category glyph on a wash of its themed color. */
export function CategoryBadge({
  icon,
  color,
  size = 'md',
}: {
  icon: string;
  /** Stored category color; themed here. */
  color: string;
  size?: 'sm' | 'md';
}) {
  const { theme } = useUnistyles();
  const material = MATERIAL_ICONS[icon] ?? FALLBACK_MATERIAL_ICON;
  return (
    <IconBadge
      icon={{ ios: icon as SFSymbol, android: material, web: material }}
      color={categoryColor(theme, color)}
      size={size}
    />
  );
}
