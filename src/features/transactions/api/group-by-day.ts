import { startOfDay } from '@/lib/format';

import type { TransactionListItem } from './transactions-repo';

export type DayGroup = { day: number; totalCents: number; items: TransactionListItem[] };

/** Groups newest-first transactions by local calendar day, keeping order. */
export function groupByDay(items: TransactionListItem[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const item of items) {
    const day = startOfDay(item.occurredAt);
    let group = groups.at(-1);
    if (group?.day !== day) {
      group = { day, totalCents: 0, items: [] };
      groups.push(group);
    }
    group.totalCents += item.amountCents;
    group.items.push(item);
  }
  return groups;
}
