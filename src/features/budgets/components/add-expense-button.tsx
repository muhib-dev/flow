import { Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon, Text } from '@/design-system';

const ADD_ICON = { ios: 'plus', android: 'add', web: 'add' } as const;

/** Material extended FAB. Native tabs already inset Android content above the nav and tab bars. */
export function AddExpenseButton({ onPress }: { onPress: () => void }) {
  const { theme } = useUnistyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add expense"
      onPress={onPress}
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
    >
      <Icon name={ADD_ICON} size={theme.sizes.iconMd} tone="onPrimary" />
      <Text variant="label" tone="onPrimary">
        Add expense
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  fab: {
    position: 'absolute',
    right: theme.space.lg,
    bottom: theme.space.lg,
    height: theme.sizes.fabHeight,
    paddingLeft: theme.space.lg,
    paddingRight: theme.space.xl - theme.space.xs,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    boxShadow: theme.shadows.fab,
  },
  pressed: { opacity: 0.85 },
}));
