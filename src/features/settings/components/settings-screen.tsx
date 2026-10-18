import { useMutation } from '@tanstack/react-query';
import { useNetworkState } from 'expo-network';

import { Button, Card, Screen, Text, toast } from '@/design-system';
import { useSession } from '@/features/auth/hooks/use-session';
import { syncNow } from '@/features/transactions/api/sync';
import { usePendingWrites } from '@/features/transactions/hooks/use-pending-writes';

export function SettingsScreen() {
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

  return (
    <Screen scroll>
      <Card>
        <Text variant="caption" tone="muted">
          Signed in as
        </Text>
        <Text variant="headline">{email ?? 'Unknown'}</Text>
      </Card>
      <Card>
        <Text variant="headline">Sync</Text>
        <Text tone="muted">{network.isConnected === false ? 'Offline' : 'Online'}</Text>
        <Text tone="muted">
          {pending.data ? `${pending.data} change(s) waiting to sync` : 'Everything is synced'}
        </Text>
        <Button
          label="Sync now"
          variant="secondary"
          loading={sync.isPending}
          onPress={() => sync.mutate()}
        />
      </Card>
      <Button label="Sign out" variant="ghost" onPress={() => void signOut()} />
    </Screen>
  );
}
