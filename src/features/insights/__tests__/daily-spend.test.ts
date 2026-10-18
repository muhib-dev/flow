import { averagePerDay, dailyTotals } from '../api/daily-spend';

const at = (day: number, hour = 12) => new Date(2026, 9, day, hour).getTime();

describe('dailyTotals', () => {
  it('returns one entry per day of the month', () => {
    expect(dailyTotals([], '2026-10')).toHaveLength(31);
    expect(dailyTotals([], '2026-02')).toHaveLength(28);
  });

  it('sums amounts into their local day and ignores other months', () => {
    const days = dailyTotals(
      [
        { amountCents: 500, occurredAt: at(3, 1) },
        { amountCents: 250, occurredAt: at(3, 23) },
        { amountCents: 900, occurredAt: new Date(2026, 10, 1).getTime() },
      ],
      '2026-10',
    );
    expect(days[2]).toMatchObject({ day: 3, totalCents: 750 });
    expect(days.reduce((s, d) => s + d.totalCents, 0)).toBe(750);
  });
});

describe('averagePerDay', () => {
  it('averages only the days that have passed', () => {
    const days = dailyTotals([{ amountCents: 1000, occurredAt: at(1) }], '2026-10');
    expect(averagePerDay(days, at(2, 23))).toBe(500);
  });

  it('is zero before the month starts', () => {
    expect(averagePerDay(dailyTotals([], '2026-10'), at(1) - 86_400_000)).toBe(0);
  });
});
