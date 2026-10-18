import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import {
  Card,
  categoryColor,
  EmptyState,
  ErrorState,
  LoadingState,
  Metric,
  ProgressBar,
  Text,
} from '@/design-system';
import type { BudgetSummary } from '@/features/transactions/api/transactions-repo';
import { CategoryBadge } from '@/features/transactions/components/category-badge';
import { TransactionList } from '@/features/transactions/components/transaction-list';
import { useTransactions } from '@/features/transactions/hooks/use-transactions';
import {
  currentMonth,
  formatMoney,
  formatMoneyShort,
  formatMonthName,
  monthProgress,
} from '@/lib/format';

import { paceOf } from '../api/pace';
import { useMonthSummary } from '../hooks/use-month-summary';
import { PaceLine } from './pace-line';
import { StatRow } from './stat-row';

export function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const summary = useMonthSummary();
  const list = useTransactions({ categoryId: id });

  if (summary.isPending || list.isPending) return <LoadingState />;
  if (summary.isError || list.isError) {
    return (
      <ErrorState
        message={(summary.error ?? list.error)?.message}
        onRetry={() => {
          void summary.refetch();
          void list.refetch();
        }}
      />
    );
  }

  const budget = summary.data.find((b) => b.categoryId === id);
  if (!budget) return <EmptyState title="Category not found" message="It may have been removed." />;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: budget.name }} />
      <TransactionList
        data={list.data}
        onRefresh={() => Promise.all([summary.refetch(), list.refetch()])}
        ListHeaderComponent={<CategoryHero budget={budget} />}
        ListEmptyComponent={
          <Text variant="callout" tone="muted" align="center" style={styles.empty}>
            No {budget.name.toLowerCase()} expenses yet.
          </Text>
        }
      />
    </View>
  );
}

function CategoryHero({ budget }: { budget: BudgetSummary }) {
  const month = currentMonth();
  const { day, daysInMonth } = monthProgress();
  const calendarRatio = day / daysInMonth;
  const hasLimit = budget.limitCents > 0;
  const ratio = hasLimit ? budget.spentCents / budget.limitCents : 0;
  const pace = paceOf(budget.spentCents, budget.limitCents, calendarRatio);
  const over = hasLimit && pace === 'over';
  const remaining = budget.limitCents - budget.spentCents;

  const { theme } = useUnistyles();
  const label = hasLimit
    ? `${over ? 'Over budget by' : 'Left to spend'} in ${formatMonthName(month)}`
    : `Spent in ${formatMonthName(month)}`;

  return (
    <Card style={styles.hero}>
      <View style={styles.badge}>
        <CategoryBadge icon={budget.icon} color={budget.color} />
      </View>
      <Metric
        label={label}
        value={formatMoney(hasLimit ? Math.abs(remaining) : budget.spentCents)}
        tone={over ? 'dangerText' : 'normal'}
        footer={
          hasLimit ? (
            <PaceLine pace={pace} spentRatio={ratio} calendarRatio={calendarRatio} />
          ) : (
            <Text variant="callout" tone="muted">
              No budget set for this category.
            </Text>
          )
        }
      />
      {hasLimit ? (
        <>
          <View style={styles.bar}>
            <ProgressBar
              value={ratio}
              color={categoryColor(theme, budget.color)}
              marker={calendarRatio}
            />
          </View>
          <View style={styles.stats}>
            <StatRow
              stats={[
                { label: 'Spent', value: formatMoney(budget.spentCents) },
                { label: 'Left', value: formatMoney(Math.max(0, remaining)) },
                { label: 'Budget', value: formatMoneyShort(budget.limitCents) },
              ]}
            />
          </View>
        </>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
  hero: { marginTop: theme.space.sm, padding: theme.space.xl },
  badge: { marginBottom: theme.space.md },
  bar: { marginTop: theme.space.xl },
  stats: { marginTop: theme.space.xl, marginHorizontal: -theme.space.md },
  empty: { paddingVertical: theme.space.xl },
}));
