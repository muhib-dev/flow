import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { toast } from '@/design-system';

import { groupByDay } from '../api/group-by-day';
import { syncNow } from '../api/sync';
import type { TransactionListItem } from '../api/transactions-repo';
import { useRetryTransaction } from '../hooks/use-transaction-mutations';
import { DayHeader } from './day-header';
import { TransactionRow } from './transaction-row';

type Entry =
  | { type: 'day'; key: string; day: number; totalCents: number }
  | { type: 'transaction'; key: string; item: TransactionListItem };

const keyExtractor = (entry: Entry) => entry.key;
const getItemType = (entry: Entry) => entry.type;

const openDetail = (id: string) => router.push({ pathname: '/transaction/[id]', params: { id } });

/** Transactions under day headers with their totals. Failed rows retry on tap. */
export function TransactionList({
  data,
  ListHeaderComponent,
  ListEmptyComponent,
}: {
  data: TransactionListItem[];
  ListHeaderComponent?: React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
}) {
  const { theme } = useUnistyles();
  const [refreshing, setRefreshing] = useState(false);
  const retry = useRetryTransaction();

  const entries: Entry[] = groupByDay(data).flatMap((g) => [
    { type: 'day' as const, key: `day-${g.day}`, day: g.day, totalCents: g.totalCents },
    ...g.items.map((item) => ({ type: 'transaction' as const, key: item.id, item })),
  ]);

  const renderItem = useCallback(
    ({ item: entry }: { item: Entry }) =>
      entry.type === 'day' ? (
        <View style={styles.gutter}>
          <DayHeader day={entry.day} totalCents={entry.totalCents} />
        </View>
      ) : (
        <TransactionRow item={entry.item} onPress={openDetail} onRetry={retry} showDate={false} />
      ),
    [retry],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await syncNow();
      toast.info('Updated just now');
    } catch {
      toast.error("Couldn't update. Try again.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <FlashList
      data={entries}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.textMuted}
        />
      }
    />
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  content: { paddingBottom: rt.insets.bottom + theme.space.xl },
  gutter: { paddingHorizontal: theme.space.xl },
}));
