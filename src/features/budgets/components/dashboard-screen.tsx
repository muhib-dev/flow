import { router } from 'expo-router';
import { Fragment, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  ProgressBar,
  Screen,
  Text,
} from '@/design-system';
import { TransactionRow } from '@/features/transactions/components/transaction-row';
import { useTransactions } from '@/features/transactions/hooks/use-transactions';
import { currentMonth, formatMoney, formatMonth, monthProgress } from '@/lib/format';

import { useMonthSummary } from '../hooks/use-month-summary';
import { BudgetRow } from './budget-row';

const RECENT_LIMIT = 5;
const ENTER_STAGGER_MS = 80;
/** How far spending may run ahead of the calendar before we call it "above pace". */
const PACE_TOLERANCE = 0.05;

const PLUS_ICON = { ios: 'plus', android: 'add', web: 'add' } as const;

export function DashboardScreen() {
  const { theme } = useUnistyles();
  const month = currentMonth();
  const summary = useMonthSummary(month);
  const recent = useTransactions({ limit: RECENT_LIMIT });

  const openCategory = useCallback((id: string) => {
    router.push({ pathname: '/category/[id]', params: { id } });
  }, []);
  const openTransaction = useCallback((id: string) => {
    router.push({ pathname: '/transaction/[id]', params: { id } });
  }, []);
  const addExpense = useCallback(() => router.push('/add'), []);

  if (summary.isPending || recent.isPending) return <LoadingState />;
  if (summary.isError || recent.isError) {
    return (
      <ErrorState
        message={(summary.error ?? recent.error)?.message}
        onRetry={() => {
          void summary.refetch();
          void recent.refetch();
        }}
      />
    );
  }

  const spent = summary.data.reduce((total, b) => total + b.spentCents, 0);
  const limit = summary.data.reduce((total, b) => total + b.limitCents, 0);
  const left = Math.max(limit - spent, 0);
  const ratio = limit > 0 ? spent / limit : 0;
  const { day, daysInMonth, daysLeft } = monthProgress();
  const pace =
    ratio > 1 ? 'over' : ratio > day / daysInMonth + PACE_TOLERANCE ? 'ahead' : 'onTrack';
  const overCount = summary.data.filter((b) => b.spentCents > b.limitCents).length;

  return (
    <Screen scroll>
      <Animated.View entering={FadeInDown} style={styles.hero}>
        <View style={[styles.orb, styles.orbTop]} />
        <View style={[styles.orb, styles.orbBottom]} />

        <View style={styles.heroTop}>
          <Text variant="label" tone="onPrimaryMuted">
            {formatMonth(month)}
          </Text>
          <PacePill pace={pace} />
        </View>

        <View>
          <Text variant="caption" tone="onPrimaryMuted">
            Spent this month
          </Text>
          <Text variant="largeNumber" tone="onPrimary" adjustsFontSizeToFit numberOfLines={1}>
            {formatMoney(spent)}
          </Text>
          <Text variant="callout" tone="onPrimaryMuted">
            of {formatMoney(limit)} budget
          </Text>
        </View>

        <ProgressBar value={ratio} color={theme.colors.onPrimary} inverse />

        <View style={styles.stats}>
          <Stat label="Left" value={formatMoney(left)} />
          <View style={styles.statDivider} />
          <Stat label="Per day" value={formatMoney(Math.floor(left / daysLeft))} />
          <View style={styles.statDivider} />
          <Stat label="Days left" value={String(daysLeft)} />
        </View>

        <Button label="Add expense" icon={PLUS_ICON} variant="inverse" onPress={addExpense} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(ENTER_STAGGER_MS)} style={styles.section}>
        <SectionHeader
          title="Budgets"
          detail={overCount > 0 ? `${overCount} over budget` : 'All on track'}
          detailTone={overCount > 0 ? 'danger' : 'muted'}
        />
        <Card>
          {summary.data.map((b) => (
            <BudgetRow key={b.categoryId} budget={b} onPress={openCategory} />
          ))}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(ENTER_STAGGER_MS * 2)} style={styles.section}>
        <SectionHeader
          title="Recent"
          action={recent.data.length > 0 ? { label: 'See all', onPress: openAll } : undefined}
        />
        <Card style={styles.listCard}>
          {recent.data.length === 0 ? (
            <EmptyState
              title="No expenses yet"
              message="Log your first one to see it here."
              actionLabel="Add expense"
              onAction={addExpense}
            />
          ) : (
            recent.data.map((t, i) => (
              <Fragment key={t.id}>
                {i > 0 ? <View style={styles.rowDivider} /> : null}
                <TransactionRow item={t} onPress={openTransaction} />
              </Fragment>
            ))
          )}
        </Card>
      </Animated.View>
    </Screen>
  );
}

function openAll() {
  router.push('/transactions');
}

function PacePill({ pace }: { pace: 'onTrack' | 'ahead' | 'over' }) {
  const { theme } = useUnistyles();
  const copy = {
    onTrack: { label: 'On track', ios: 'checkmark.circle.fill', android: 'check_circle' },
    ahead: { label: 'Above pace', ios: 'speedometer', android: 'speed' },
    over: { label: 'Over budget', ios: 'exclamationmark.triangle.fill', android: 'warning' },
  } as const;
  const { label, ios, android } = copy[pace];
  return (
    <View style={styles.pill}>
      <Icon name={{ ios, android, web: android }} size={theme.sizes.iconSm} tone="onPrimary" />
      <Text variant="caption" tone="onPrimary">
        {label}
      </Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="caption" tone="onPrimaryMuted">
        {label}
      </Text>
      <Text variant="headline" tone="onPrimary" style={styles.tabular} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function SectionHeader({
  title,
  detail,
  detailTone = 'muted',
  action,
}: {
  title: string;
  detail?: string;
  detailTone?: 'muted' | 'danger';
  action?: { label: string; onPress: () => void };
}) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.sectionHeader}>
      <Text variant="title">{title}</Text>
      {detail ? (
        <Text variant="caption" tone={detailTone}>
          {detail}
        </Text>
      ) : null}
      {action ? (
        <Pressable accessibilityRole="button" hitSlop={theme.space.sm} onPress={action.onPress}>
          <Text variant="label" tone="primary">
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  hero: {
    gap: theme.space.lg,
    padding: theme.space.xl,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primary,
    boxShadow: theme.shadows.primary,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    width: theme.sizes.heroOrb,
    height: theme.sizes.heroOrb,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.onPrimaryGlow,
  },
  orbTop: { top: -theme.sizes.heroOrb / 2, right: -theme.sizes.heroOrb / 3 },
  orbBottom: { bottom: -theme.sizes.heroOrb / 2, left: -theme.sizes.heroOrb / 4 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.xs,
    paddingVertical: theme.space.xs,
    paddingHorizontal: theme.space.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.onPrimaryTrack,
  },
  stats: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, gap: theme.space.xxs, alignItems: 'center' },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: theme.colors.onPrimaryTrack,
  },
  tabular: { fontVariant: ['tabular-nums'] },
  section: { gap: theme.space.sm },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: theme.space.xs,
  },
  listCard: { padding: theme.space.none, gap: theme.space.none, overflow: 'hidden' },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
    marginLeft: theme.space.lg + theme.sizes.categoryBadge + theme.space.md,
  },
}));
