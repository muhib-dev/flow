import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon, Text } from '@/design-system';

const ADD_ICON = { ios: 'plus', android: 'add', web: 'add' } as const;

/** Full-width bar docked above the tab bar; the safe area includes the native tab bar. */
export function AddExpenseButton({ onPress }: { onPress: () => void }) {
  const { theme } = useUnistyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.dock} pointerEvents="box-none">
      <View style={styles.bar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add expense"
          onPress={onPress}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Icon name={ADD_ICON} size={theme.sizes.iconControl} tone="onPrimary" />
          <Text variant="headline" tone="onPrimary">
            Add expense
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  bar: {
    paddingVertical: theme.space.md,
    paddingHorizontal: theme.space.lg,
    backgroundColor: theme.colors.background,
  },
  button: {
    height: theme.sizes.controlHeight,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space.sm,
  },
  pressed: { opacity: 0.85 },
}));
