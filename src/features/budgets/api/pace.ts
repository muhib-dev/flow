import type { BudgetSummary } from '@/features/transactions/api/transactions-repo';

/** How far spending may run ahead of the calendar before we call it "above pace". */
export const PACE_TOLERANCE = 0.05;

export type Pace = 'ok' | 'above' | 'over';

/** `calendarRatio` is day ÷ daysInMonth. */
export function paceOf(spentCents: number, limitCents: number, calendarRatio: number): Pace {
  if (spentCents > limitCents) return 'over';
  if (limitCents > 0 && spentCents / limitCents > calendarRatio + PACE_TOLERANCE) return 'above';
  return 'ok';
}

const RANK: Record<Pace, number> = { over: 0, above: 1, ok: 2 };

export type RankedBudget = BudgetSummary & { pace: Pace; ratio: number };

/** Over first, then above pace, then the rest; ties go to the higher spent ÷ limit. */
export function rankBudgets(budgets: BudgetSummary[], calendarRatio: number): RankedBudget[] {
  return budgets
    .filter((b) => b.limitCents > 0)
    .map((b) => ({
      ...b,
      pace: paceOf(b.spentCents, b.limitCents, calendarRatio),
      ratio: b.spentCents / b.limitCents,
    }))
    .sort((a, b) => RANK[a.pace] - RANK[b.pace] || b.ratio - a.ratio);
}

/** Safe-to-spend per day for the rest of the month, today included. */
export function safeToSpendPerDay(spentCents: number, limitCents: number, daysLeft: number) {
  return Math.max(0, limitCents - spentCents) / Math.max(1, daysLeft);
}
