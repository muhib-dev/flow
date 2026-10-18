import { groupByDay } from '../api/group-by-day';
import type { TransactionListItem } from '../api/transactions-repo';

const tx = (id: string, occurredAt: Date, amountCents: number): TransactionListItem => ({
  id,
  amountCents,
  occurredAt: occurredAt.getTime(),
  note: '',
  syncStatus: 'synced',
  categoryId: 'food',
  categoryName: 'Food',
  categoryColor: '#000000',
  categoryIcon: 'fork.knife',
});

describe('groupByDay', () => {
  it('groups consecutive transactions by local day and totals them', () => {
    const groups = groupByDay([
      tx('a', new Date(2026, 9, 18, 20), 4218),
      tx('b', new Date(2026, 9, 18, 8), 1850),
      tx('c', new Date(2026, 9, 17, 19), 6400),
    ]);
    expect(groups.map((g) => [g.items.map((t) => t.id), g.totalCents])).toEqual([
      [['a', 'b'], 6068],
      [['c'], 6400],
    ]);
  });
});
