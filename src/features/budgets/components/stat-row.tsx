import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/design-system';

/** Hairline-banded key/value columns that wrap at large text sizes. */
export function StatRow({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <View style={styles.row}>
      {stats.map(({ label, value }) => (
        <View key={label} style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
          <Text variant="caption" tone="muted">
            {label}
          </Text>
          <Text variant="label" style={styles.value}>
            {value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  stat: {
    flexGrow: 1,
    flexBasis: theme.sizes.statMinWidth,
    gap: theme.space.xxs,
    paddingVertical: theme.space.md,
  },
  value: { fontVariant: ['tabular-nums'] },
}));
