import { View, type DimensionValue } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Button } from './button';
import { Card } from './card';
import { Icon, type IconName } from './icon';
import { Skeleton } from './skeleton';
import { Text } from './text';
import { withAlpha } from './theme';

const CLOUD_OFF_ICON = { ios: 'icloud.slash', android: 'cloud_off', web: 'cloud_off' } as const;
const TRAY_ICON = { ios: 'tray', android: 'inbox', web: 'inbox' } as const;
const SKELETON_ROWS: DimensionValue[] = ['44%', '58%', '36%', '50%', '40%'];
const SKELETON_VALUE_WIDTH = 56;
const SKELETON_HERO_LABEL = 112;
const SKELETON_HERO_VALUE = 176;
const BADGE_ALPHA = 0.12;

/** Card-shaped placeholder: a hero figure over a list of rows. */
export function LoadingState({ label = 'Loading' }: { label?: string }) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.root} accessibilityLabel={label} accessibilityState={{ busy: true }}>
      <Skeleton width={SKELETON_HERO_LABEL} height={theme.typography.callout.fontSize} />
      <Skeleton
        width={SKELETON_HERO_VALUE}
        height={theme.typography.largeNumber.fontSize}
        marginTop={theme.space.sm}
      />
      <Card padded={false} style={styles.card}>
        {SKELETON_ROWS.map((width, i) => (
          <SkeletonRow key={i} width={width} />
        ))}
      </Card>
    </View>
  );
}

/** One list row placeholder: badge, two text lines, trailing value. */
export function SkeletonRow({ width }: { width: DimensionValue }) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.skeletonRow}>
      <Skeleton width={theme.sizes.categoryBadge} height={theme.sizes.categoryBadge} />
      <View style={styles.skeletonText}>
        <Skeleton width={width} height={theme.typography.callout.fontSize} />
        <Skeleton width="28%" height={theme.typography.caption.fontSize} />
      </View>
      <Skeleton width={SKELETON_VALUE_WIDTH} height={theme.typography.callout.fontSize} />
    </View>
  );
}

/** Centered glyph in a tinted circle, a title, an explanation and an optional action. */
export function EmptyState({
  title,
  message,
  icon = TRAY_ICON,
  actionLabel,
  onAction,
}: {
  title: string;
  message?: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { theme } = useUnistyles();
  return (
    <View style={[styles.root, styles.centered]}>
      <View style={styles.badge(withAlpha(theme.colors.primary, BADGE_ALPHA))}>
        <Icon name={icon} size={theme.sizes.iconLg} tone="primary" />
      </View>
      <Text variant="title" align="center" style={styles.title}>
        {title}
      </Text>
      {message ? (
        <Text variant="callout" tone="muted" align="center" style={styles.message}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  const { theme } = useUnistyles();
  return (
    <View style={[styles.root, styles.centered]}>
      <View style={styles.badge(theme.colors.dangerMuted)}>
        <Icon name={CLOUD_OFF_ICON} size={theme.sizes.iconLg} tone="dangerText" />
      </View>
      <Text variant="title" align="center" style={styles.title}>
        {title}
      </Text>
      <Text variant="callout" tone="muted" align="center" style={styles.message}>
        {message ?? 'Check your connection and try again.'}
      </Text>
      {onRetry ? (
        <View style={styles.action}>
          <Button label="Try again" variant="outline" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    paddingHorizontal: theme.space.gutter,
    paddingTop: theme.space.lg,
    backgroundColor: theme.colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.space.xl,
    paddingBottom: theme.space.xxxl,
  },
  badge: (background: string) => ({
    width: theme.sizes.emptyBadge,
    height: theme.sizes.emptyBadge,
    borderRadius: theme.radius.pill,
    backgroundColor: background,
    alignItems: 'center',
    justifyContent: 'center',
  }),
  title: { marginTop: theme.space.lg },
  message: { marginTop: theme.space.sm, maxWidth: theme.sizes.readableMaxWidth },
  action: { marginTop: theme.space.xl, minWidth: theme.sizes.readableMaxWidth / 2 },
  card: { marginTop: theme.space.xl },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    minHeight: theme.sizes.listRow,
    paddingHorizontal: theme.space.lg,
  },
  skeletonText: { flex: 1, gap: theme.space.sm },
}));
