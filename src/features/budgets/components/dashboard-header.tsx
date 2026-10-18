import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Avatar, Icon, Text } from '@/design-system';
import { useSessionStore } from '@/features/auth/store/session-store';
import { MonthMenu } from '@/features/transactions/components/month-menu';
import { formatMonth, formatMonthName, initialsOf } from '@/lib/format';

const CHEVRON_ICON = { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' } as const;

function greeting(hour = new Date().getHours()) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Greeting over the month title (opens the month menu), avatar to the right. */
export function DashboardHeader({
  month,
  onMonthChange,
}: {
  month: string;
  onMonthChange: (month: string) => void;
}) {
  const { theme } = useUnistyles();
  const email = useSessionStore((s) => s.email);

  return (
    <View style={styles.header}>
      <View style={styles.titles}>
        <Text variant="callout" weight="medium" tone="muted">
          {greeting()}
        </Text>
        <MonthMenu month={month} onChange={onMonthChange}>
          <View
            style={styles.monthButton}
            accessibilityRole="button"
            accessibilityLabel={`Change month. ${formatMonth(month)} selected`}
          >
            <Text variant="title" accessibilityRole="header">
              {formatMonthName(month)}
            </Text>
            <Text variant="title" weight="regular" tone="subtle">
              {month.slice(0, 4)}
            </Text>
            <Icon name={CHEVRON_ICON} size={theme.sizes.iconSm} tone="muted" />
          </View>
        </MonthMenu>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Profile and settings"
        onPress={() => router.navigate('/settings')}
        style={({ pressed }) => [styles.avatarHit, pressed && styles.pressed]}
      >
        <Avatar initials={initialsOf(email)} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.sm,
    paddingTop: theme.space.sm,
    paddingBottom: theme.space.lg,
    paddingHorizontal: theme.space.xs,
  },
  titles: { flexShrink: 1 },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    minHeight: theme.sizes.hitTarget,
  },
  pressed: { opacity: theme.opacity.pressed },
  avatarHit: {
    width: theme.sizes.hitTarget,
    height: theme.sizes.hitTarget,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
}));
