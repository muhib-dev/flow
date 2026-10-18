import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Pill, Text } from '@/design-system';

import type { Pace } from '../api/pace';

const PACE = {
  ok: {
    word: 'On track',
    tone: 'success',
    icon: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  },
  above: {
    word: 'Above pace',
    tone: 'warning',
    icon: { ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' },
  },
  over: {
    word: 'Over budget',
    tone: 'danger',
    icon: { ios: 'exclamationmark.circle.fill', android: 'error', web: 'error' },
  },
} as const;

/** Status pill + "62% spent · 58% of month gone". Color always pairs with an icon and a word. */
export function PaceLine({
  pace,
  spentRatio,
  calendarRatio,
  onInk = false,
}: {
  pace: Pace;
  spentRatio: number;
  calendarRatio: number;
  onInk?: boolean;
}) {
  const copy = PACE[pace];
  return (
    <View style={styles.line}>
      <Pill label={copy.word} tone={copy.tone} icon={copy.icon} onInk={onInk} />
      <Text variant="caption" tone={onInk ? 'onInkMuted' : 'muted'} tabular>
        {Math.round(spentRatio * 100)}% spent · {Math.round(calendarRatio * 100)}% of month gone
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  line: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: theme.space.sm },
}));
