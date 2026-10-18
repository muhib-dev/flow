import { useEffect } from 'react';
import type { DimensionValue } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

const PULSE_HALF_MS = 700;
const PULSE_MIN_OPACITY = 0.5;

/** Muted placeholder block pulsing 1 → .5 over 1.4s; still under Reduce Motion. */
export function Skeleton({
  width,
  height,
  marginTop = 0,
  pill = false,
}: {
  width: DimensionValue;
  height: number;
  marginTop?: number;
  pill?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.set(
      withRepeat(
        withTiming(PULSE_MIN_OPACITY, {
          duration: PULSE_HALF_MS,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );
  }, [opacity, reduceMotion]);
  const pulse = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  return <Animated.View style={[styles.block(width, height, marginTop, pill), pulse]} />;
}

const styles = StyleSheet.create((theme) => ({
  block: (width: DimensionValue, height: number, marginTop: number, pill: boolean) => ({
    width,
    height,
    marginTop,
    borderRadius: pill ? theme.radius.pill : theme.radius.sm,
    backgroundColor: theme.colors.surfaceMuted,
  }),
}));
