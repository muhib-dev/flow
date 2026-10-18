import { router } from 'expo-router';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { EmptyState, ErrorState, LoadingState } from '@/design-system';

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
        ListEmptyComponent={
          <EmptyState
            title="No expenses yet"
            message="Add your first expense to start tracking."
            actionLabel="Add expense"
            onAction={() => router.push('/add')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
}));
