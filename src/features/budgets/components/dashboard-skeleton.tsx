import { View, type DimensionValue } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Card, Skeleton, SkeletonRow } from '@/design-system';

// Block sizes mirror the final layout so nothing jumps when data lands.
const HERO_LABEL_WIDTH = 128;
const HERO_VALUE_WIDTH = 188;
const HERO_PACE_WIDTH = 220;
const SECTIONS: { titleWidth: number; rows: DimensionValue[] }[] = [
  { titleWidth: 76, rows: ['40%', '52%', '34%'] },
  { titleWidth: 60, rows: ['46%', '38%'] },
];

export function DashboardSkeleton() {
  const { theme } = useUnistyles();
  return (
    <View accessibilityLabel="Loading" accessibilityState={{ busy: true }}>
      <Card>
        <Skeleton width={HERO_LABEL_WIDTH} height={theme.typography.callout.fontSize} />
        <Skeleton
          width={HERO_VALUE_WIDTH}
          height={theme.typography.heroNumber.fontSize}
          marginTop={theme.space.sm}
        />
        <Skeleton width={HERO_PACE_WIDTH} height={theme.space.xl} marginTop={theme.space.md} pill />
        <Skeleton
          width="100%"
          height={theme.sizes.progressHeight}
          marginTop={theme.space.xl}
          pill
        />
        <Skeleton width="100%" height={theme.space.xxxl} marginTop={theme.space.xl} />
      </Card>
      {SECTIONS.map((section) => (
        <View key={section.titleWidth} style={styles.section}>
          <Skeleton width={section.titleWidth} height={theme.space.lg} />
          <Card padded={false} style={styles.card}>
            {section.rows.map((width, i) => (
              <SkeletonRow key={i} width={width} />
            ))}
          </Card>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: { marginTop: theme.space.section },
  card: { marginTop: theme.space.md },
}));
