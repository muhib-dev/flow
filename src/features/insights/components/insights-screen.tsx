import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import {
  EmptyState,
  ErrorState,
  LoadingState,
  ProgressBar,
  Screen,
  Section,
  Swatch,
  Text,
} from '@/design-system';
import { useMonthSummary } from '@/features/budgets/hooks/use-month-summary';
import type { BudgetSummary } from '@/features/transactions/api/transactions-repo';
import { currentMonth, formatMoney, formatMonthName } from '@/lib/format';

const ENTER_MS = 400;
const ENTER_STAGGER_MS = 90;
const BAR_DELAY_MS = 150;

const openCategory = (id: string) => router.push({ pathname: '/category/[id]', params: { id } });

/** Where the month's money went, largest category first. */
export function InsightsScreen() {
  const { theme } = useUnistyles();
  const month = currentMonth();
  const { data, isPending, isError, error, refetch } = useMonthSummary(month);

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState message={error.message} onRetry={() => void refetch()} />;

  const total = data.reduce((sum, b) => sum + b.spentCents, 0);
  if (total === 0) {
    return (
      <EmptyState
        title="Nothing to analyse yet"
        message={`Insights for ${formatMonthName(month)} appear once you log expenses.`}
      />
    );
  }

  const ranked = data.filter((b) => b.spentCents > 0).sort((a, b) => b.spentCents - a.spentCents);
  const top = ranked[0];
  const entering = (i: number) =>
    FadeInDown.duration(ENTER_MS)
      .delay(i * ENTER_STAGGER_MS)
      .withInitialValues({ opacity: 0, transform: [{ translateY: theme.space.sm }] });

  return (
    <Screen scroll>
      <Animated.View entering={entering(0)}>
        <Text variant="callout" tone="muted">
          Spent in {formatMonthName(month)}
        </Text>
        <View style={styles.heroValue}>
          <Text variant="largeNumber" adjustsFontSizeToFit numberOfLines={1}>
            {formatMoney(total)}
          </Text>
          <Text variant="callout" tone="muted">
            across {ranked.length} {ranked.length === 1 ? 'category' : 'categories'}
          </Text>
        </View>
        <Text variant="callout" tone="muted" style={styles.lead}>
          <Text variant="label">{top.name}</Text> is {share(top.spentCents, total)}% of your
          spending.
        </Text>

        <ShareBar budgets={ranked} total={total} />
      </Animated.View>

      <Animated.View entering={entering(1)} style={styles.section}>
        <Section title="By category" detail={`${ranked.length} with spending`}>
          {ranked.map((b) => (
            <ShareRow key={b.categoryId} budget={b} total={total} />
          ))}
        </Section>
      </Animated.View>
    </Screen>
  );
}

const share = (part: number, total: number) => Math.round((part / total) * 100);

/** Every category's slice of the month in one 8pt pill. */
function ShareBar({ budgets, total }: { budgets: BudgetSummary[]; total: number }) {
  return (
    <View
      style={styles.shareTrack}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {budgets.map((b) => (
        <View key={b.categoryId} style={styles.shareSegment(b.color, b.spentCents / total)} />
      ))}
    </View>
  );
}

const ShareRow = memo(function ShareRow({
  budget,
  total,
}: {
  budget: BudgetSummary;
  total: number;
}) {
  const pct = share(budget.spentCents, total);
  const amount = formatMoney(budget.spentCents);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${budget.name}: ${amount}, ${pct}% of spending`}
      onPress={() => openCategory(budget.categoryId)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.rowInner}>
        <View style={styles.rowLine}>
          <View style={styles.rowName}>
            <Swatch color={budget.color} />
            <Text variant="body">{budget.name}</Text>
          </View>
          <Text variant="label" style={[styles.rowAmount, styles.tabular]}>
            {amount}
          </Text>
        </View>
        <ProgressBar
          value={budget.spentCents / total}
          color={budget.color}
          size="sm"
          delay={BAR_DELAY_MS}
        />
        <Text variant="caption" tone="muted" style={styles.tabular}>
          {pct}% of spending
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create((theme) => ({
  heroValue: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: theme.space.sm,
    marginTop: theme.space.xs,
  },
  lead: { marginTop: theme.space.sm },
  shareTrack: {
    flexDirection: 'row',
    height: theme.sizes.progressHeight,
    marginTop: theme.space.xxl,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
    gap: theme.sizes.tick,
    backgroundColor: theme.colors.surfaceMuted,
  },
  shareSegment: (color: string, ratio: number) => ({ flex: ratio, backgroundColor: color }),
  section: { marginTop: theme.space.xxxl },
  row: { paddingHorizontal: theme.space.xl },
  pressed: { backgroundColor: theme.colors.surfaceMuted },
  rowInner: {
    gap: theme.space.sm,
    paddingVertical: theme.space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  rowLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    columnGap: theme.space.md,
    rowGap: theme.space.xs,
  },
  rowName: { flexDirection: 'row', alignItems: 'center', gap: theme.space.sm },
  rowAmount: { marginLeft: 'auto' },
  tabular: { fontVariant: ['tabular-nums'] },
}));
