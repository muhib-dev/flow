import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/design-system';

/** Key/value columns split by hairlines; wraps at large text sizes. */
export function StatRow({
  stats,
  onInk = false,
}: {
  stats: { label: string; value: string }[];
  onInk?: boolean;
}) {
  styles.useVariants({ onInk });
  return (
    <View style={styles.row}>
      {stats.map(({ label, value }, i) => (
        <View
          key={label}
          style={[styles.stat, i > 0 && styles.divider]}
          accessible
          accessibilityLabel={`${label}: ${value}`}
        >
          <Text variant="caption" tone={onInk ? 'onInkMuted' : 'muted'}>
            {label}
          </Text>
          <Text variant="label" tone={onInk ? 'onInk' : 'normal'} tabular numberOfLines={1}>
            {value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: { flexDirection: 'row', flexWrap: 'wrap', rowGap: theme.space.md },
  stat: {
    flexGrow: 1,
    flexBasis: theme.sizes.statMinWidth,
    gap: theme.space.xxs,
    paddingHorizontal: theme.space.md,
  },
  divider: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    variants: {
      onInk: {
        true: { borderLeftColor: theme.colors.inkTrack },
        false: { borderLeftColor: theme.colors.separator },
      },
    },
  },
}));
