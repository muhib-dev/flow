import { View, type DimensionValue } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Skeleton } from '@/design-system';

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
  return (
    <View accessibilityLabel="Loading" accessibilityState={{ busy: true }}>
      <Skeleton width={HERO_LABEL_WIDTH} height={LINE_HEIGHT} />
      <Skeleton
        width={HERO_VALUE_WIDTH}
        height={theme.typography.largeNumber.fontSize}
        marginTop={theme.space.sm}
      />
      <Skeleton width={HERO_PACE_WIDTH} height={LINE_HEIGHT} marginTop={theme.space.md} />
      <Skeleton width="100%" height={theme.sizes.progressHeight} marginTop={theme.space.xxl} pill />
      <View style={styles.statBand} />
      {SECTIONS.map((section) => (
        <View key={section.titleWidth} style={styles.section}>
          <Skeleton width={section.titleWidth} height={theme.space.lg} />
          {ROW_WIDTHS.map((width, i) => (
            <View key={i} style={styles.row}>
              <View style={styles.rowLine}>
                <Skeleton width={width} height={LINE_HEIGHT} />
                <Skeleton width={ROW_VALUE_WIDTH} height={LINE_HEIGHT} />
              </View>
              <Skeleton width={ROW_SUB_WIDTH} height={SUB_LINE_HEIGHT} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
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
