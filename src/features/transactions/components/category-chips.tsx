import { Pressable, ScrollView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Swatch, Text } from '@/design-system';
import type { Category } from '@/lib/db/schema';

/** Simple chip picker. Phase 3 swaps it for @expo/ui Menu (iOS) / BottomSheet (Android). */
export function CategoryChips({
  categories,
  selectedId,
  onSelect,
}: {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="radiogroup"
      accessibilityLabel="Category"
    >
      {categories.map((c) => {
        const selected = c.id === selectedId;
        return (
          <Pressable
            key={c.id}
            accessibilityRole="radio"
            accessibilityLabel={c.name}
            accessibilityState={{ selected }}
            onPress={() => onSelect(c.id)}
            style={({ pressed }) => [styles.chip(selected), pressed && styles.pressed]}
          >
            <Swatch color={c.color} />
            <Text variant={selected ? 'label' : 'callout'}>{c.name}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: { gap: theme.space.sm },
  chip: (selected: boolean) => ({
    minHeight: theme.sizes.hitTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    paddingHorizontal: theme.space.lg,
    borderRadius: theme.radius.md,
    borderWidth: selected ? 1 : StyleSheet.hairlineWidth,
    borderColor: selected ? theme.colors.primary : theme.colors.border,
    backgroundColor: selected ? theme.colors.primaryMuted : theme.colors.surface,
  }),
  pressed: { opacity: 0.7 },
}));
