import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon, Text } from '@/design-system';

import type { Pace } from '../api/pace';

const PACE = {
  ok: {
    word: 'On track',
    tone: 'normal',
    iconTone: 'success',
    icon: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  },
  above: {
    word: 'Above pace',
    tone: 'warningText',
    iconTone: 'warningText',
    icon: { ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' },
  },
  over: {
    word: 'Over budget',
    tone: 'dangerText',
    iconTone: 'danger',
    icon: { ios: 'exclamationmark.circle.fill', android: 'error', web: 'error' },
  },
} as const;

/** Icon + word + "62% spent, 58% of month gone". Color always pairs with an icon and a word. */
export function PaceLine({
  pace,
  spentRatio,
  calendarRatio,
}: {
  pace: Pace;
  spentRatio: number;
  calendarRatio: number;
}) {
  const { theme } = useUnistyles();
  const copy = PACE[pace];
  return (
    <View style={styles.line}>
      <View style={styles.word}>
        <Icon name={copy.icon} size={theme.sizes.iconSm} tone={copy.iconTone} />
        <Text variant="label" tone={copy.tone} numberOfLines={1}>
          {copy.word}
        </Text>
      </View>
      <Text variant="callout" tone="muted">
        {Math.round(spentRatio * 100)}% spent, {Math.round(calendarRatio * 100)}% of month gone
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  line: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: theme.space.sm },
  word: { flexDirection: 'row', alignItems: 'center', gap: theme.space.xs },
}));
