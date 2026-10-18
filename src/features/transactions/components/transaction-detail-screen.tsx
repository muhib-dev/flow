import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  ListGroup,
  ListRow,
  LoadingState,
  Screen,
  Section,
  Text,
  TextButton,
} from '@/design-system';
import { formatDate, formatDayLabel, formatMoney } from '@/lib/format';

import {
  useDeleteTransaction,
  useRetryTransaction,
  useSaveTransaction,
} from '../hooks/use-transaction-mutations';
import { useTransaction } from '../hooks/use-transactions';
import { CategoryBadge } from './category-badge';
import { TransactionForm } from './transaction-form';

const STATUS = {
  synced: { label: 'Synced', tone: 'muted' },
  pending: { label: 'Waiting to sync', tone: 'muted' },
  failed: { label: 'Not synced', tone: 'dangerText' },
} as const;

const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

export function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isPending, isError, error, refetch } = useTransaction(id);
  const save = useSaveTransaction();
  const remove = useDeleteTransaction();
  const retry = useRetryTransaction();
  const [editing, setEditing] = useState(false);

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState message={error.message} onRetry={() => void refetch()} />;
  if (!data) {
    return (
      <EmptyState
        title="Expense not found"
        message="It may have been deleted."
        actionLabel="Go back"
        onAction={goBack}
      />
    );
  }

  const title = data.note || data.categoryName;
  const status = STATUS[data.syncStatus];
  const failed = data.syncStatus === 'failed';

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: editing ? 'Edit expense' : title }} />
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
          <Card style={styles.hero}>
            <CategoryBadge icon={data.categoryIcon} color={data.categoryColor} />
            <Text
              variant="heroNumber"
              tone={data.syncStatus === 'synced' ? 'normal' : 'muted'}
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.amount}
            >
              {formatMoney(data.amountCents)}
            </Text>
            <Text variant="callout" tone="muted">
              {data.categoryName} · {formatDayLabel(data.occurredAt)}
            </Text>
            {data.note ? (
              <Text variant="body" align="center" style={styles.note}>
                {data.note}
              </Text>
            ) : null}
          </Card>

          <Section title="Details">
            <ListGroup>
              <ListRow label="Category" value={data.categoryName} />
              <ListRow label="Date" value={formatDate(data.occurredAt)} />
              <ListRow
                label="Status"
                value={failed ? 'Not synced, tap to retry' : status.label}
                valueTone={status.tone}
                onPress={failed ? () => retry(data) : undefined}
                chevron={false}
                accessibilityHint={failed ? 'Double tap to retry' : undefined}
              />
            </ListGroup>
          </Section>

          <View style={styles.actions}>
            <Button label="Edit" variant="outline" onPress={() => setEditing(true)} />
            <TextButton
              label="Delete expense"
              tone="dangerText"
              style={styles.delete}
              onPress={() => {
                remove.mutate(data.id);
                router.back();
              }}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  hero: { alignItems: 'center', gap: theme.space.xs, paddingVertical: theme.space.xl },
  amount: { marginTop: theme.space.sm },
  note: { marginTop: theme.space.sm },
  actions: { marginTop: theme.space.xl, gap: theme.space.sm },
  delete: { alignSelf: 'center' },
}));
