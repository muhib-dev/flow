import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ProgressBar, Text } from '@/design-system';
import type { BudgetSummary } from '@/features/transactions/api/transactions-repo';
import { CategoryBadge } from '@/features/transactions/components/category-badge';
import { formatMoney } from '@/lib/format';

export const BudgetRow = memo(function BudgetRow({
  budget,
  onPress,
}: {
  budget: BudgetSummary;
  onPress: (categoryId: string) => void;
}) {
  const ratio = budget.limitCents > 0 ? budget.spentCents / budget.limitCents : 0;
  const remaining = budget.limitCents - budget.spentCents;
  const over = remaining < 0;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${budget.name}: ${formatMoney(budget.spentCents)} of ${formatMoney(budget.limitCents)}`}
      onPress={() => onPress(budget.categoryId)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <CategoryBadge icon={budget.icon} color={budget.color} />
      <View style={styles.body}>
        <View style={styles.labels}>
          <Text variant="label" numberOfLines={1} style={styles.name}>
            {budget.name}
          </Text>
          <Text variant="caption" tone="muted" style={styles.numbers}>
            {formatMoney(budget.spentCents)} / {formatMoney(budget.limitCents)}
          </Text>
        </View>
        <ProgressBar value={ratio} color={budget.color} />
        <Text variant="caption" tone={over ? 'danger' : 'muted'}>
          {over ? `Over by ${formatMoney(-remaining)}` : `${formatMoney(remaining)} left`}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    minHeight: theme.sizes.hitTarget,
    paddingVertical: theme.space.sm,
  },
  pressed: { opacity: 0.7 },
  body: { flex: 1, gap: theme.space.xs },
  labels: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.space.sm },
  name: { flexShrink: 1 },
  numbers: { fontVariant: ['tabular-nums'] },
}));
