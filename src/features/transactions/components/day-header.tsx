import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/design-system';
import { formatDayLabel, formatMoney } from '@/lib/format';

/** "TODAY ……… $60.68" above a day's card of transactions. */
export function DayHeader({ day, totalCents }: { day: number; totalCents: number }) {
  return (
    <View style={styles.header} accessibilityRole="header">
      <Text variant="overline" tone="muted">
        {formatDayLabel(day)}
      </Text>
      <Text variant="caption" weight="semibold" tone="muted" tabular>
        {formatMoney(totalCents)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: theme.space.xs,
    paddingTop: theme.space.xl,
    paddingBottom: theme.space.sm,
  },
}));
