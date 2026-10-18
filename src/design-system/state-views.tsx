import { View, type DimensionValue } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Button } from './button';
import { Icon } from './icon';
import { Skeleton } from './skeleton';
import { Text } from './text';

const CLOUD_OFF_ICON = { ios: 'icloud.slash', android: 'cloud_off', web: 'cloud_off' } as const;
const SKELETON_ROWS: DimensionValue[] = ['40%', '52%', '34%', '46%'];
const SKELETON_TITLE_WIDTH = 72;
const SKELETON_VALUE_WIDTH = 64;
const SKELETON_LINE = 14;
const SKELETON_SUB_LINE = 12;

/** Hairline rows of pulsing blocks, roughly the shape of a Ledger list. */
export function LoadingState({ label = 'Loading' }: { label?: string }) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.root} accessibilityLabel={label} accessibilityState={{ busy: true }}>
      <Skeleton width={SKELETON_TITLE_WIDTH} height={theme.space.lg} />
      {SKELETON_ROWS.map((width, i) => (
        <View key={i} style={styles.skeletonRow}>
          <View style={styles.skeletonLine}>
            <Skeleton width={width} height={SKELETON_LINE} />
            <Skeleton width={SKELETON_VALUE_WIDTH} height={SKELETON_LINE} />
          </View>
          <Skeleton width="30%" height={SKELETON_SUB_LINE} />
        </View>
      ))}
    </View>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.root}>
      <Text variant="headline">{title}</Text>
      {message ? (
        <Text variant="callout" tone="muted" style={styles.message}>
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
    <View style={[styles.root, styles.error]}>
      <View style={styles.errorTitle}>
        <Icon name={CLOUD_OFF_ICON} size={theme.sizes.iconControl} tone="muted" />
        <Text variant="headline">{title}</Text>
      </View>
      <Text variant="callout" tone="muted" style={styles.message}>
        {message ?? 'Check your connection and try again.'}
      </Text>
      {onRetry ? (
        <View style={[styles.action, styles.actionStart]}>
          <Button label="Try again" variant="outline" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    paddingHorizontal: theme.space.xl,
    paddingTop: theme.space.xl,
    backgroundColor: theme.colors.background,
  },
  message: { marginTop: theme.space.xs, maxWidth: theme.sizes.formMaxWidth },
  action: { marginTop: theme.space.xl },
  actionStart: { alignSelf: 'flex-start' },
  error: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  errorTitle: { flexDirection: 'row', alignItems: 'center', gap: theme.space.sm },
  skeletonRow: {
    gap: theme.space.sm,
    paddingVertical: theme.space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  skeletonLine: { flexDirection: 'row', justifyContent: 'space-between' },
}));
