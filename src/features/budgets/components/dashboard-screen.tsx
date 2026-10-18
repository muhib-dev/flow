import { router } from 'expo-router';
import { Fragment, useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import {
  Card,
  EmptyState,
  ErrorState,
  ListGroup,
  Metric,
  SectionHeader,
  Text,
  TextButton,
  toast,
  useEntering,
} from '@/design-system';
import { useCurrencyKey } from '@/features/settings/store/preferences-store';
import { syncNow } from '@/features/transactions/api/sync';
import type {
  BudgetSummary,
  TransactionListItem,
} from '@/features/transactions/api/transactions-repo';
import { TransactionRow } from '@/features/transactions/components/transaction-row';
import { useRetryTransaction } from '@/features/transactions/hooks/use-transaction-mutations';
import { useTransactions } from '@/features/transactions/hooks/use-transactions';
import {
  currentMonth,
  formatMoney,
  formatMoneyShort,
  formatMonthName,
  monthProgress,
} from '@/lib/format';

import { paceOf, rankBudgets, safeToSpendPerDay, type Pace } from '../api/pace';
import { useCountUp } from '../hooks/use-count-up';
import { useMonthSummary } from '../hooks/use-month-summary';
import { AddExpenseButton } from './add-expense-button';
import { BudgetRow } from './budget-row';
import { DashboardHeader } from './dashboard-header';
import { DashboardSkeleton } from './dashboard-skeleton';
import { MonthRuler } from './month-ruler';
import { PaceLine } from './pace-line';
import { StatRow } from './stat-row';

const RECENT_LIMIT = 5;
const BUDGETS_COLLAPSED = 4;
const WALLET_ICON = {
  ios: 'chart.bar.doc.horizontal',
  android: 'savings',
  web: 'savings',
} as const;

const addExpense = () => router.push('/add');
const openAll = () => router.navigate('/transactions');
const openCategory = (id: string) => router.push({ pathname: '/category/[id]', params: { id } });
const openTransaction = (id: string) =>
  router.push({ pathname: '/transaction/[id]', params: { id } });

/** Where the month stands: days gone vs money gone. Past months are complete. */
function progressOf(month: string) {
  if (month === currentMonth()) return monthProgress();
  const [year, m] = month.split('-').map(Number);
  const daysInMonth = new Date(year, m, 0).getDate();
  return { day: daysInMonth, daysInMonth, daysLeft: 0 };
}

export function DashboardScreen() {
  const { theme } = useUnistyles();
  const [month, setMonth] = useState(currentMonth);
  const summary = useMonthSummary(month);
  const recent = useTransactions({ month, limit: RECENT_LIMIT });
  const [refreshing, setRefreshing] = useState(false);
  const currencyKey = useCurrencyKey();

  const failed = summary.isError || recent.isError;
  // A retry from the error state shows the skeleton again until it settles.
  const loading =
    summary.isPending || recent.isPending || (failed && (summary.isFetching || recent.isFetching));

  const retry = useCallback(() => {
    void summary.refetch();
    void recent.refetch();
  }, [summary, recent]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await syncNow();
      await Promise.all([summary.refetch(), recent.refetch()]);
      toast.info('Updated just now');
    } catch {
      toast.error("Couldn't update. Try again.");
    } finally {
      setRefreshing(false);
    }
  }, [summary, recent]);

  let body;
  if (loading) body = <DashboardSkeleton />;
  else if (failed) {
    body = (
      <ErrorState
        title={`Couldn't load ${formatMonthName(month)}`}
        message="Check your connection and try again. Expenses you've already added aren't affected."
        onRetry={retry}
      />
    );
  } else if (!summary.data.some((b) => b.limitCents > 0)) {
    body = <NoBudgets month={month} budgets={summary.data} recent={recent.data} />;
  } else body = <Overview month={month} budgets={summary.data} recent={recent.data} />;

  return (
    <View style={styles.root}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        refreshControl={
          loading || failed ? undefined : (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.textMuted}
            />
          )
        }
      >
        <DashboardHeader month={month} onMonthChange={setMonth} />
        <Fragment key={`${month}-${currencyKey}`}>{body}</Fragment>
      </ScrollView>
      {loading ? null : <AddExpenseButton onPress={addExpense} />}
    </View>
  );
}

function Overview({
  month,
  budgets,
  recent,
}: {
  month: string;
  budgets: BudgetSummary[];
  recent: TransactionListItem[];
}) {
  const entering = useEntering();
  const { day, daysInMonth, daysLeft } = progressOf(month);
  const calendarRatio = day / daysInMonth;
  const spent = budgets.reduce((total, b) => total + b.spentCents, 0);
  const limit = budgets.reduce((total, b) => total + b.limitCents, 0);
  const pace = paceOf(spent, limit, calendarRatio);

  return (
    <>
      <Animated.View entering={entering(0)}>
        <Hero
          month={month}
          spent={spent}
          limit={limit}
          pace={pace}
          day={day}
          daysInMonth={daysInMonth}
          daysLeft={daysLeft}
        />
      </Animated.View>
      <Animated.View entering={entering(1)} style={styles.section}>
        <BudgetsSection budgets={budgets} calendarRatio={calendarRatio} />
      </Animated.View>
      <Animated.View entering={entering(2)} style={styles.section}>
        <RecentSection items={recent} month={month} />
      </Animated.View>
    </>
  );
}

function Hero({
  month,
  spent,
  limit,
  pace,
  day,
  daysInMonth,
  daysLeft,
}: {
  month: string;
  spent: number;
  limit: number;
  pace: Pace;
  day: number;
  daysInMonth: number;
  daysLeft: number;
}) {
  const over = pace === 'over';
  const finished = daysLeft === 0;
  let label = 'Safe to spend today';
  let target = safeToSpendPerDay(spent, limit, daysLeft);
  if (over) {
    label = 'Over budget by';
    target = spent - limit;
  } else if (finished) {
    label = `Left over from ${formatMonthName(month)}`;
    target = limit - spent;
  }
  const shown = useCountUp(Math.round(target));
  const daysWord = daysLeft === 1 ? 'day' : 'days';
  let unit = `a day for ${daysLeft} ${daysWord}`;
  if (finished) unit = `of ${formatMoneyShort(limit)}`;
  else if (over) unit = `${daysLeft} ${daysWord} left`;

  return (
    <Card variant="ink" style={styles.hero}>
      <Metric
        onInk
        label={label}
        value={formatMoney(Math.max(0, Math.round(shown)))}
        unit={unit}
        accessibilityLabel={`${label} ${formatMoney(target)}, ${unit}`}
        footer={
          <PaceLine
            onInk
            pace={pace}
            spentRatio={limit > 0 ? spent / limit : 0}
            calendarRatio={day / daysInMonth}
          />
        }
      />

      <View style={styles.ruler}>
        <MonthRuler
          month={month}
          day={day}
          daysInMonth={daysInMonth}
          spentCents={spent}
          limitCents={limit}
          pace={pace}
        />
      </View>

      <View style={styles.stats}>
        <StatRow
          onInk
          stats={[
            { label: 'Spent', value: formatMoney(spent) },
            { label: 'Left', value: formatMoney(Math.max(0, limit - spent)) },
            { label: 'Budget', value: formatMoneyShort(limit) },
          ]}
        />
      </View>
    </Card>
  );
}

function BudgetsSection({
  budgets,
  calendarRatio,
}: {
  budgets: BudgetSummary[];
  calendarRatio: number;
}) {
  const { theme } = useUnistyles();
  const [expanded, setExpanded] = useState(false);
  const ranked = rankBudgets(budgets, calendarRatio);
  const overCount = ranked.filter((b) => b.pace === 'over').length;
  const aboveCount = ranked.filter((b) => b.pace === 'above').length;
  const shown = expanded ? ranked : ranked.slice(0, BUDGETS_COLLAPSED);

  let detail = 'All on track';
  let detailTone: 'successText' | 'dangerText' | 'warningText' = 'successText';
  if (overCount > 0) {
    detail = `${overCount} over${aboveCount > 0 ? ` · ${aboveCount} above pace` : ''}`;
    detailTone = 'dangerText';
  } else if (aboveCount > 0) {
    detail = `${aboveCount} above pace`;
    detailTone = 'warningText';
  }

  return (
    <>
      <SectionHeader title="Budgets" detail={detail} detailTone={detailTone} />
      <ListGroup inset={theme.sizes.categoryBadge + theme.space.md}>
        {shown.map((b) => (
          <BudgetRow
            key={b.categoryId}
            budget={b}
            calendarRatio={calendarRatio}
            onPress={openCategory}
          />
        ))}
      </ListGroup>
      {ranked.length > BUDGETS_COLLAPSED ? (
        <TextButton
          label={expanded ? 'Show fewer' : `Show all ${ranked.length} budgets`}
          onPress={() => setExpanded((e) => !e)}
          style={styles.moreButton}
        />
      ) : null}
    </>
  );
}

function RecentSection({ items, month }: { items: TransactionListItem[]; month: string }) {
  const { theme } = useUnistyles();
  const retry = useRetryTransaction();

  return (
    <>
      <SectionHeader
        title="Recent"
        action={items.length > 0 ? { label: 'See all', onPress: openAll } : undefined}
      />
      {items.length === 0 ? (
        <Card>
          <Text variant="callout" tone="muted" align="center">
            Nothing logged in {formatMonthName(month)} yet. Expenses you add show up here.
          </Text>
        </Card>
      ) : (
        <ListGroup inset={theme.sizes.categoryBadge + theme.space.md}>
          {items.map((t) => (
            <TransactionRow key={t.id} item={t} onPress={openTransaction} onRetry={retry} />
          ))}
        </ListGroup>
      )}
    </>
  );
}

function NoBudgets({
  month,
  budgets,
  recent,
}: {
  month: string;
  budgets: BudgetSummary[];
  recent: TransactionListItem[];
}) {
  const entering = useEntering();
  const spent = budgets.reduce((total, b) => total + b.spentCents, 0);
  const isCurrent = month === currentMonth();
  return (
    <>
      <Animated.View entering={entering(0)}>
        {isCurrent ? (
          <Card>
            <EmptyState
              icon={WALLET_ICON}
              title={`No budget for ${formatMonthName(month)}`}
              message="Give each category a limit and Flow works out what's safe to spend each day."
            />
          </Card>
        ) : (
          <Card variant="ink">
            <Metric
              onInk
              label={`Spent in ${formatMonthName(month)}`}
              value={formatMoney(spent)}
              unit="no budget set"
            />
          </Card>
        )}
      </Animated.View>
      <Animated.View entering={entering(1)} style={styles.section}>
        <RecentSection items={recent} month={month} />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  root: { flex: 1, paddingTop: rt.insets.top, backgroundColor: theme.colors.background },
  content: {
    paddingHorizontal: theme.space.gutter,
    // Clears the docked Add expense button; the tab bar is handled by the automatic inset.
    paddingBottom: theme.sizes.controlHeight + theme.space.xxxl,
  },
  section: { marginTop: theme.space.section },
  hero: { padding: theme.space.xl },
  ruler: { marginTop: theme.space.xl },
  stats: { marginTop: theme.space.xl, marginHorizontal: -theme.space.md },
  moreButton: { alignSelf: 'center' },
}));
