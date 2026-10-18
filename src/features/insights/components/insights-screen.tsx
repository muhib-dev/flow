import { useMonthSummary } from '@/features/budgets/hooks/use-month-summary';
import {
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  ProgressBar,
  Screen,
  Text,
} from '@/design-system';
import { formatMoney, formatMonth, currentMonth } from '@/lib/format';

/** Category breakdown for the month. Phase 3 adds the scrubbable chart. */
export function InsightsScreen() {
  const month = currentMonth();
  const { data, isPending, isError, error, refetch } = useMonthSummary(month);

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState message={error.message} onRetry={() => void refetch()} />;

  const total = data.reduce((sum, b) => sum + b.spentCents, 0);
  if (total === 0) {
    return (
      <EmptyState title="Nothing to analyse yet" message="Insights appear once you log expenses." />
    );
  }

  const ranked = [...data]
    .filter((b) => b.spentCents > 0)
    .sort((a, b) => b.spentCents - a.spentCents);

  return (
    <Screen scroll>
      <Card>
        <Text variant="caption" tone="muted">
          {formatMonth(month)}
        </Text>
        <Text variant="title">Where your money went</Text>
        {ranked.map((b) => (
          <Card key={b.categoryId}>
            <Text variant="callout">
              {b.name} · {formatMoney(b.spentCents)} ({Math.round((b.spentCents / total) * 100)}%)
            </Text>
            <ProgressBar value={b.spentCents / total} color={b.color} />
          </Card>
        ))}
      </Card>
    </Screen>
  );
}
