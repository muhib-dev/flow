import { useMutation } from '@tanstack/react-query';
import { useNetworkState } from 'expo-network';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon, ListRow, Screen, Section, Text, toast } from '@/design-system';
import { useSession } from '@/features/auth/hooks/use-session';
import { syncNow } from '@/features/transactions/api/sync';
import { usePendingWrites } from '@/features/transactions/hooks/use-pending-writes';

const ONLINE_ICON = { ios: 'wifi', android: 'wifi', web: 'wifi' } as const;
const OFFLINE_ICON = { ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' } as const;
const SYNCED_ICON = {
  ios: 'checkmark.circle.fill',
  android: 'check_circle',
  web: 'check_circle',
} as const;
const PENDING_ICON = { ios: 'clock', android: 'schedule', web: 'schedule' } as const;

export function SettingsScreen() {
  const { theme } = useUnistyles();
  const { email, signOut } = useSession();
  const network = useNetworkState();
  const pending = usePendingWrites();
  const sync = useMutation({
    mutationFn: () => syncNow(),
    onSuccess: (result) =>
      result.stalled
        ? toast.info('Some changes are still waiting to sync')
        : toast.success('All synced'),
    onError: () => toast.error('Sync failed'),
  });

  const offline = network.isConnected === false;
  const waiting = pending.data ?? 0;

  return (
    <Screen scroll>
      <Section title="Account">
        <ListRow label="Signed in as" value={email ?? 'Unknown'} />
      </Section>

      <Section
        title="Sync"
        detail={offline ? 'Offline' : waiting > 0 ? `${waiting} waiting` : 'Up to date'}
        detailTone={offline || waiting > 0 ? 'warningText' : 'muted'}
        style={styles.section}
      >
        <ListRow
          label="Connection"
          value={offline ? 'Offline' : 'Online'}
          leading={
            <Icon
              name={offline ? OFFLINE_ICON : ONLINE_ICON}
              size={theme.sizes.iconControl}
              tone="muted"
            />
          }
        />
        <ListRow
          label="Changes"
          value={
            waiting > 0
              ? `${waiting} ${waiting === 1 ? 'change' : 'changes'} waiting`
              : 'Everything synced'
          }
          valueTone={waiting > 0 ? 'warningText' : 'muted'}
          leading={
            <Icon
              name={waiting > 0 ? PENDING_ICON : SYNCED_ICON}
              size={theme.sizes.iconControl}
              tone={waiting > 0 ? 'warningText' : 'success'}
            />
          }
        />
        <ListRow
          label="Sync now"
          tone="primary"
          loading={sync.isPending}
          onPress={() => sync.mutate()}
        />
      </Section>

      <Section title="Session" style={styles.section}>
        <ListRow label="Sign out" tone="dangerText" onPress={() => void signOut()} />
      </Section>

      <View style={styles.footer}>
        <Text variant="caption" tone="muted">
          Expenses are saved on this device first and sync when you&apos;re online.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: { marginTop: theme.space.xxxl },
  footer: { marginTop: theme.space.lg },
}));
