import { monthRange, startOfDay } from '@/lib/format';

export type DaySpend = { day: number; date: number; totalCents: number };

/** Totals per calendar day of `month`, one entry per day including empty ones. */
export function dailyTotals(
  rows: { amountCents: number; occurredAt: number }[],
  month: string,
): DaySpend[] {
  const { start, end } = monthRange(month);
  const days: DaySpend[] = [];
  for (let d = new Date(start); d.getTime() < end; d.setDate(d.getDate() + 1)) {
    days.push({ day: d.getDate(), date: d.getTime(), totalCents: 0 });
  }
  for (const row of rows) {
    if (row.occurredAt < start || row.occurredAt >= end) continue;
    const index = new Date(startOfDay(row.occurredAt)).getDate() - 1;
    days[index].totalCents += row.amountCents;
  }
  return days;
}

/** Mean daily spend over the days that have passed (all of them for a past month). */
export function averagePerDay(days: DaySpend[], now = Date.now()) {
  const elapsed = days.filter((d) => d.date <= now);
  if (elapsed.length === 0) return 0;
  return elapsed.reduce((sum, d) => sum + d.totalCents, 0) / elapsed.length;
}
