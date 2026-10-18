import {
  currentMonth,
  formatDayLabel,
  formatMoneyShort,
  monthProgress,
  monthRange,
  parseAmountToCents,
  shiftMonth,
} from '../format';

describe('parseAmountToCents', () => {
  it.each([
    ['12', 1200],
    ['12.5', 1250],
    ['12,50', 1250],
    ['0.01', 1],
  ])('parses %s', (input, cents) => {
    expect(parseAmountToCents(input)).toBe(cents);
  });

  it.each(['', '0', 'abc', '1.234', '-5'])('rejects %s', (input) => {
    expect(parseAmountToCents(input)).toBeNull();
  });
});

describe('months', () => {
  it('formats the current month as YYYY-MM', () => {
    expect(currentMonth(new Date(2026, 0, 31))).toBe('2026-01');
  });

  it('spans the whole month', () => {
    const { start, end } = monthRange('2026-02');
    expect(new Date(start).getDate()).toBe(1);
    expect(new Date(end).getMonth()).toBe(2);
  });

  it('counts today as a day left', () => {
    expect(monthProgress(new Date(2026, 1, 1))).toEqual({ day: 1, daysInMonth: 28, daysLeft: 28 });
    expect(monthProgress(new Date(2026, 9, 31))).toEqual({ day: 31, daysInMonth: 31, daysLeft: 1 });
  });
});

describe('formatMoneyShort', () => {
  it('drops cents only for whole amounts', () => {
    expect(formatMoneyShort(18000)).toBe('$180');
    expect(formatMoneyShort(1840)).toBe('$18.40');
  });
});

describe('formatDayLabel', () => {
  const now = new Date(2026, 9, 18, 15).getTime();

  it('names today and yesterday', () => {
    expect(formatDayLabel(new Date(2026, 9, 18, 1).getTime(), now)).toBe('Today');
    expect(formatDayLabel(new Date(2026, 9, 17, 23).getTime(), now)).toBe('Yesterday');
  });

  it('falls back to weekday and date', () => {
    expect(formatDayLabel(new Date(2026, 9, 16).getTime(), now)).toBe('Fri, Oct 16');
  });
});

describe('shiftMonth', () => {
  it('crosses year boundaries', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
  });
});
