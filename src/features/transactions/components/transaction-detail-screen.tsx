import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button, Card, EmptyState, ErrorState, LoadingState, Screen, Text } from '@/design-system';
import { formatDate, formatMoney } from '@/lib/format';

import { useDeleteTransaction, useSaveTransaction } from '../hooks/use-transaction-mutations';
import { useTransaction } from '../hooks/use-transactions';
import { TransactionForm } from './transaction-form';

export function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isPending, isError, error, refetch } = useTransaction(id);
  const save = useSaveTransaction();
  const remove = useDeleteTransaction();
  const [editing, setEditing] = useState(false);

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState message={error.message} onRetry={() => void refetch()} />;
  if (!data) {
    return (
      <EmptyState
        title="Expense not found"
        message="It may have been deleted."
        actionLabel="Go back"
        onAction={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      />
    );
  }

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: data.note || data.categoryName }} />
      {editing ? (
        <TransactionForm
          initial={data}
          submitLabel="Save changes"
          onSubmit={(values) => {
            save.mutate({ ...values, id: data.id, occurredAt: data.occurredAt });
            setEditing(false);
          }}
        />
      ) : (
        <>
          <Card>
            <Text variant="display">{formatMoney(data.amountCents)}</Text>
            <View style={styles.meta}>
              <Text tone="muted">{data.categoryName}</Text>
              <Text tone="muted">{formatDate(data.occurredAt)}</Text>
              {data.note ? <Text>{data.note}</Text> : null}
              <Text variant="caption" tone={data.syncStatus === 'failed' ? 'danger' : 'muted'}>
                {data.syncStatus === 'synced'
                  ? 'Synced'
                  : data.syncStatus === 'pending'
                    ? 'Waiting to sync'
                    : 'Sync failed'}
              </Text>
            </View>
          </Card>
          <Button label="Edit" variant="secondary" onPress={() => setEditing(true)} />
          <Button
            label="Delete"
            variant="danger"
            onPress={() => {
              remove.mutate(data.id);
              router.back();
            }}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  meta: { gap: theme.space.xs },
}));
