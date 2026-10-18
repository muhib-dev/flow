import type { ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text, type TextProps } from './text';

type MetricProps = {
  /** Small caption above the number: "Safe to spend today". */
  label: string;
  /** Pre-formatted figure. */
  value: string;
  /** Unit or context after the figure on the same baseline: "a day for 14 days". */
  unit?: string;
  /** Extra content under the figure, e.g. a delta pill. */
  footer?: ReactNode;
  size?: 'hero' | 'large';
  /** Value color; ignored for `onInk`. */
  tone?: TextProps['tone'];
  /** Text colors for the deep `ink` card. */
  onInk?: boolean;
  /** Spoken in place of label + value + unit. */
  accessibilityLabel?: string;
};

/** The one big number a screen leads with, plus its label and unit. */
export function Metric({
  label,
  value,
  unit,
  footer,
  size = 'hero',
  tone = 'normal',
  onInk = false,
  accessibilityLabel,
}: MetricProps) {
  const muted = onInk ? 'onInkMuted' : 'muted';
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? [label, value, unit].filter(Boolean).join(', ')}
    >
      <Text variant="callout" weight="medium" tone={muted}>
        {label}
      </Text>
      <View style={styles.value}>
        <Text
          variant={size === 'hero' ? 'heroNumber' : 'largeNumber'}
          tone={onInk ? 'onInk' : tone}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {value}
        </Text>
        {unit ? (
          <Text variant="callout" tone={muted}>
            {unit}
          </Text>
        ) : null}
      </View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  value: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    columnGap: theme.space.sm,
    marginTop: theme.space.xxs,
  },
  footer: { marginTop: theme.space.sm },
}));
