import { getLocales } from 'expo-localization';

const locale = getLocales()[0];
const currency = locale?.currencyCode ?? 'USD';

const moneyFormatter = new Intl.NumberFormat(locale?.languageTag, {
  style: 'currency',
  currency,
});
const dateFormatter = new Intl.DateTimeFormat(locale?.languageTag, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const monthFormatter = new Intl.DateTimeFormat(locale?.languageTag, {
  month: 'long',
  year: 'numeric',
});

export const formatMoney = (cents: number) => moneyFormatter.format(cents / 100);

export const formatDate = (ms: number) => dateFormatter.format(ms);

export const formatMonth = (month: string) =>
  monthFormatter.format(new Date(`${month}-01T00:00:00`));

/** Current calendar month as YYYY-MM in local time. */
export function currentMonth(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function monthRange(month: string) {
  const [year, m] = month.split('-').map(Number);
  return { start: new Date(year, m - 1, 1).getTime(), end: new Date(year, m, 1).getTime() };
}

/** Parses user input like "12.5" or "12,50" into integer cents. */
export function parseAmountToCents(input: string): number | null {
  const normalized = input.replace(',', '.').trim();
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return null;
  const cents = Math.round(Number(normalized) * 100);
  return cents > 0 ? cents : null;
}

/** Where `now` sits inside its calendar month; days left includes today. */
export function monthProgress(now = new Date()) {
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const day = now.getDate();
  return { day, daysInMonth, daysLeft: daysInMonth - day + 1 };
}
