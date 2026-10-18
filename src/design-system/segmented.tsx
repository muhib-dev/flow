import { SegmentedControl } from '@expo/ui/community/segmented-control';
import * as Haptics from 'expo-haptics';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/** Native segmented control (UISegmentedControl / Material) bound to a typed option list. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { theme } = useUnistyles();
  return (
    <SegmentedControl
      values={options.map((o) => o.label)}
      selectedIndex={Math.max(
        0,
        options.findIndex((o) => o.value === value),
      )}
      tintColor={theme.colors.primary}
      onChange={(e) => {
        const next = options[e.nativeEvent.selectedSegmentIndex];
        if (!next || next.value === value) return;
        void Haptics.selectionAsync();
        onChange(next.value);
      }}
      style={styles.control}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  control: { minHeight: theme.sizes.hitTarget - theme.space.sm },
}));
