import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon, Text } from '@/design-system';
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

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${item.categoryName}, ${amount}, ${day}${status}`}
      accessibilityHint={retryable ? 'Double tap to retry' : undefined}
      onPress={() => (retryable ? onRetry(item) : onPress(item.id))}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <CategoryBadge icon={item.categoryIcon} color={item.categoryColor} neutral />
      <View style={styles.body}>
        <Text variant="body">{title}</Text>
        <View style={styles.meta}>
          <View style={styles.swatch(item.categoryColor)} />
          <Text variant="caption" tone="muted">
            {item.categoryName}
            {showDate ? ` · ${day}` : ''}
          </Text>
          {failed ? (
            <Text variant="caption" tone="dangerText" style={styles.failed}>
              {retryable ? '· Not synced, tap to retry' : '· Not synced'}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.trailing}>
        {pending ? <Icon name={PENDING_ICON} size={theme.sizes.iconSm} tone="muted" /> : null}
        {failed ? <Icon name={FAILED_ICON} size={theme.sizes.iconSm} tone="danger" /> : null}
        <Text variant="body" tone={pending || failed ? 'muted' : 'normal'} style={styles.amount}>
          {amount}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    minHeight: theme.sizes.listRow,
    paddingVertical: theme.space.sm,
    paddingHorizontal: theme.space.xl,
  },
  pressed: { backgroundColor: theme.colors.surfaceMuted },
  body: { flex: 1, minWidth: 0 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: theme.space.xs },
  swatch: (color: string) => ({
    width: theme.sizes.swatchSm,
    height: theme.sizes.swatchSm,
    borderRadius: theme.radius.xs,
    backgroundColor: color,
  }),
  failed: { fontWeight: theme.typography.label.fontWeight },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: theme.space.xs },
  amount: { fontVariant: ['tabular-nums'] },
}));
