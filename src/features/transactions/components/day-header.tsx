import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/design-system';
import { formatDayLabel, formatMoney } from '@/lib/format';

/** "Today ……… $60.68" above a day's transactions. */
export function DayHeader({ day, totalCents }: { day: number; totalCents: number }) {
  return (
    <View style={styles.header} accessibilityRole="header">
      <Text variant="caption" tone="muted" style={styles.label}>
        {formatDayLabel(day)}
      </Text>
      <Text variant="caption" tone="muted" style={styles.total}>
        {formatMoney(totalCents)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.space.lg,
    paddingBottom: theme.space.xs,
  },
  label: { fontWeight: theme.typography.label.fontWeight },
  total: { fontVariant: ['tabular-nums'] },
}));
