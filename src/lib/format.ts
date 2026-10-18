import { getLocales } from 'expo-localization';

const locale = getLocales()[0];

/** The device's currency; the user can override it in Settings. */
export const deviceCurrency = locale?.currencyCode ?? 'USD';

let moneyFormatter = buildMoneyFormatter(deviceCurrency, false);
let wholeMoneyFormatter = buildMoneyFormatter(deviceCurrency, true);

function buildMoneyFormatter(code: string, whole: boolean) {
  return new Intl.NumberFormat(locale?.languageTag, {
    style: 'currency',
    currency: code,
    ...(whole ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : null),
  });
}

/** Display currency for every amount. Amounts are stored as plain cents, so nothing converts. */
export function setCurrency(code: string) {
  moneyFormatter = buildMoneyFormatter(code, false);
  wholeMoneyFormatter = buildMoneyFormatter(code, true);
}

/** "$" for USD, "€" for EUR, in the device locale. */
export function currencySymbol(code: string) {
  const parts = new Intl.NumberFormat(locale?.languageTag, {
    style: 'currency',
    currency: code,
  }).formatToParts(0);
  return parts.find((p) => p.type === 'currency')?.value ?? code;
}
const dateFormatter = new Intl.DateTimeFormat(locale?.languageTag, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const monthFormatter = new Intl.DateTimeFormat(locale?.languageTag, {
  month: 'long',
  year: 'numeric',
});
const monthNameFormatter = new Intl.DateTimeFormat(locale?.languageTag, { month: 'long' });
const shortDayFormatter = new Intl.DateTimeFormat(locale?.languageTag, {
  day: 'numeric',
  month: 'short',
});
const weekdayDayFormatter = new Intl.DateTimeFormat(locale?.languageTag, {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

const DAY_MS = 24 * 60 * 60 * 1000;

export const formatMoney = (cents: number) => moneyFormatter.format(cents / 100);

/** Drops the cents when the amount is whole: "$180", "$18.40". */
export const formatMoneyShort = (cents: number) =>
  Math.round(cents) % 100 === 0 ? wholeMoneyFormatter.format(cents / 100) : formatMoney(cents);

export const formatDate = (ms: number) => dateFormatter.format(ms);

export const formatMonth = (month: string) =>
  monthFormatter.format(new Date(`${month}-01T00:00:00`));

/** "October" for "2026-10". */
export const formatMonthName = (month: string) =>
  monthNameFormatter.format(new Date(`${month}-01T00:00:00`));

/** "Oct 16". */
export const formatShortDay = (ms: number) => shortDayFormatter.format(ms);

/** Start of the local calendar day containing `ms`. */
export function startOfDay(ms: number) {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** "Today", "Yesterday", otherwise "Fri, Oct 16". */
export function formatDayLabel(ms: number, now = Date.now()) {
  const days = Math.round((startOfDay(now) - startOfDay(ms)) / DAY_MS);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return weekdayDayFormatter.format(ms);
}

/** YYYY-MM for the month `offset` months away from `month`. */
export function shiftMonth(month: string, offset: number) {
  const [year, m] = month.split('-').map(Number);
  return currentMonth(new Date(year, m - 1 + offset, 1));
}

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

/** "muhib.ullah@x.com" → "MU". */
export function initialsOf(email: string | null) {
  const local = email?.split('@')[0] ?? '';
  const parts = local.split(/[._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : local.slice(0, 2);
  return letters.toUpperCase();
}
