import { router } from 'expo-router';
import { Fragment, memo, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import {
  Card,
  categoryColor,
  EmptyState,
  ErrorState,
  Icon,
  ListGroup,
  LoadingState,
  Pill,
  PressableRow,
  ProgressBar,
  Screen,
  Section,
  Text,
  toast,
  useEntering,
} from '@/design-system';
import { useMonthSummary } from '@/features/budgets/hooks/use-month-summary';
import { useCurrencyKey } from '@/features/settings/store/preferences-store';
import { syncNow } from '@/features/transactions/api/sync';
import type { BudgetSummary } from '@/features/transactions/api/transactions-repo';
import { CategoryBadge } from '@/features/transactions/components/category-badge';
import { MonthMenu } from '@/features/transactions/components/month-menu';
import { currentMonth, formatMoney, formatMonth, formatMonthName, shiftMonth } from '@/lib/format';

import { averagePerDay } from '../api/daily-spend';
import { useDailySpend } from '../hooks/use-daily-spend';
import { DailySpendBars } from './daily-spend-bars';
import { SpendDonut } from './spend-donut';

const CHART_ICON = { ios: 'chart.pie', android: 'donut_large', web: 'donut_large' } as const;
const CHEVRON_ICON = { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' } as const;
const UP_ICON = { ios: 'arrow.up.right', android: 'trending_up', web: 'trending_up' } as const;
const DOWN_ICON = {
  ios: 'arrow.down.right',
  android: 'trending_down',
  web: 'trending_down',
} as const;

const openCategory = (id: string) => router.push({ pathname: '/category/[id]', params: { id } });
const addExpense = () => router.push('/add');
const share = (part: number, total: number) => Math.round((part / total) * 100);
const totalOf = (budgets: BudgetSummary[]) => budgets.reduce((sum, b) => sum + b.spentCents, 0);

/** Where the month's money went: share by category, day by day, against last month. */
export function InsightsScreen() {
  const { theme } = useUnistyles();
  const [month, setMonth] = useState(currentMonth);
  const summary = useMonthSummary(month);
  const previous = useMonthSummary(shiftMonth(month, -1));
  const daily = useDailySpend(month);
  const currencyKey = useCurrencyKey();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await syncNow();
      await Promise.all([summary.refetch(), previous.refetch(), daily.refetch()]);
    } catch {
      toast.error("Couldn't update. Try again.");
    } finally {
      setRefreshing(false);
    }
  };

  if (summary.isPending || daily.isPending) return <LoadingState />;
  if (summary.isError || daily.isError) {
    return (
      <ErrorState
        message={(summary.error ?? daily.error)?.message}
        onRetry={() => {
          void summary.refetch();
          void daily.refetch();
        }}
      />
    );
  }

  const total = totalOf(summary.data);
  const ranked = summary.data
    .filter((b) => b.spentCents > 0)
    .sort((a, b) => b.spentCents - a.spentCents);

  return (
    <Screen
      scroll
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
          tintColor={theme.colors.textMuted}
        />
      }
    >
      <View style={styles.toolbar}>
        <MonthMenu month={month} onChange={setMonth}>
          <View
            style={styles.monthButton}
            accessibilityRole="button"
            accessibilityLabel={`Change month. ${formatMonth(month)} selected`}
          >
            <Text variant="label">{formatMonth(month)}</Text>
            <Icon name={CHEVRON_ICON} size={theme.sizes.iconXs} tone="muted" />
          </View>
        </MonthMenu>
        {total > 0 && previous.data ? (
          <Delta current={total} previous={totalOf(previous.data)} month={month} />
        ) : null}
      </View>

      <Fragment key={`${month}-${currencyKey}`}>
        {total === 0 ? (
          <Card style={styles.emptyCard}>
            <EmptyState
              icon={CHART_ICON}
              title="Nothing to analyse yet"
              message={`Insights for ${formatMonthName(month)} appear once you log expenses.`}
              actionLabel="Add expense"
              onAction={addExpense}
            />
          </Card>
        ) : (
          <Overview month={month} ranked={ranked} total={total} days={daily.data} />
        )}
      </Fragment>
    </Screen>
  );
}

function Overview({
  month,
  ranked,
  total,
  days,
}: {
  month: string;
  ranked: BudgetSummary[];
  total: number;
  days: NonNullable<ReturnType<typeof useDailySpend>['data']>;
}) {
  const { theme } = useUnistyles();
  const entering = useEntering();
  const top = ranked[0];
  const average = averagePerDay(days);

  return (
    <>
      <Animated.View entering={entering(0)}>
        <Card style={styles.donutCard}>
          <SpendDonut
            slices={ranked.map((b) => ({
              key: b.categoryId,
              value: b.spentCents,
              color: categoryColor(theme, b.color),
            }))}
          >
            <Text variant="caption" tone="muted">
              Spent in {formatMonthName(month)}
            </Text>
            <Text variant="largeNumber" adjustsFontSizeToFit numberOfLines={1} style={styles.total}>
              {formatMoney(total)}
            </Text>
            <Text variant="caption" tone="muted">
              {ranked.length} {ranked.length === 1 ? 'category' : 'categories'}
            </Text>
          </SpendDonut>
          <Text variant="callout" tone="muted" align="center" style={styles.lead}>
            <Text variant="callout" weight="semibold">
              {top.name}
            </Text>{' '}
            is {share(top.spentCents, total)}% of your spending.
          </Text>
        </Card>
      </Animated.View>

      <Animated.View entering={entering(1)}>
        <Section title="Daily spending">
          <Card>
            <DailySpendBars days={days} average={average} />
          </Card>
        </Section>
      </Animated.View>

      <Animated.View entering={entering(2)}>
        <Section title="By category" detail={`${ranked.length} with spending`}>
          <ListGroup inset={theme.sizes.categoryBadge + theme.space.md}>
            {ranked.map((b) => (
              <ShareRow key={b.categoryId} budget={b} total={total} />
            ))}
          </ListGroup>
        </Section>
      </Animated.View>
    </>
  );
}

/** "↑ 12% vs September". Spending more is the warning direction. */
function Delta({ current, previous, month }: { current: number; previous: number; month: string }) {
  if (previous === 0) return null;
  const change = Math.round(((current - previous) / previous) * 100);
  const up = change > 0;
  const label = `${Math.abs(change)}% vs ${formatMonthName(shiftMonth(month, -1))}`;
  return (
    <Pill
      label={change === 0 ? `Same as ${formatMonthName(shiftMonth(month, -1))}` : label}
      tone={up ? 'warning' : 'success'}
      icon={change === 0 ? undefined : up ? UP_ICON : DOWN_ICON}
    />
  );
}

const ShareRow = memo(function ShareRow({
  budget,
  total,
}: {
  budget: BudgetSummary;
  total: number;
}) {
  const { theme } = useUnistyles();
  const pct = share(budget.spentCents, total);
  const amount = formatMoney(budget.spentCents);
  return (
    <PressableRow
      accessibilityLabel={`${budget.name}: ${amount}, ${pct}% of spending`}
      onPress={() => openCategory(budget.categoryId)}
      style={styles.row}
    >
      <CategoryBadge icon={budget.icon} color={budget.color} />
      <View style={styles.rowBody}>
        <View style={styles.rowLine}>
          <Text variant="body" numberOfLines={1} style={styles.rowName}>
            {budget.name}
          </Text>
          <Text variant="label" tabular>
            {amount}
          </Text>
        </View>
        <View style={styles.rowBar}>
          <View style={styles.rowBarTrack}>
            <ProgressBar
              value={budget.spentCents / total}
              color={categoryColor(theme, budget.color)}
              size="sm"
              delay={theme.motion.barDelayMs}
            />
          </View>
          <Text variant="caption" tone="muted" tabular style={styles.pct}>
            {pct}%
          </Text>
        </View>
      </View>
    </PressableRow>
  );
});

const styles = StyleSheet.create((theme) => ({
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.sm,
    marginBottom: theme.space.md,
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.xs,
    minHeight: theme.sizes.hitTarget - theme.space.sm,
    paddingHorizontal: theme.space.md,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  emptyCard: { paddingVertical: theme.space.xxl },
  donutCard: { paddingVertical: theme.space.xl },
  total: {
    marginVertical: theme.space.xxs,
    maxWidth: theme.sizes.donut - theme.sizes.donutStroke * 3,
  },
  lead: { marginTop: theme.space.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    paddingVertical: theme.space.md,
  },
  rowBody: { flex: 1, minWidth: 0, gap: theme.space.sm },
  rowLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: theme.space.md,
  },
  rowName: { flexShrink: 1 },
  rowBar: { flexDirection: 'row', alignItems: 'center', gap: theme.space.sm },
  rowBarTrack: { flex: 1 },
  pct: { minWidth: theme.space.xxl, textAlign: 'right' },
}));
