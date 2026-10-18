import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon, Text } from '@/design-system';
import { useSessionStore } from '@/features/auth/store/session-store';
import { formatMonth, formatMonthName, shiftMonth } from '@/lib/format';

const CHEVRON_ICON = { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' } as const;
const CHECK_ICON = { ios: 'checkmark', android: 'check', web: 'check' } as const;
const CHEVRON_MS = 200;
const MONTHS_SHOWN = 4;

/** "muhib.ullah@x.com" → "MU". */
function initialsOf(email: string | null) {
  const local = email?.split('@')[0] ?? '';
  const parts = local.split(/[._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : local.slice(0, 2);
  return letters.toUpperCase();
}

export function DashboardHeader({ month }: { month: string }) {
  const { theme } = useUnistyles();
  const email = useSessionStore((s) => s.email);
  const [open, setOpen] = useState(false);
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.set(withTiming(open ? 180 : 0, { duration: CHEVRON_MS }));
  }, [open, rotation]);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.get()}deg` }],
  }));

  const year = month.slice(0, 4);
  const months = Array.from({ length: MONTHS_SHOWN }, (_, i) => shiftMonth(month, -i));

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Change month. ${formatMonth(month)} selected`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((o) => !o)}
        style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}
      >
        <View style={styles.monthName}>
          <Text variant="display">{formatMonthName(month)}</Text>
          <Animated.View style={chevronStyle}>
            <Icon name={CHEVRON_ICON} size={theme.sizes.iconControl} tone="muted" />
          </Animated.View>
        </View>
        <Text variant="display" tone="muted" style={styles.year}>
          {year}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Profile and settings"
        onPress={() => router.push('/settings')}
        style={({ pressed }) => [styles.avatarHit, pressed && styles.pressed]}
      >
        <View style={styles.avatar}>
          <Text variant="caption" style={styles.initials}>
            {initialsOf(email)}
          </Text>
        </View>
      </Pressable>

      {open ? (
        <View style={styles.menu}>
          {months.map((m, i) => (
            <Pressable
              key={m}
              accessibilityRole="button"
              accessibilityState={{ selected: m === month }}
              // Only the current month has data for now; picking just closes the switcher.
              onPress={() => setOpen(false)}
              style={({ pressed }) => [
                styles.menuRow,
                i > 0 && styles.menuDivider,
                pressed && styles.menuPressed,
              ]}
            >
              <Text variant={m === month ? 'headline' : 'body'}>{formatMonth(m)}</Text>
              {m === month ? (
                <Icon name={CHECK_ICON} size={theme.sizes.iconControl} tone="primary" />
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.sm,
    paddingTop: theme.space.sm,
    paddingBottom: theme.space.xl,
  },
  monthButton: {
    flexShrink: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    columnGap: theme.space.sm,
    minHeight: theme.sizes.hitTarget,
  },
  monthName: { flexDirection: 'row', alignItems: 'center', gap: theme.space.sm },
  year: { fontWeight: theme.typography.body.fontWeight },
  pressed: { opacity: 0.55 },
  avatarHit: {
    width: theme.sizes.hitTarget,
    height: theme.sizes.hitTarget,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  avatar: {
    width: theme.sizes.avatar,
    height: theme.sizes.avatar,
    borderRadius: theme.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontWeight: theme.typography.label.fontWeight },
  menu: {
    position: 'absolute',
    top: theme.sizes.hitTarget + theme.space.lg,
    left: -theme.space.sm,
    width: theme.sizes.menuWidth,
    paddingVertical: theme.space.xs,
    borderRadius: theme.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadows.popover,
  },
  menuRow: {
    minHeight: theme.sizes.hitTarget,
    paddingHorizontal: theme.space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  menuPressed: { backgroundColor: theme.colors.surfaceMuted },
}));
