import { Pressable, ScrollView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/design-system';
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
            style={styles.chip(selected, c.color)}
          >
            <Text variant="callout" tone={selected ? 'onPrimary' : 'normal'}>
              {c.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: { gap: theme.space.sm },
  chip: (selected: boolean, color: string) => ({
    minHeight: theme.sizes.hitTarget,
    justifyContent: 'center',
    paddingHorizontal: theme.space.lg,
    borderRadius: theme.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: selected ? color : theme.colors.border,
    backgroundColor: selected ? color : theme.colors.surface,
  }),
}));
