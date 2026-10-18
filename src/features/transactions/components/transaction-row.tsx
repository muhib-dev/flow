import { memo } from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon, PressableRow, Text } from '@/design-system';
import { formatDayLabel, formatMoney } from '@/lib/format';

import type { TransactionListItem } from '../api/transactions-repo';
import { CategoryBadge } from './category-badge';

const PENDING_ICON = { ios: 'clock', android: 'schedule', web: 'schedule' } as const;
const FAILED_ICON = {
  ios: 'exclamationmark.circle.fill',
  android: 'error',
  web: 'error',
} as const;

type TransactionRowProps = {
  item: TransactionListItem;
  onPress: (id: string) => void;
  /** When set, tapping a failed row retries its sync instead of opening it. */
  onRetry?: (item: TransactionListItem) => void;
  /** Add the date to the meta line. Off when rows already sit under a day header. */
  showDate?: boolean;
};

export const TransactionRow = memo(function TransactionRow({
  item,
  onPress,
  onRetry,
  showDate = true,
}: TransactionRowProps) {
  const { theme } = useUnistyles();
  const title = item.note || item.categoryName;
  const pending = item.syncStatus === 'pending';
  const failed = item.syncStatus === 'failed';
  const retryable = failed && onRetry != null;
  const amount = formatMoney(item.amountCents);
  const day = formatDayLabel(item.occurredAt);
  const status = pending ? ', syncing' : failed ? ', not synced' : '';

  let meta = item.note ? item.categoryName : '';
  if (showDate) meta = meta ? `${meta} · ${day}` : day;

  return (
    <PressableRow
      accessibilityLabel={`${title}, ${item.categoryName}, ${amount}, ${day}${status}`}
      accessibilityHint={retryable ? 'Double tap to retry' : undefined}
      onPress={() => (retryable ? onRetry(item) : onPress(item.id))}
      style={styles.row}
    >
      <CategoryBadge icon={item.categoryIcon} color={item.categoryColor} />
      <View style={styles.body}>
        <Text variant="body" numberOfLines={1}>
          {title}
        </Text>
        {failed ? (
          <Text variant="caption" weight="semibold" tone="dangerText">
            {retryable ? 'Not synced · Tap to retry' : 'Not synced'}
          </Text>
        ) : meta ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
      <View style={styles.trailing}>
        {pending ? <Icon name={PENDING_ICON} size={theme.sizes.iconXs} tone="subtle" /> : null}
        {failed ? <Icon name={FAILED_ICON} size={theme.sizes.iconSm} tone="danger" /> : null}
        <Text variant="label" tone={pending || failed ? 'muted' : 'normal'} tabular>
          −{amount}
        </Text>
      </View>
    </PressableRow>
  );
});

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    minHeight: theme.sizes.listRow,
    paddingVertical: theme.space.sm,
  },
  body: { flex: 1, minWidth: 0, gap: theme.space.xxs },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: theme.space.xs },
}));
