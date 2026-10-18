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
  | {
      type: 'transaction';
      key: string;
      item: TransactionListItem;
      /** Position inside the day's card, for its rounded ends and separators. */
      first: boolean;
      last: boolean;
    };

const keyExtractor = (entry: Entry) => entry.key;
const getItemType = (entry: Entry) => entry.type;

const openDetail = (id: string) => router.push({ pathname: '/transaction/[id]', params: { id } });

/** Each day is a header over a card of its transactions. Failed rows retry on tap. */
export function TransactionList({
  data,
  ListHeaderComponent,
  ListEmptyComponent,
  onRefresh: refetch,
}: {
  data: TransactionListItem[];
  ListHeaderComponent?: React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
  /** Reloads the screen's queries after a pull-to-refresh sync. */
  onRefresh?: () => Promise<unknown>;
}) {
  const { theme } = useUnistyles();
  const [refreshing, setRefreshing] = useState(false);
  const retry = useRetryTransaction();

  const entries: Entry[] = groupByDay(data).flatMap((g) => [
    { type: 'day' as const, key: `day-${g.day}`, day: g.day, totalCents: g.totalCents },
    ...g.items.map((item, i) => ({
      type: 'transaction' as const,
      key: item.id,
      item,
      first: i === 0,
      last: i === g.items.length - 1,
    })),
  ]);

  const renderItem = useCallback(
    ({ item: entry }: { item: Entry }) =>
      entry.type === 'day' ? (
        <DayHeader day={entry.day} totalCents={entry.totalCents} />
      ) : (
        <View style={styles.cell(entry.first, entry.last)}>
          {entry.first ? null : <View style={styles.separator} />}
          <TransactionRow item={entry.item} onPress={openDetail} onRetry={retry} showDate={false} />
        </View>
      ),
    [retry],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await syncNow();
      await refetch?.();
      toast.info('Updated just now');
    } catch {
      toast.error("Couldn't update. Try again.");
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

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
  content: {
    paddingHorizontal: theme.space.gutter,
    paddingBottom: rt.insets.bottom + theme.space.xxl,
  },
  // Rows draw the day's card piecewise so FlashList can still recycle them one by one.
  cell: (first: boolean, last: boolean) => ({
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.separator,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderTopWidth: first ? StyleSheet.hairlineWidth : 0,
    borderBottomWidth: last ? StyleSheet.hairlineWidth : 0,
    borderTopLeftRadius: first ? theme.radius.card : 0,
    borderTopRightRadius: first ? theme.radius.card : 0,
    borderBottomLeftRadius: last ? theme.radius.card : 0,
    borderBottomRightRadius: last ? theme.radius.card : 0,
    borderCurve: 'continuous',
  }),
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: theme.space.lg + theme.sizes.categoryBadge + theme.space.md,
    backgroundColor: theme.colors.separator,
  },
}));
