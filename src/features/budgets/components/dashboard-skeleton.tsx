import { useEffect } from 'react';
import { View, type DimensionValue } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const PULSE_HALF_MS = 700;
const PULSE_MIN_OPACITY = 0.5;

// Block sizes mirror the final layout so nothing jumps when data lands.
const HERO_LABEL_WIDTH = 128;
const HERO_VALUE_WIDTH = 168;
const HERO_PACE_WIDTH = 220;
const SECTIONS = [{ titleWidth: 72 }, { titleWidth: 60 }];
const ROW_WIDTHS: DimensionValue[] = ['40%', '52%', '34%'];
const ROW_VALUE_WIDTH = 64;
const ROW_SUB_WIDTH: DimensionValue = '30%';
const LINE_HEIGHT = 14;
const SUB_LINE_HEIGHT = 12;

export function DashboardSkeleton() {
  const { theme } = useUnistyles();
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

  const block = (width: DimensionValue, height: number, marginTop = 0) => (
    <Animated.View style={[styles.block(width, height, marginTop), pulse]} />
  );

  return (
    <View accessibilityLabel="Loading" accessibilityState={{ busy: true }}>
      {block(HERO_LABEL_WIDTH, LINE_HEIGHT)}
      {block(HERO_VALUE_WIDTH, theme.typography.largeNumber.fontSize, theme.space.sm)}
      {block(HERO_PACE_WIDTH, LINE_HEIGHT, theme.space.md)}
      <Animated.View style={[styles.bar, pulse]} />
      <View style={styles.statBand} />
      {SECTIONS.map((section) => (
        <View key={section.titleWidth} style={styles.section}>
          {block(section.titleWidth, theme.space.lg)}
          {ROW_WIDTHS.map((width, i) => (
            <View key={i} style={styles.row}>
              <View style={styles.rowLine}>
                {block(width, LINE_HEIGHT)}
                {block(ROW_VALUE_WIDTH, LINE_HEIGHT)}
              </View>
              {block(ROW_SUB_WIDTH, SUB_LINE_HEIGHT)}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  block: (width: DimensionValue, height: number, marginTop: number) => ({
    width,
    height,
    marginTop,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceMuted,
  }),
  bar: {
    height: theme.sizes.progressHeight,
    marginTop: theme.space.xxl,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
  },
  statBand: {
    height: theme.space.xxxl,
    marginTop: theme.space.xxl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  section: { marginTop: theme.space.xxxl },
  row: {
    gap: theme.space.sm,
    paddingVertical: theme.space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  rowLine: { flexDirection: 'row', justifyContent: 'space-between' },
}));
