import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

const FILL_DURATION_MS = 700;
export const FILL_EASING = Easing.bezier(0.2, 0.8, 0.2, 1);

/** Pill bar that fills from zero on mount. Turns danger once `value` passes 1. */
export function ProgressBar({
  value,
  color,
  size = 'md',
  marker,
  delay = 0,
}: {
  value: number;
  color: string;
  size?: 'sm' | 'md';
  /** 0–1 position of a pace tick drawn across the bar, e.g. how much of the month is gone. */
  marker?: number;
  /** Fill animation delay in ms. */
  delay?: number;
}) {
  styles.useVariants({ size });
  const clamped = Math.min(Math.max(value, 0), 1);
  const width = useSharedValue(0);

  useEffect(() => {
    width.set(
      withDelay(
        delay,
        withTiming(clamped * 100, { duration: FILL_DURATION_MS, easing: FILL_EASING }),
      ),
    );
  }, [clamped, delay, width]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${width.get()}%` }));

  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <Animated.View style={[styles.fill(value > 1 ? null : color), fillStyle]} />
      {marker != null ? (
        <View style={styles.marker(Math.min(Math.max(marker, 0), 1), size)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  track: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
    variants: {
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
    width: theme.sizes.tick,
    height: theme.sizes.paceTick,
    backgroundColor: theme.colors.textMuted,
  }),
}));
