import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { TransactionListItem } from '../api/transactions-repo';
import { syncNow } from '../api/sync';
import { TransactionRow } from './transaction-row';

const keyExtractor = (item: TransactionListItem) => item.id;
const getItemType = () => 'transaction';

export function TransactionList({
  data,
  ListEmptyComponent,
}: {
  data: TransactionListItem[];
  ListEmptyComponent?: React.ReactElement;
}) {
  const [refreshing, setRefreshing] = useState(false);

  const openDetail = useCallback((id: string) => {
    router.push({ pathname: '/transaction/[id]', params: { id } });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: TransactionListItem }) => (
      <TransactionRow item={item} onPress={openDetail} />
    ),
    [openDetail],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await syncNow();
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <FlashList
      data={data}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      renderItem={renderItem}
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={ListEmptyComponent}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create((theme) => ({
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: theme.space.lg,
    backgroundColor: theme.colors.border,
  },
}));
