import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, type StyleProp, type ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { categoryColor, Swatch, Text } from '@/design-system';
import type { Category } from '@/lib/db/schema';

/** Horizontally scrolling pill chips. With `allLabel`, a leading chip clears the selection. */
export function CategoryChips({
  categories,
  selectedId,
  onSelect,
  allLabel,
  onSelectAll,
  contentStyle,
}: {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  allLabel?: string;
  onSelectAll?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const { theme } = useUnistyles();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, contentStyle]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Category"
    >
      {allLabel && onSelectAll ? (
        <Chip label={allLabel} selected={selectedId == null} onPress={onSelectAll} />
      ) : null}
      {categories.map((c) => (
        <Chip
          key={c.id}
          label={c.name}
          color={categoryColor(theme, c.color)}
          selected={c.id === selectedId}
          onPress={() => onSelect(c.id)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({
  label,
  color,
  selected,
  onPress,
}: {
  label: string;
  color?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [styles.chip(selected), pressed && styles.pressed]}
    >
      {color ? <Swatch color={color} /> : null}
      <Text variant="callout" weight="semibold" style={selected && styles.selectedLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: { gap: theme.space.sm },
  chip: (selected: boolean) => ({
    minHeight: theme.sizes.hitTarget - theme.space.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    paddingHorizontal: theme.space.lg,
    borderRadius: theme.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: selected ? theme.colors.text : theme.colors.border,
    backgroundColor: selected ? theme.colors.text : theme.colors.surface,
  }),
  selectedLabel: { color: theme.colors.background },
  pressed: { opacity: theme.opacity.pressed },
}));
