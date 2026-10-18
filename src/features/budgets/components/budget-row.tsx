import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ProgressBar, Text } from '@/design-system';
import { formatMoneyShort } from '@/lib/format';

import type { RankedBudget } from '../api/pace';

const BAR_DELAY_MS = 150;

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
  const over = budget.pace === 'over';
  const above = budget.pace === 'above';
  const remaining = budget.limitCents - budget.spentCents;
  const right = over
    ? `Over by ${formatMoneyShort(-remaining)}`
    : `${formatMoneyShort(remaining)} left`;
  const sub = `${formatMoneyShort(budget.spentCents)} of ${formatMoneyShort(budget.limitCents)}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${budget.name}: ${sub}, ${right}${above ? ', above pace' : ''}`}
      onPress={() => onPress(budget.categoryId)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.inner}>
        <View style={styles.line}>
          <Text variant="body">{budget.name}</Text>
          <Text
            variant="label"
            tone={over ? 'dangerText' : 'normal'}
            style={[styles.right, styles.tabular]}
          >
            {right}
          </Text>
        </View>
        <ProgressBar
          value={budget.ratio}
          color={budget.color}
          size="sm"
          marker={calendarRatio}
          delay={BAR_DELAY_MS}
        />
        <View style={styles.subLine}>
          <Text variant="caption" tone="muted" style={styles.tabular}>
            {sub}
          </Text>
          {above ? (
            <Text variant="caption" tone="warningText" style={styles.flag}>
              · Above pace
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create((theme) => ({
  // Full-bleed: the parent cancels the screen gutter so the press state reaches the edges.
  row: { paddingHorizontal: theme.space.xl },
  pressed: { backgroundColor: theme.colors.surfaceMuted },
  inner: {
    gap: theme.space.sm,
    paddingVertical: theme.space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  line: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    columnGap: theme.space.md,
    rowGap: theme.space.xs,
  },
  subLine: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.xs },
  right: { marginLeft: 'auto' },
  flag: { fontWeight: theme.typography.label.fontWeight },
  tabular: { fontVariant: ['tabular-nums'] },
}));
