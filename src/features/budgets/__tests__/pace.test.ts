import type { BudgetSummary } from '@/features/transactions/api/transactions-repo';

import { paceOf, rankBudgets, safeToSpendPerDay } from '../api/pace';

const budget = (categoryId: string, spentCents: number, limitCents: number): BudgetSummary => ({
  categoryId,
  name: categoryId,
  color: '#000000',
  icon: 'bag.fill',
  spentCents,
  limitCents,
});

describe('paceOf', () => {
  const calendar = 18 / 31;

  it('flags spending over the limit', () => {
    expect(paceOf(26840, 25000, calendar)).toBe('over');
  });

  it('flags spending more than 5 points ahead of the calendar', () => {
    expect(paceOf(32000, 50000, calendar)).toBe('above');
  });

  it('treats spending near the calendar as on track', () => {
    expect(paceOf(14200, 25000, calendar)).toBe('ok');
  });
});

describe('rankBudgets', () => {
  it('sorts over, then above pace, then by spent ratio, and skips unbudgeted categories', () => {
    const ranked = rankBudgets(
      [
        budget('health', 9000, 25000),
        budget('groceries', 32000, 50000),
        budget('dining', 26840, 25000),
        budget('transport', 14200, 25000),
        budget('other', 500, 0),
      ],
      18 / 31,
    );
    expect(ranked.map((b) => b.categoryId)).toEqual(['dining', 'groceries', 'transport', 'health']);
  });
});

describe('safeToSpendPerDay', () => {
  it('splits what is left across the remaining days', () => {
    expect(safeToSpendPerDay(148620, 240000, 14)).toBeCloseTo(6527.14, 2);
  });

  it('never goes negative', () => {
    expect(safeToSpendPerDay(300000, 240000, 6)).toBe(0);
  });
});
