import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/design-system';
import { formatDate, formatMoney } from '@/lib/format';

import type { TransactionListItem } from '../api/transactions-repo';
import { CategoryBadge } from './category-badge';

type TransactionRowProps = {
  item: TransactionListItem;
  onPress: (id: string) => void;
};

export const TransactionRow = memo(function TransactionRow({ item, onPress }: TransactionRowProps) {
  const label = item.note || item.categoryName;
  const pending = item.syncStatus === 'pending';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${formatMoney(item.amountCents)}, ${formatDate(item.occurredAt)}${
        pending ? ', not synced yet' : ''
      }`}
      onPress={() => onPress(item.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <CategoryBadge icon={item.categoryIcon} color={item.categoryColor} />
      <View style={styles.body}>
        <Text variant="headline" numberOfLines={1}>
          {label}
        </Text>
        <Text variant="caption" tone="muted">
          {item.categoryName} · {formatDate(item.occurredAt)}
          {pending ? ' · Pending sync' : ''}
          {item.syncStatus === 'failed' ? ' · Sync failed' : ''}
        </Text>
      </View>
      <Text variant="headline" style={styles.amount}>
        {formatMoney(item.amountCents)}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    minHeight: theme.sizes.hitTarget,
    paddingVertical: theme.space.md,
    paddingHorizontal: theme.space.lg,
    backgroundColor: theme.colors.surface,
  },
  pressed: { backgroundColor: theme.colors.surfaceMuted },
  body: { flex: 1, gap: theme.space.xxs },
  amount: { fontVariant: ['tabular-nums'] },
}));
