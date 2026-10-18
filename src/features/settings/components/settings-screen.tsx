import { MenuView } from '@expo/ui/community/menu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { useNetworkState } from 'expo-network';
import { Alert, RefreshControl, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import {
  Avatar,
  Card,
  categoryColor,
  Icon,
  IconBadge,
  ListGroup,
  ListRow,
  Pill,
  Screen,
  Section,
  Segmented,
  Text,
  toast,
} from '@/design-system';
import { useSession } from '@/features/auth/hooks/use-session';
import { syncNow } from '@/features/transactions/api/sync';
import { usePendingWrites } from '@/features/transactions/hooks/use-pending-writes';
import { currencySymbol, initialsOf } from '@/lib/format';

import {
  CURRENCIES,
  usePreferencesStore,
  type AppearancePreference,
} from '../store/preferences-store';

const ONLINE_ICON = { ios: 'wifi', android: 'wifi', web: 'wifi' } as const;
const OFFLINE_ICON = { ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' } as const;
const SYNCED_ICON = {
  ios: 'checkmark.icloud.fill',
  android: 'cloud_done',
  web: 'cloud_done',
} as const;
const PENDING_ICON = { ios: 'clock.fill', android: 'schedule', web: 'schedule' } as const;
const SYNC_ICON = {
  ios: 'arrow.triangle.2.circlepath',
  android: 'sync',
  web: 'sync',
} as const;
const CURRENCY_ICON = {
  ios: 'banknote.fill',
  android: 'payments',
  web: 'payments',
} as const;
const VERSION_ICON = { ios: 'info.circle.fill', android: 'info', web: 'info' } as const;
const SIGN_OUT_ICON = {
  ios: 'rectangle.portrait.and.arrow.right',
  android: 'logout',
  web: 'logout',
} as const;
const UP_DOWN_ICON = {
  ios: 'chevron.up.chevron.down',
  android: 'unfold_more',
  web: 'unfold_more',
} as const;

// Seed category colors double as the settings icon palette so badges match the rest of the app.
const BLUE = '#3B82F6';
const VIOLET = '#8B5CF6';
const SLATE = '#6B7280';
const AMBER = '#F59E0B';

const APPEARANCE_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const satisfies readonly { value: AppearancePreference; label: string }[];

const version = Constants.expoConfig?.version ?? '—';

export function SettingsScreen() {
  const { theme } = useUnistyles();
  const queryClient = useQueryClient();
  const { email, signOut } = useSession();
  const network = useNetworkState();
  const pending = usePendingWrites();
  const appearance = usePreferencesStore((s) => s.appearance);
  const setAppearance = usePreferencesStore((s) => s.setAppearance);
  const currency = usePreferencesStore((s) => s.currency);
  const setCurrency = usePreferencesStore((s) => s.setCurrency);

  const sync = useMutation({
    mutationFn: () => syncNow(),
    onSuccess: (result) => {
      void queryClient.invalidateQueries();
      if (result.stalled) toast.info('Some changes are still waiting to sync');
      else toast.success('All synced');
    },
    onError: () => toast.error('Sync failed. Try again.'),
  });

  const offline = network.isConnected === false;
  const waiting = pending.data ?? 0;
  const status = offline
    ? ({ label: 'Offline', tone: 'warning', icon: OFFLINE_ICON } as const)
    : waiting > 0
      ? ({ label: `${waiting} waiting to sync`, tone: 'warning', icon: PENDING_ICON } as const)
      : ({ label: 'Synced', tone: 'success', icon: SYNCED_ICON } as const);

  const confirmSignOut = () =>
    Alert.alert(
      'Sign out?',
      waiting > 0
        ? `${waiting} ${waiting === 1 ? 'change hasn’t' : 'changes haven’t'} synced yet and will stay on this device.`
        : 'You can sign back in with a magic link any time.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => void signOut() },
      ],
    );

  return (
    <Screen
      scroll
      refreshControl={
        <RefreshControl
          refreshing={sync.isPending}
          onRefresh={() => sync.mutate()}
          tintColor={theme.colors.textMuted}
        />
      }
    >
      <Card style={styles.profile}>
        <Avatar initials={initialsOf(email)} size="lg" />
        <View style={styles.profileText}>
          <Text variant="headline" numberOfLines={1}>
            {email ?? 'Signed in'}
          </Text>
          <Pill label={status.label} tone={status.tone} icon={status.icon} />
        </View>
      </Card>

      <Section title="Appearance">
        <Card>
          <Segmented options={APPEARANCE_OPTIONS} value={appearance} onChange={setAppearance} />
        </Card>
      </Section>

      <Section title="Preferences" footer="Changes how amounts are shown. Nothing is converted.">
        <ListGroup inset={theme.sizes.iconBadgeSm + theme.space.md}>
          <MenuView
            title="Currency"
            actions={CURRENCIES.map((code) => ({
              id: code,
              title: `${code}  ${currencySymbol(code)}`,
              state: code === currency ? 'on' : 'off',
            }))}
            onPressAction={({ nativeEvent }) => setCurrency(nativeEvent.event)}
          >
            <ListRow
              label="Currency"
              value={`${currency} · ${currencySymbol(currency)}`}
              leading={
                <IconBadge
                  icon={CURRENCY_ICON}
                  color={categoryColor(theme, AMBER)}
                  size="sm"
                  variant="solid"
                />
              }
              trailing={<Icon name={UP_DOWN_ICON} size={theme.sizes.iconSm} tone="subtle" />}
              accessibilityHint="Opens a list of currencies"
            />
          </MenuView>
        </ListGroup>
      </Section>

      <Section
        title="Sync"
        footer="Expenses are saved on this device first and sync when you're online."
      >
        <ListGroup inset={theme.sizes.iconBadgeSm + theme.space.md}>
          <ListRow
            label="Connection"
            value={offline ? 'Offline' : 'Online'}
            valueTone={offline ? 'warningText' : 'muted'}
            leading={
              <IconBadge
                icon={offline ? OFFLINE_ICON : ONLINE_ICON}
                color={categoryColor(theme, BLUE)}
                size="sm"
                variant="solid"
              />
            }
          />
          <ListRow
            label="Pending changes"
            value={waiting > 0 ? String(waiting) : 'None'}
            valueTone={waiting > 0 ? 'warningText' : 'muted'}
            leading={
              <IconBadge
                icon={waiting > 0 ? PENDING_ICON : SYNCED_ICON}
                color={categoryColor(theme, VIOLET)}
                size="sm"
                variant="solid"
              />
            }
          />
          <ListRow
            label="Sync now"
            tone="primary"
            loading={sync.isPending}
            onPress={() => sync.mutate()}
            leading={<IconBadge icon={SYNC_ICON} size="sm" variant="solid" />}
          />
        </ListGroup>
      </Section>

      <Section title="About">
        <ListGroup inset={theme.sizes.iconBadgeSm + theme.space.md}>
          <ListRow
            label="Version"
            value={version}
            leading={
              <IconBadge
                icon={VERSION_ICON}
                color={categoryColor(theme, SLATE)}
                size="sm"
                variant="solid"
              />
            }
          />
        </ListGroup>
      </Section>

      <Section>
        <ListGroup>
          <ListRow
            label="Sign out"
            tone="dangerText"
            onPress={confirmSignOut}
            leading={
              <IconBadge
                icon={SIGN_OUT_ICON}
                color={theme.colors.danger}
                size="sm"
                variant="solid"
              />
            }
          />
        </ListGroup>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  profile: { flexDirection: 'row', alignItems: 'center', gap: theme.space.lg },
  profileText: { flex: 1, minWidth: 0, gap: theme.space.sm },
}));
