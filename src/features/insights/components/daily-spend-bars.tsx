import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line, Rect } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { MOTION_EASING, Text } from '@/design-system';
import { formatDayLabel, formatMoney, formatMoneyShort, startOfDay } from '@/lib/format';

import type { DaySpend } from '../api/daily-spend';

const DASH = [4, 4];
/** Days with nothing spent still get a sliver so the month's shape reads. */
const MIN_BAR = 3;

/**
 * Per-day bars for a month with a dashed average line. Drag across to read a day;
 * the readout above shows today until then.
 */
export function DailySpendBars({ days, average }: { days: DaySpend[]; average: number }) {
  const { theme } = useUnistyles();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const [today] = useState(() => startOfDay(Date.now()));
  const todayIndex = days.findIndex((d) => d.date === today);
  const [selected, setSelected] = useState<number | null>(null);

  const height = theme.sizes.barChartHeight;
  const gap = theme.sizes.barGap;
  const barWidth = days.length > 0 ? (width - gap * (days.length - 1)) / days.length : 0;
  const max = Math.max(average, ...days.map((d) => d.totalCents), 1);
  const avgY = height - (average / max) * height;

  const grow = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion || width === 0) return;
    grow.set(withTiming(1, { duration: theme.motion.chartMs, easing: MOTION_EASING }));
  }, [grow, reduceMotion, width, theme.motion.chartMs]);
  const growStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: grow.get() }] }));

  const indexAt = (x: number) =>
    Math.min(days.length - 1, Math.max(0, Math.floor(x / (barWidth + gap))));
  const pan = usePanGesture({
    runOnJS: true,
    activeOffsetX: [-theme.space.sm, theme.space.sm],
    failOffsetY: [-theme.space.md, theme.space.md],
    onBegin: (e) => setSelected(indexAt(e.x)),
    onUpdate: (e) => setSelected(indexAt(e.x)),
    onFinalize: () => setSelected(null),
  });

  const focus = selected ?? (todayIndex >= 0 ? todayIndex : null);
  const focusDay = focus != null ? days[focus] : null;

  return (
    <View>
      <View style={styles.readout} accessibilityLiveRegion="polite">
        <Text variant="caption" tone="muted">
          {focusDay ? formatDayLabel(focusDay.date) : 'Average day'}
        </Text>
        <Text variant="headline" tabular>
          {formatMoney(focusDay ? focusDay.totalCents : average)}
        </Text>
      </View>
      <GestureDetector gesture={pan}>
        <View
          style={styles.chart}
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          accessible
          accessibilityRole="image"
          accessibilityLabel={`Daily spending. Average ${formatMoney(average)} a day.`}
        >
          {width > 0 ? (
            <>
              <Animated.View style={[styles.layer, styles.grow, growStyle]}>
                <Svg width={width} height={height}>
                  {days.map((d, i) => {
                    const h = Math.max(MIN_BAR, (d.totalCents / max) * height);
                    const future = d.date > today;
                    let color: string = theme.colors.primaryMuted;
                    if (future) color = theme.colors.surfaceMuted;
                    else if (i === focus) color = theme.colors.primary;
                    else if (d.totalCents > average) color = theme.colors.primary;
                    const r = Math.min(barWidth / 2, theme.radius.sm);
                    return (
                      <Rect
                        key={d.day}
                        x={i * (barWidth + gap)}
                        y={height - h}
                        width={barWidth}
                        height={h}
                        rx={r}
                        ry={r}
                        fill={color}
                        opacity={
                          selected != null && i !== selected && !future ? theme.opacity.dimmed : 1
                        }
                      />
                    );
                  })}
                </Svg>
              </Animated.View>
              {average > 0 ? (
                <Svg width={width} height={height} style={styles.layer}>
                  <Line
                    x1={0}
                    y1={avgY}
                    x2={width}
                    y2={avgY}
                    stroke={theme.colors.textSubtle}
                    strokeWidth={theme.sizes.tick}
                    strokeDasharray={DASH}
                  />
                </Svg>
              ) : null}
            </>
          ) : null}
        </View>
      </GestureDetector>
      <View style={styles.axis}>
        <Text variant="caption" tone="subtle">
          1
        </Text>
        <Text variant="caption" tone="subtle">
          avg {formatMoneyShort(Math.round(average))}/day
        </Text>
        <Text variant="caption" tone="subtle">
          {days.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  readout: {
    minHeight: theme.typography.caption.lineHeight + theme.typography.headline.lineHeight,
  },
  chart: { height: theme.sizes.barChartHeight, marginTop: theme.space.md },
  layer: { position: 'absolute', top: 0, left: 0 },
  // Bars grow up from the baseline.
  grow: { transformOrigin: 'bottom' },
  axis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.space.sm,
  },
}));
