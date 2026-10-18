import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { MOTION_EASING } from '@/design-system';

export type DonutSlice = { key: string; value: number; color: string };

/** Breathing room between slices, in points along the ring. */
const GAP = 4;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Ring chart of slices with rounded ends and small gaps, sweeping in clockwise from 12 o'clock.
 * `children` sit in the hole.
 */
export function SpendDonut({ slices, children }: { slices: DonutSlice[]; children?: ReactNode }) {
  const { theme } = useUnistyles();
  const reduceMotion = useReducedMotion();
  const size = theme.sizes.donut;
  const stroke = theme.sizes.donutStroke;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    progress.set(withTiming(1, { duration: theme.motion.chartMs, easing: MOTION_EASING }));
  }, [progress, reduceMotion, theme.motion.chartMs]);

  const single = slices.length === 1;
  // Round caps add half a stroke at each end; trim that and the gap from each sweep.
  const trim = single ? 0 : GAP + stroke;

  return (
    <View style={styles.root(size)}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={theme.colors.surfaceMuted}
          strokeWidth={stroke}
        />
        {layoutArcs(slices).map((arc) => (
          <Arc
            key={arc.key}
            center={size / 2}
            radius={radius}
            circumference={circumference}
            color={arc.color}
            stroke={stroke}
            cap={single ? 'butt' : 'round'}
            trim={trim}
            from={arc.from}
            to={arc.to}
            progress={progress}
          />
        ))}
      </Svg>
      <View style={styles.center} pointerEvents="none">
        {children}
      </View>
    </View>
  );
}

/** Each slice's [from, to) share of the ring, 0–1, in order. */
function layoutArcs(slices: DonutSlice[]) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const ends = slices.map((_, i) =>
    total > 0 ? slices.slice(0, i + 1).reduce((sum, s) => sum + s.value, 0) / total : 0,
  );
  return slices.map((slice, i) => ({
    key: slice.key,
    color: slice.color,
    from: i === 0 ? 0 : ends[i - 1],
    to: ends[i],
  }));
}

/**
 * One slice, drawn as a dash on the ring. It starts drawing once the sweep reaches `from`
 * and is full at `to`.
 */
function Arc({
  center,
  radius,
  circumference,
  color,
  stroke,
  cap,
  trim,
  from,
  to,
  progress,
}: {
  center: number;
  radius: number;
  circumference: number;
  color: string;
  stroke: number;
  cap: 'butt' | 'round';
  trim: number;
  from: number;
  to: number;
  progress: SharedValue<number>;
}) {
  const length = Math.max((to - from) * circumference - trim, 0.1);
  // SVG circles start at 3 o'clock; turn back a quarter so the ring starts at 12.
  const startDeg = -90 + ((from * circumference + trim / 2) / circumference) * 360;

  const animatedProps = useAnimatedProps(() => {
    const p = progress.get();
    let end = (p - from) / (to - from);
    if (p <= from) end = 0;
    if (p >= to) end = 1;
    return { strokeDashoffset: length * (1 - end), opacity: p > from ? 1 : 0 };
  });

  return (
    <AnimatedCircle
      cx={center}
      cy={center}
      r={radius}
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap={cap}
      strokeDasharray={[length, circumference]}
      transform={`rotate(${startDeg} ${center} ${center})`}
      animatedProps={animatedProps}
    />
  );
}

const styles = StyleSheet.create(() => ({
  root: (size: number) => ({ width: size, height: size, alignSelf: 'center' }),
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
