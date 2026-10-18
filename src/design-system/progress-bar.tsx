import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { MOTION_EASING } from './motion';

/** Pill bar that fills from zero on mount. Turns danger once `value` passes 1. */
export function ProgressBar({
  value,
  color,
  size = 'md',
  marker,
  delay = 0,
  onInk = false,
}: {
  value: number;
  color: string;
  size?: 'sm' | 'md';
  /** 0–1 position of a pace tick drawn across the bar, e.g. how much of the month is gone. */
  marker?: number;
  /** Fill animation delay in ms. */
  delay?: number;
  /** Track and marker colors for the deep `ink` card. */
  onInk?: boolean;
}) {
  const { theme } = useUnistyles();
  styles.useVariants({ size, onInk });
  const clamped = Math.min(Math.max(value, 0), 1);
  const width = useSharedValue(0);

  useEffect(() => {
    width.set(
      withDelay(
        delay,
        withTiming(clamped * 100, { duration: theme.motion.fillMs, easing: MOTION_EASING }),
      ),
    );
  }, [clamped, delay, width, theme.motion.fillMs]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${width.get()}%` }));

  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <Animated.View style={[styles.fill(value > 1 ? null : color), fillStyle]} />
      {marker != null ? (
        <View style={[styles.marker(Math.min(Math.max(marker, 0), 1), size), styles.markerTone]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  track: {
    borderRadius: theme.radius.pill,
    variants: {
      onInk: {
        true: { backgroundColor: theme.colors.inkTrack },
        false: { backgroundColor: theme.colors.surfaceMuted },
      },
      size: {
        sm: { height: theme.sizes.progressHeightSm },
        md: { height: theme.sizes.progressHeight },
      },
    },
  },
  fill: (color: string | null) => ({
    height: '100%',
    borderRadius: theme.radius.pill,
    backgroundColor: color ?? theme.colors.danger,
  }),
  marker: (position: number, size: 'sm' | 'md') => ({
    position: 'absolute',
    left: `${position * 100}%`,
    top:
      ((size === 'sm' ? theme.sizes.progressHeightSm : theme.sizes.progressHeight) -
        theme.sizes.paceTick) /
      2,
    width: theme.sizes.tick * 2,
    height: theme.sizes.paceTick,
    borderRadius: theme.radius.pill,
  }),
  markerTone: {
    variants: {
      onInk: {
        true: { backgroundColor: theme.colors.onInkMuted },
        false: { backgroundColor: theme.colors.textSubtle },
      },
    },
  },
}));
