import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Card, EmptyState, ErrorState, LoadingState, ProgressBar, Text } from '@/design-system';
import { TransactionList } from '@/features/transactions/components/transaction-list';
import { useTransactions } from '@/features/transactions/hooks/use-transactions';
import { formatMoney } from '@/lib/format';

import { useMonthSummary } from '../hooks/use-month-summary';

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
  if (!budget) return <EmptyState title="Category not found" />;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: budget.name }} />
      <Card style={styles.card}>
        <Text variant="title">{formatMoney(budget.spentCents)}</Text>
        <Text tone="muted">of {formatMoney(budget.limitCents)} this month</Text>
        <ProgressBar
          value={budget.limitCents > 0 ? budget.spentCents / budget.limitCents : 0}
          color={budget.color}
        />
      </Card>
      <TransactionList
        data={list.data}
        ListEmptyComponent={<EmptyState title={`No ${budget.name.toLowerCase()} expenses yet`} />}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
  card: { margin: theme.space.lg },
}));
