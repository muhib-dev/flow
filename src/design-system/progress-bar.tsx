import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

/** Static budget bar. Phase 3 replaces it with animated rings. */
export function ProgressBar({
  value,
  color,
  inverse = false,
}: {
  value: number;
  color: string;
  /** Light track for use on a primary-colored surface. */
  inverse?: boolean;
}) {
  styles.useVariants({ inverse });
  const clamped = Math.min(Math.max(value, 0), 1);
  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <View style={styles.fill(clamped, value > 1 ? null : color)} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  track: {
    height: theme.sizes.progressHeight,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
    overflow: 'hidden',
    variants: {
      inverse: {
        true: { backgroundColor: theme.colors.onPrimaryTrack },
        false: {},
      },
    },
  },
  fill: (value: number, color: string | null) => ({
    width: `${value * 100}%`,
    height: '100%',
    borderRadius: theme.radius.pill,
    backgroundColor: color ?? theme.colors.danger,
  }),
}));
