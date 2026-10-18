import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Button, Icon, Text, toast } from '@/design-system';
import { syncNow } from '@/features/transactions/api/sync';
import type {
  BudgetSummary,
  TransactionListItem,
} from '@/features/transactions/api/transactions-repo';
import { TransactionRow } from '@/features/transactions/components/transaction-row';
import { useSaveTransaction } from '@/features/transactions/hooks/use-transaction-mutations';
import { useTransactions } from '@/features/transactions/hooks/use-transactions';
import {
  currentMonth,
  formatDayLabel,
  formatMoney,
  formatMoneyShort,
  formatMonthName,
  monthProgress,
  startOfDay,
} from '@/lib/format';

import { paceOf, rankBudgets, safeToSpendPerDay, type Pace } from '../api/pace';
import { useCountUp } from '../hooks/use-count-up';
import { useMonthSummary } from '../hooks/use-month-summary';
import { AddExpenseButton } from './add-expense-button';
import { BudgetRow } from './budget-row';
import { DashboardHeader } from './dashboard-header';
import { DashboardSkeleton } from './dashboard-skeleton';
import { MonthRuler } from './month-ruler';

const RECENT_LIMIT = 5;
const BUDGETS_COLLAPSED = 4;
const ENTER_MS = 400;
const ENTER_STAGGER_MS = 90;

const CLOUD_OFF_ICON = { ios: 'icloud.slash', android: 'cloud_off', web: 'cloud_off' } as const;

const PACE = {
  ok: {
    word: 'On track',
    tone: 'normal',
    iconTone: 'success',
    icon: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  },
  above: {
    word: 'Above pace',
    tone: 'warningText',
    iconTone: 'warningText',
    icon: { ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' },
  },
  over: {
    word: 'Over budget',
    tone: 'dangerText',
    iconTone: 'danger',
    icon: { ios: 'exclamationmark.circle.fill', android: 'error', web: 'error' },
  },
} as const;

const addExpense = () => router.push('/add');
const openAll = () => router.push('/transactions');
const openCategory = (id: string) => router.push({ pathname: '/category/[id]', params: { id } });
const openTransaction = (id: string) =>
  router.push({ pathname: '/transaction/[id]', params: { id } });

export function DashboardScreen() {
  const { theme } = useUnistyles();
  const month = currentMonth();
  const summary = useMonthSummary(month);
  const recent = useTransactions({ limit: RECENT_LIMIT });
  const [refreshing, setRefreshing] = useState(false);

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
  else if (failed) body = <LoadFailed month={month} onRetry={retry} />;
  else if (!summary.data.some((b) => b.limitCents > 0)) {
    body = <NoBudgets month={month} recent={recent.data} />;
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
              title={refreshing ? 'Updating…' : 'Pull to refresh'}
              titleColor={theme.colors.textMuted}
            />
          )
        }
      >
        <DashboardHeader month={month} />
        {body}
      </ScrollView>
      {loading ? null : <AddExpenseButton onPress={addExpense} />}
    </View>
  );
}

function useEntering() {
  const { theme } = useUnistyles();
  return (index: number) =>
    FadeInDown.duration(ENTER_MS)
      .delay(index * ENTER_STAGGER_MS)
      .withInitialValues({ opacity: 0, transform: [{ translateY: theme.space.sm }] });
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
  const { day, daysInMonth, daysLeft } = monthProgress();
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
        <RecentSection items={recent} />
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
  const { theme } = useUnistyles();
  const over = pace === 'over';
  const perDay = safeToSpendPerDay(spent, limit, daysLeft);
  const target = over ? spent - limit : perDay;
  const shown = useCountUp(Math.round(target));
  const copy = PACE[pace];
  const left = Math.max(0, limit - spent);
  const daysWord = daysLeft === 1 ? 'day' : 'days';
  const unit = over ? `${daysLeft} ${daysWord} left` : `a day for ${daysLeft} ${daysWord}`;
  const spentPct = Math.round((limit > 0 ? spent / limit : 0) * 100);
  const monthPct = Math.round((day / daysInMonth) * 100);

  return (
    <View>
      <Text variant="callout" tone="muted">
        {over ? 'Over budget by' : 'Safe to spend today'}
      </Text>
      <View
        accessible
        accessibilityLabel={
          over
            ? `Over budget by ${formatMoney(target)}`
            : `Safe to spend today: ${formatMoney(target)} ${unit}`
        }
        style={styles.heroValue}
      >
        <Text
          variant="largeNumber"
          tone={over ? 'dangerText' : 'normal'}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {formatMoney(Math.max(0, Math.round(shown)))}
        </Text>
        <Text variant="callout" tone="muted">
          {unit}
        </Text>
      </View>
      <View style={styles.paceLine}>
        <View style={styles.paceWord}>
          <Icon name={copy.icon} size={theme.sizes.iconSm} tone={copy.iconTone} />
          <Text variant="label" tone={copy.tone} numberOfLines={1}>
            {copy.word}
          </Text>
        </View>
        <Text variant="callout" tone="muted">
          {spentPct}% spent, {monthPct}% of month gone
        </Text>
      </View>

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
        <Stat label="Spent" value={formatMoney(spent)} />
        <Stat label="Left" value={formatMoney(left)} />
        <Stat label="Budget" value={formatMoneyShort(limit)} />
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="label" style={styles.tabular}>
        {value}
      </Text>
    </View>
  );
}

function BudgetsSection({
  budgets,
  calendarRatio,
}: {
  budgets: BudgetSummary[];
  calendarRatio: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const ranked = rankBudgets(budgets, calendarRatio);
  const overCount = ranked.filter((b) => b.pace === 'over').length;
  const aboveCount = ranked.filter((b) => b.pace === 'above').length;
  const shown = expanded ? ranked : ranked.slice(0, BUDGETS_COLLAPSED);

  let detail = 'All on track';
  let detailTone: 'muted' | 'dangerText' | 'warningText' = 'muted';
  if (overCount > 0) {
    detail = `${overCount} over${aboveCount > 0 ? ` · ${aboveCount} above pace` : ''}`;
    detailTone = 'dangerText';
  } else if (aboveCount > 0) {
    detail = `${aboveCount} above pace`;
    detailTone = 'warningText';
  }

  return (
    <>
      <View style={[styles.sectionHeader, styles.sectionHeaderPadded]}>
        <Text variant="headline">Budgets</Text>
        <Text variant="caption" tone={detailTone} style={styles.semibold}>
          {detail}
        </Text>
      </View>
      <View style={styles.bleed}>
        {shown.map((b) => (
          <BudgetRow
            key={b.categoryId}
            budget={b}
            calendarRatio={calendarRatio}
            onPress={openCategory}
          />
        ))}
      </View>
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

function RecentSection({ items }: { items: TransactionListItem[] }) {
  const save = useSaveTransaction();
  const retry = useCallback(
    (item: TransactionListItem) =>
      save.mutate({
        id: item.id,
        amountCents: item.amountCents,
        categoryId: item.categoryId,
        note: item.note,
        occurredAt: item.occurredAt,
      }),
    [save],
  );

  const groups: { day: number; total: number; items: TransactionListItem[] }[] = [];
  for (const item of items) {
    const day = startOfDay(item.occurredAt);
    let group = groups.find((g) => g.day === day);
    if (!group) {
      group = { day, total: 0, items: [] };
      groups.push(group);
    }
    group.total += item.amountCents;
    group.items.push(item);
  }

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text variant="headline">Recent</Text>
        <TextButton label="See all" onPress={openAll} />
      </View>
      {groups.length === 0 ? (
        <Text variant="callout" tone="muted" style={styles.emptyLine}>
          Nothing logged yet this month. Expenses you add show up here.
        </Text>
      ) : (
        groups.map((g) => (
          <View key={g.day}>
            <View style={styles.dayHeader}>
              <Text variant="caption" tone="muted" style={styles.semibold}>
                {formatDayLabel(g.day)}
              </Text>
              <Text variant="caption" tone="muted" style={styles.tabular}>
                {formatMoney(g.total)}
              </Text>
            </View>
            <View style={styles.bleed}>
              {g.items.map((t) => (
                <TransactionRow
                  key={t.id}
                  item={t}
                  onPress={openTransaction}
                  onRetry={retry}
                  showDate={false}
                />
              ))}
            </View>
          </View>
        ))
      )}
    </>
  );
}

function NoBudgets({ month, recent }: { month: string; recent: TransactionListItem[] }) {
  const entering = useEntering();
  return (
    <Animated.View entering={entering(0)}>
      <Text variant="callout" tone="muted">
        No budget for {formatMonthName(month)} yet
      </Text>
      <Text variant="title" style={styles.emptyTitle}>
        Give each category a limit. Flow works out what&apos;s safe to spend each day.
      </Text>
      <View style={styles.emptyAction}>
        {/* TODO: route to budget setup once that screen exists. */}
        <Button label="Set up budgets" onPress={() => toast.info('Budget setup is coming soon')} />
      </View>
      <View style={styles.section}>
        {recent.length > 0 ? (
          <RecentSection items={recent} />
        ) : (
          <>
            <View style={[styles.sectionHeader, styles.sectionHeaderPadded]}>
              <Text variant="headline">Recent</Text>
            </View>
            <Text variant="callout" tone="muted" style={styles.emptyLine}>
              No transactions yet.
            </Text>
          </>
        )}
      </View>
    </Animated.View>
  );
}

function LoadFailed({ month, onRetry }: { month: string; onRetry: () => void }) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.error}>
      <View style={styles.errorTitle}>
        <Icon name={CLOUD_OFF_ICON} size={theme.sizes.iconControl} tone="muted" />
        <Text variant="headline">Couldn&apos;t load {formatMonthName(month)}</Text>
      </View>
      <Text variant="callout" tone="muted">
        Check your connection and try again. Expenses you&apos;ve already added aren&apos;t
        affected.
      </Text>
      <View style={styles.errorAction}>
        <Button label="Try again" variant="secondary" onPress={onRetry} />
      </View>
    </View>
  );
}

function TextButton({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.textButton, style, pressed && styles.textButtonPressed]}
    >
      <Text variant="label" tone="primary">
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  root: { flex: 1, paddingTop: rt.insets.top, backgroundColor: theme.colors.background },
  content: {
    paddingHorizontal: theme.space.xl,
    // Clears the docked Add expense button; the tab bar is handled by the automatic inset.
    paddingBottom: theme.sizes.controlHeight + theme.space.md * 2 + theme.space.xl,
  },
  // Rows cancel the gutter so their press state runs edge to edge.
  bleed: { marginHorizontal: -theme.space.xl },
  section: { marginTop: theme.space.xxxl },
  heroValue: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: theme.space.sm,
    marginTop: theme.space.xs,
  },
  paceLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.space.sm,
    marginTop: theme.space.sm,
  },
  paceWord: { flexDirection: 'row', alignItems: 'center', gap: theme.space.xs },
  ruler: { marginTop: theme.space.xxl },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.space.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  stat: {
    flexGrow: 1,
    flexBasis: theme.sizes.statMinWidth,
    gap: theme.space.xxs,
    paddingVertical: theme.space.md,
  },
  tabular: { fontVariant: ['tabular-nums'] },
  semibold: { fontWeight: theme.typography.label.fontWeight },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  sectionHeaderPadded: { alignItems: 'baseline', paddingBottom: theme.space.sm },
  textButton: { minHeight: theme.sizes.hitTarget, justifyContent: 'center' },
  textButtonPressed: { opacity: 0.55 },
  moreButton: { alignSelf: 'flex-start', paddingVertical: theme.space.md },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.space.lg,
    paddingBottom: theme.space.xs,
  },
  emptyLine: { paddingVertical: theme.space.lg },
  emptyTitle: { marginTop: theme.space.sm, maxWidth: theme.sizes.readableMaxWidth },
  emptyAction: { marginTop: theme.space.xl },
  error: {
    paddingTop: theme.space.xl,
    gap: theme.space.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  errorTitle: { flexDirection: 'row', alignItems: 'center', gap: theme.space.sm },
  errorAction: { marginTop: theme.space.xl, alignSelf: 'flex-start' },
}));
