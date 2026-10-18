import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import {
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { MOTION_EASING } from '@/design-system';

export type DonutSlice = { key: string; value: number; color: string };

/** Breathing room between slices, in points along the ring. */
const GAP = 4;
const DEG = 180 / Math.PI;

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
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    progress.set(withTiming(1, { duration: theme.motion.chartMs, easing: MOTION_EASING }));
  }, [progress, reduceMotion, theme.motion.chartMs]);

  const single = slices.length === 1;
  // Round caps add half a stroke at each end; trim that and the gap from each sweep.
  const trimDeg = single ? 0 : ((GAP + stroke) / radius) * DEG;
  const oval = Skia.XYWHRect(stroke / 2, stroke / 2, size - stroke, size - stroke);

  const arcs = layoutArcs(slices).map((arc) => {
    const sweep = Math.max((arc.to - arc.from) * 360 - trimDeg, 0.1);
    const startDeg = -90 + arc.from * 360 + trimDeg / 2;
    const path = Skia.PathBuilder.Make()
      .addArc(oval, startDeg, single ? 359.99 : sweep)
      .build();
    return { ...arc, path };
  });

  return (
    <View style={styles.root(size)}>
      <Canvas style={styles.canvas(size)}>
        <Path
          path={Skia.PathBuilder.Make().addArc(oval, 0, 359.99).build()}
          style="stroke"
          strokeWidth={stroke}
          color={theme.colors.surfaceMuted}
        />
        {arcs.map((arc) => (
          <Arc
            key={arc.key}
            path={arc.path}
            color={arc.color}
            stroke={stroke}
            cap={single ? 'butt' : 'round'}
            from={arc.from}
            to={arc.to}
            progress={progress}
          />
        ))}
      </Canvas>
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

/** One slice. It starts drawing once the sweep reaches `from` and is full at `to`. */
function Arc({
  path,
  color,
  stroke,
  cap,
  from,
  to,
  progress,
}: {
  path: ReturnType<typeof Skia.Path.Make>;
  color: string;
  stroke: number;
  cap: 'butt' | 'round';
  from: number;
  to: number;
  progress: SharedValue<number>;
}) {
  const end = useDerivedValue(() => {
    const p = progress.get();
    if (p <= from) return 0;
    if (p >= to) return 1;
    return (p - from) / (to - from);
  });
  const opacity = useDerivedValue(() => (progress.get() > from ? 1 : 0));
  return (
    <Path
      path={path}
      style="stroke"
      strokeWidth={stroke}
      strokeCap={cap}
      color={color}
      end={end}
      opacity={opacity}
    />
  );
}

const styles = StyleSheet.create(() => ({
  root: (size: number) => ({ width: size, height: size, alignSelf: 'center' }),
  canvas: (size: number) => ({ width: size, height: size }),
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
