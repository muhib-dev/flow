import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/design-system';
import { FILL_EASING } from '@/design-system/progress-bar';
import { formatShortDay, monthRange } from '@/lib/format';

import type { Pace } from '../api/pace';

const FILL_MS = 800;
const OVERFLOW_MS = 500;
const OVERFLOW_DELAY_MS = 600;
/** Every 7th day gets a taller tick, starting at day 1. */
const WEEK = 7;
/** Near the edges the Today label anchors to its marker instead of centering on it. */
const LABEL_ANCHOR_LEFT = 12;
const LABEL_ANCHOR_RIGHT = 88;
const HIDE_START_AT = 20;
const HIDE_END_AT = 75;

type MonthRulerProps = {
  month: string;
  day: number;
  daysInMonth: number;
  spentCents: number;
  limitCents: number;
  pace: Pace;
};

/** Spending against the month: the fill is money spent, the ticks and marker are days gone. */
export function MonthRuler({
  month,
  day,
  daysInMonth,
  spentCents,
  limitCents,
  pace,
}: MonthRulerProps) {
  const over = pace === 'over';
  // Over budget, the scale becomes `spent`, so the limit and the calendar shrink to fit.
  const scale = over ? limitCents / spentCents : 1;
  const fillPct = over
    ? scale * 100
    : Math.min(1, limitCents > 0 ? spentCents / limitCents : 0) * 100;
  const overflowPct = over ? 100 - scale * 100 : 0;
  const todayPct = (day / daysInMonth) * scale * 100;

  const fill = useSharedValue(0);
  const overflow = useSharedValue(0);
  const today = useSharedValue(0);
  useEffect(() => {
    const timing = { duration: FILL_MS, easing: FILL_EASING };
    fill.set(withTiming(fillPct, timing));
    today.set(withTiming(todayPct, timing));
    overflow.set(
      withDelay(
        OVERFLOW_DELAY_MS,
        withTiming(overflowPct, { duration: OVERFLOW_MS, easing: FILL_EASING }),
      ),
    );
  }, [fill, fillPct, overflow, overflowPct, today, todayPct]);

  const [labelWidth, setLabelWidth] = useState(0);
  const anchor = todayPct < LABEL_ANCHOR_LEFT ? 0 : todayPct > LABEL_ANCHOR_RIGHT ? 1 : 0.5;

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.get()}%` }));
  const overflowStyle = useAnimatedStyle(() => ({ width: `${overflow.get()}%` }));
  const markerStyle = useAnimatedStyle(() => ({ left: `${today.get()}%` }));
  const labelStyle = useAnimatedStyle(() => ({
    left: `${today.get()}%`,
    transform: [{ translateX: -labelWidth * anchor }],
  }));

  const { start, end } = monthRange(month);
  const lastDay = end - 1;

  return (
    <View
      style={styles.root}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.track}>
        <Animated.View style={[styles.fill(pace === 'above'), fillStyle]} />
        <Animated.View style={[styles.overflow(scale * 100), overflowStyle]} />
      </View>
      <View style={styles.ticks}>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const major = d === 1 || i % WEEK === 0 || d === daysInMonth;
          return (
            <View
              key={d}
              style={styles.tick((i / (daysInMonth - 1)) * 100 * scale, major, d <= day)}
            />
          );
        })}
      </View>
      <Animated.View style={[styles.marker, markerStyle]} />
      <View style={styles.labels}>
        {todayPct > HIDE_START_AT ? (
          <Text variant="caption" tone="muted" style={styles.start}>
            {formatShortDay(start)}
          </Text>
        ) : null}
        <Animated.View
          style={[styles.today, labelStyle]}
          onLayout={(e) => setLabelWidth(e.nativeEvent.layout.width)}
        >
          <Text variant="caption" style={styles.todayText} numberOfLines={1}>
            Today · {day}
          </Text>
        </Animated.View>
        {todayPct < HIDE_END_AT ? (
          <Text variant="caption" tone="muted" style={styles.end}>
            {formatShortDay(lastDay)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { gap: theme.space.xs },
  track: {
    height: theme.sizes.progressHeight,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: (above: boolean) => ({
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: above ? theme.colors.warning : theme.colors.primary,
  }),
  overflow: (left: number) => ({
    position: 'absolute',
    left: `${left}%`,
    top: 0,
    bottom: 0,
    backgroundColor: theme.colors.danger,
  }),
  ticks: { height: theme.sizes.tickMajor },
  tick: (x: number, major: boolean, past: boolean) => ({
    position: 'absolute',
    top: 0,
    left: `${x}%`,
    width: theme.sizes.tick,
    height: major ? theme.sizes.tickMajor : theme.sizes.tickMinor,
    backgroundColor: past ? theme.colors.textMuted : theme.colors.border,
  }),
  marker: {
    position: 'absolute',
    top: -theme.space.sm,
    width: theme.sizes.rulerMarkerWidth,
    height: theme.sizes.rulerMarkerHeight,
    marginLeft: -theme.sizes.rulerMarkerWidth / 2,
    backgroundColor: theme.colors.text,
  },
  labels: { height: theme.typography.caption.lineHeight },
  start: { position: 'absolute', left: 0 },
  end: { position: 'absolute', right: 0 },
  today: { position: 'absolute', top: 0 },
  todayText: { fontWeight: theme.typography.label.fontWeight },
}));
