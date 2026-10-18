import { router } from 'expo-router';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { EmptyState, ErrorState, LoadingState, Text } from '@/design-system';
import { formatMoney, formatMonthName, currentMonth, monthRange } from '@/lib/format';

import type { TransactionListItem } from '../api/transactions-repo';
import { useTransactions } from '../hooks/use-transactions';
import { TransactionList } from './transaction-list';

export function TransactionsScreen() {
  const { data, isPending, isError, error, refetch } = useTransactions();

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState message={error.message} onRetry={() => void refetch()} />;

  return (
    <View style={styles.root}>
      <TransactionList
        data={data}
        ListHeaderComponent={data.length > 0 ? <MonthTotal items={data} /> : undefined}
        ListEmptyComponent={
          <EmptyState
            title="No expenses yet"
            message="Expenses you add show up here, grouped by day."
            actionLabel="Add expense"
            onAction={() => router.push('/add')}
          />
        }
      />
    </View>
  );
}

/** "Spent in October · $1,486.20 · 23 expenses" over a hairline. */
function MonthTotal({ items }: { items: TransactionListItem[] }) {
  const month = currentMonth();
  const { start, end } = monthRange(month);
  const inMonth = items.filter((t) => t.occurredAt >= start && t.occurredAt < end);
  const total = inMonth.reduce((sum, t) => sum + t.amountCents, 0);
  const count = inMonth.length;

  return (
    <View style={styles.summary} accessible>
      <Text variant="callout" tone="muted">
        Spent in {formatMonthName(month)}
      </Text>
      <View style={styles.summaryValue}>
        <Text variant="largeNumber" adjustsFontSizeToFit numberOfLines={1}>
          {formatMoney(total)}
        </Text>
        <Text variant="callout" tone="muted">
          {count} {count === 1 ? 'expense' : 'expenses'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
  summary: {
    marginHorizontal: theme.space.xl,
    paddingTop: theme.space.sm,
    paddingBottom: theme.space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  summaryValue: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: theme.space.sm,
    marginTop: theme.space.xs,
  },
}));
