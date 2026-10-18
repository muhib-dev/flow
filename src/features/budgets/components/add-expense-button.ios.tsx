import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/design-system';

const ADD_ICON = { ios: 'plus', android: 'add', web: 'add' } as const;

/** Floating full-width button docked above the tab bar; the safe area includes the tab bar. */
export function AddExpenseButton({ onPress }: { onPress: () => void }) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.dock} pointerEvents="box-none">
      <View style={styles.bar} pointerEvents="box-none">
        <View style={styles.shadow}>
          <Button label="Add expense" icon={ADD_ICON} onPress={onPress} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  bar: { paddingHorizontal: theme.space.gutter, paddingBottom: theme.space.md },
  shadow: { borderRadius: theme.radius.lg, boxShadow: theme.shadows.fab },
}));
