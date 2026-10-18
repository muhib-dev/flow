import { router } from 'expo-router';
import { Fragment, useState } from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Card, EmptyState, ErrorState, Icon, LoadingState, Metric, Text } from '@/design-system';
import { useCurrencyKey } from '@/features/settings/store/preferences-store';
import { currentMonth, formatMoney, formatMonth, formatMonthName } from '@/lib/format';

import type { TransactionListItem } from '../api/transactions-repo';
import { useCategories, useTransactions } from '../hooks/use-transactions';
import { CategoryChips } from './category-chips';
import { MonthMenu } from './month-menu';
import { TransactionList } from './transaction-list';

const CHEVRON_ICON = { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' } as const;
const RECEIPT_ICON = { ios: 'receipt', android: 'receipt_long', web: 'receipt_long' } as const;

export function TransactionsScreen() {
  const [month, setMonth] = useState(currentMonth);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const list = useTransactions({ month, categoryId: categoryId ?? undefined });
  const categories = useCategories();
  const currencyKey = useCurrencyKey();

  if (list.isPending) return <LoadingState />;
  if (list.isError) {
    return <ErrorState message={list.error.message} onRetry={() => void list.refetch()} />;
  }

  const items = list.data;
  const categoryName = categories.data?.find((c) => c.id === categoryId)?.name;

  return (
    <Fragment key={currencyKey}>
      <View style={styles.root}>
        <TransactionList
          data={items}
          onRefresh={list.refetch}
          ListHeaderComponent={
            <View>
              <MonthTotal month={month} onMonthChange={setMonth} items={items} />
              {categories.data ? (
                <View style={styles.chips}>
                  <CategoryChips
                    categories={categories.data}
                    selectedId={categoryId}
                    onSelect={setCategoryId}
                    allLabel="All"
                    onSelectAll={() => setCategoryId(null)}
                    contentStyle={styles.chipsContent}
                  />
                </View>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <EmptyState
                icon={RECEIPT_ICON}
                title={
                  categoryName ? `No ${categoryName.toLowerCase()} expenses` : 'No expenses yet'
                }
                message={`Nothing logged in ${formatMonthName(month)}${categoryName ? ' for this category' : ''}. Expenses you add show up here, grouped by day.`}
                actionLabel="Add expense"
                onAction={() => router.push('/add')}
              />
            </View>
          }
        />
      </View>
    </Fragment>
  );
}

/** Month's total for the current filter, with the month switcher in the corner. */
function MonthTotal({
  month,
  onMonthChange,
  items,
}: {
  month: string;
  onMonthChange: (month: string) => void;
  items: TransactionListItem[];
}) {
  const { theme } = useUnistyles();
  const total = items.reduce((sum, t) => sum + t.amountCents, 0);
  const count = items.length;

  return (
    <Card style={styles.summary}>
      <View style={styles.metric}>
        <Metric
          size="large"
          label={`Spent in ${formatMonthName(month)}`}
          value={formatMoney(total)}
          unit={`${count} ${count === 1 ? 'expense' : 'expenses'}`}
        />
      </View>
      <MonthMenu month={month} onChange={onMonthChange}>
        <View
          style={styles.monthButton}
          accessibilityRole="button"
          accessibilityLabel={`Change month. ${formatMonth(month)} selected`}
        >
          <Text variant="caption" weight="semibold">
            {formatMonth(month)}
          </Text>
          <Icon name={CHEVRON_ICON} size={theme.sizes.iconXs} tone="muted" />
        </View>
      </MonthMenu>
    </Card>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
  summary: { flexDirection: 'row', alignItems: 'flex-start', marginTop: theme.space.sm },
  metric: { flex: 1, minWidth: 0 },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.xs,
    minHeight: theme.sizes.iconBadgeSm,
    paddingHorizontal: theme.space.md,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
  },
  // Chips scroll edge to edge while their first chip lines up with the cards.
  chips: { marginTop: theme.space.lg, marginHorizontal: -theme.space.gutter },
  chipsContent: { paddingHorizontal: theme.space.gutter },
  empty: { paddingTop: theme.space.xxl },
}));
