const space = { none: 0, xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

const radius = { xs: 2, sm: 6, md: 10, lg: 16, xl: 24, pill: 999 } as const;

const typography = {
  largeNumber: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  display: { fontSize: 34, lineHeight: 41, fontWeight: '700', letterSpacing: -0.6 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  callout: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
} as const;

const sizes = {
  hitTarget: 44,
  controlHeight: 52,
  progressHeight: 8,
  progressHeightSm: 4,
  tick: 1,
  tickMinor: 4,
  tickMajor: 8,
  paceTick: 10,
  rulerMarkerWidth: 2,
  rulerMarkerHeight: 28,
  swatchSm: 8,
  avatar: 32,
  listRow: 60,
  fabHeight: 56,
  menuWidth: 232,
  statMinWidth: 96,
  iconSm: 16,
  iconControl: 20,
  iconMd: 24,
  formMaxWidth: 420,
  readableMaxWidth: 300,
  categoryBadge: 40,
  focusRing: 3,
} as const;

const shared = { space, radius, typography, sizes };

export const lightTheme = {
  ...shared,
  colors: {
    background: '#F6F7FB',
    surface: '#FFFFFF',
    surfaceMuted: '#EEEFF4',
    border: '#E3E4EC',
    text: '#0F1020',
    textMuted: '#6B6D80',
    primary: '#4F46E5',
    primaryMuted: 'rgba(79,70,229,0.10)',
    onPrimary: '#FFFFFF',
    onPrimaryMuted: 'rgba(255,255,255,0.72)',
    danger: '#E5484D',
    // Base danger/warning fail WCAG AA as small text on white; use these for copy.
    dangerText: '#C62A2F',
    onDanger: '#FFFFFF',
    success: '#30A46C',
    warning: '#F5A524',
    warningText: '#9A5800',
    overlay: 'rgba(0,0,0,0.4)',
  },
  shadows: {
    popover: '0px 8px 24px rgba(15,16,32,0.12)',
    fab: '0px 1px 3px rgba(15,16,32,0.2), 0px 4px 8px rgba(15,16,32,0.12)',
  },
} as const;

export const darkTheme = {
  ...shared,
  colors: {
    background: '#09090B',
    surface: '#141417',
    surfaceMuted: '#1F1F25',
    border: '#2A2A32',
    text: '#F4F4F6',
    textMuted: '#A0A1B0',
    primary: '#6366F1',
    primaryMuted: 'rgba(129,140,248,0.16)',
    onPrimary: '#FFFFFF',
    onPrimaryMuted: 'rgba(255,255,255,0.72)',
    danger: '#FF6369',
    dangerText: '#FF6369',
    onDanger: '#FFFFFF',
    success: '#3DD68C',
    warning: '#FFB224',
    warningText: '#FFB224',
    overlay: 'rgba(0,0,0,0.6)',
  },
  shadows: {
    popover: '0px 8px 24px rgba(0,0,0,0.5)',
    fab: '0px 1px 3px rgba(0,0,0,0.4), 0px 4px 8px rgba(0,0,0,0.3)',
  },
} as const;

export const breakpoints = { xs: 0, sm: 380, md: 600, lg: 900, xl: 1200 } as const;
