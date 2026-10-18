import { memo } from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { categoryColor, PressableRow, ProgressBar, Text } from '@/design-system';
import { CategoryBadge } from '@/features/transactions/components/category-badge';
import { formatMoneyShort } from '@/lib/format';

import type { RankedBudget } from '../api/pace';

export const BudgetRow = memo(function BudgetRow({
  budget,
  calendarRatio,
  onPress,
}: {
  budget: RankedBudget;
  /** day ÷ daysInMonth, drawn as the pace tick. */
  calendarRatio: number;
  onPress: (categoryId: string) => void;
}) {
  const { theme } = useUnistyles();
  const over = budget.pace === 'over';
  const above = budget.pace === 'above';
  const remaining = budget.limitCents - budget.spentCents;
  const right = over
    ? `${formatMoneyShort(-remaining)} over`
    : `${formatMoneyShort(remaining)} left`;
  const sub = `${formatMoneyShort(budget.spentCents)} of ${formatMoneyShort(budget.limitCents)}`;

  return (
    <PressableRow
      accessibilityLabel={`${budget.name}: ${sub}, ${right}${above ? ', above pace' : ''}`}
      onPress={() => onPress(budget.categoryId)}
      style={styles.row}
    >
      <CategoryBadge icon={budget.icon} color={budget.color} />
      <View style={styles.body}>
        <View style={styles.line}>
          <Text variant="body" numberOfLines={1} style={styles.name}>
            {budget.name}
          </Text>
          <Text variant="label" tone={over ? 'dangerText' : 'normal'} tabular>
            {right}
          </Text>
        </View>
        <ProgressBar
          value={budget.ratio}
          color={categoryColor(theme, budget.color)}
          size="sm"
          marker={calendarRatio}
          delay={theme.motion.barDelayMs}
        />
        <View style={styles.line}>
          <Text variant="caption" tone="muted" tabular>
            {sub}
          </Text>
          {above ? (
            <Text variant="caption" weight="semibold" tone="warningText">
              Above pace
            </Text>
          ) : null}
        </View>
      </View>
    </PressableRow>
  );
});

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    paddingVertical: theme.space.md,
  },
  body: { flex: 1, minWidth: 0, gap: theme.space.sm },
  line: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: theme.space.md,
  },
  name: { flexShrink: 1 },
}));
