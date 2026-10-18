const space = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  /** Screen side gutter: cards sit inset from the edges. */
  gutter: 16,
  /** Gap between stacked sections on a screen. */
  section: 28,
} as const;

const radius = { xs: 2, sm: 6, md: 10, lg: 14, xl: 24, card: 20, pill: 999 } as const;

const typography = {
  heroNumber: {
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '700',
    letterSpacing: -1.4,
    fontVariant: ['tabular-nums'],
  },
  largeNumber: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700',
    letterSpacing: -0.9,
    fontVariant: ['tabular-nums'],
  },
  display: { fontSize: 34, lineHeight: 41, fontWeight: '700', letterSpacing: -0.6 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.3 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '500' },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  callout: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  overline: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
} as const;

const weights = { regular: '400', medium: '500', semibold: '600', bold: '700' } as const;

const sizes = {
  hitTarget: 44,
  controlHeight: 52,
  progressHeight: 8,
  progressHeightSm: 6,
  tick: 1,
  tickMinor: 4,
  tickMajor: 8,
  paceTick: 10,
  rulerMarker: 12,
  swatchSm: 8,
  avatar: 36,
  avatarLg: 56,
  listRow: 64,
  listRowCompact: 52,
  fabHeight: 56,
  statMinWidth: 88,
  iconXs: 13,
  iconSm: 16,
  iconControl: 20,
  iconMd: 24,
  iconLg: 28,
  formMaxWidth: 420,
  readableMaxWidth: 300,
  categoryBadge: 40,
  iconBadgeSm: 30,
  emptyBadge: 64,
  focusRing: 3,
  donut: 208,
  donutStroke: 22,
  barChartHeight: 148,
  barGap: 3,
  dockFade: 24,
} as const;

const motion = {
  enterMs: 420,
  staggerMs: 70,
  fillMs: 700,
  barDelayMs: 150,
  chartMs: 900,
  pressScale: 0.97,
} as const;

const opacity = { pressed: 0.6, disabled: 0.4, dimmed: 0.45 } as const;

const shared = { space, radius, typography, weights, sizes, motion, opacity };

/** Seed category hex → themed value, so stored colors stay stable while the palette adapts. */
type CategoryPalette = Record<string, string>;

export const lightTheme = {
  ...shared,
  colors: {
    background: '#F3F4F6',
    surface: '#FFFFFF',
    surfaceMuted: '#EEF0F3',
    border: '#E4E7EB',
    separator: 'rgba(11,18,32,0.08)',
    text: '#0B1220',
    textMuted: '#5E6875',
    textSubtle: '#8A939F',
    // #087F5B keeps 5:1 against white so it works for copy and filled buttons.
    primary: '#087F5B',
    primaryMuted: 'rgba(8,127,91,0.10)',
    onPrimary: '#FFFFFF',
    onPrimaryMuted: 'rgba(255,255,255,0.72)',
    // Deep hero surface and the colors that sit on it.
    ink: '#0F1724',
    onInk: '#F5F7FA',
    onInkMuted: 'rgba(245,247,250,0.62)',
    inkTrack: 'rgba(255,255,255,0.12)',
    inkAccent: '#3DDC97',
    danger: '#E5484D',
    // Base danger/warning fail WCAG AA as small text on white; use these for copy.
    dangerText: '#C62A2F',
    dangerMuted: 'rgba(229,72,77,0.12)',
    onDanger: '#FFFFFF',
    success: '#12A16B',
    successText: '#067647',
    successMuted: 'rgba(18,161,107,0.12)',
    warning: '#F5A524',
    warningText: '#9A5800',
    warningMuted: 'rgba(245,165,36,0.16)',
    overlay: 'rgba(0,0,0,0.4)',
  },
  categories: {
    '#F59E0B': '#E38B0B',
    '#3B82F6': '#2F6FED',
    '#EC4899': '#DB4A86',
    '#8B5CF6': '#7656F0',
    '#10B981': '#12A16B',
    '#6B7280': '#64748B',
  } as CategoryPalette,
  shadows: {
    card: '0px 1px 2px rgba(15,23,36,0.04), 0px 4px 16px rgba(15,23,36,0.05)',
    hero: '0px 8px 24px rgba(15,23,36,0.18)',
    popover: '0px 8px 24px rgba(15,23,36,0.12)',
    fab: '0px 2px 6px rgba(8,127,91,0.25), 0px 8px 20px rgba(8,127,91,0.20)',
  },
} as const;

export const darkTheme = {
  ...shared,
  colors: {
    background: '#07090C',
    surface: '#12161C',
    surfaceMuted: '#1B2028',
    border: '#232A33',
    separator: 'rgba(255,255,255,0.07)',
    text: '#F3F5F8',
    textMuted: '#9AA3AF',
    textSubtle: '#6B7480',
    primary: '#34D399',
    primaryMuted: 'rgba(52,211,153,0.14)',
    onPrimary: '#03140D',
    onPrimaryMuted: 'rgba(3,20,13,0.72)',
    ink: '#161C24',
    onInk: '#F5F7FA',
    onInkMuted: 'rgba(245,247,250,0.6)',
    inkTrack: 'rgba(255,255,255,0.1)',
    inkAccent: '#34D399',
    danger: '#FF6369',
    dangerText: '#FF6369',
    dangerMuted: 'rgba(255,99,105,0.16)',
    onDanger: '#FFFFFF',
    success: '#3DD68C',
    successText: '#3DD68C',
    successMuted: 'rgba(61,214,140,0.14)',
    warning: '#FFB224',
    warningText: '#FFB224',
    warningMuted: 'rgba(255,178,36,0.16)',
    overlay: 'rgba(0,0,0,0.6)',
  },
  categories: {
    '#F59E0B': '#F5B14C',
    '#3B82F6': '#6E9BFF',
    '#EC4899': '#F27AA8',
    '#8B5CF6': '#A28CFF',
    '#10B981': '#3DD68C',
    '#6B7280': '#94A3B8',
  } as CategoryPalette,
  shadows: {
    card: '0px 0px 0px rgba(0,0,0,0)',
    hero: '0px 0px 0px rgba(0,0,0,0)',
    popover: '0px 8px 24px rgba(0,0,0,0.5)',
    fab: '0px 2px 6px rgba(0,0,0,0.4), 0px 8px 20px rgba(0,0,0,0.3)',
  },
} as const;

export type AppTheme = typeof lightTheme | typeof darkTheme;

/** Themed version of a stored category color; unknown colors pass through. */
export function categoryColor(theme: AppTheme, stored: string) {
  return theme.categories[stored.toUpperCase()] ?? stored;
}

/** `#RRGGBB` (or `#RGB`) → `rgba(r,g,b,alpha)`. Other formats are returned unchanged. */
export function withAlpha(color: string, alpha: number) {
  const hex = color.replace('#', '');
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
  if (!/^[0-9a-f]{6}$/i.test(full)) return color;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export const breakpoints = { xs: 0, sm: 380, md: 600, lg: 900, xl: 1200 } as const;
