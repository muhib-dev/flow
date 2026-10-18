import { QueryClientProvider } from '@tanstack/react-query';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import migrations from '../../drizzle/migrations';
import { ToastHost } from '@/design-system';
import { useStackScreenOptions } from '@/design-system/navigation';
import { useSessionStore } from '@/features/auth/store/session-store';
import { applyStoredPreferences } from '@/features/settings/store/preferences-store';
import { useSyncOnReconnect } from '@/features/transactions/hooks/use-sync-on-reconnect';
import { db } from '@/lib/db/client';
import { seedDefaults } from '@/lib/db/seed';
import { queryClient } from '@/lib/query-client';

export { RouteErrorBoundary as ErrorBoundary } from '@/design-system';

void SplashScreen.preventAutoHideAsync();
applyStoredPreferences();

export default function RootLayout() {
  const ready = useAppReady();
  const isSignedIn = useSessionStore((s) => s.status === 'signedIn');
  const screenOptions = useStackScreenOptions();
  const { rt } = useUnistyles();
  useSyncOnReconnect(ready && isSignedIn);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={screenOptions}>
            <Stack.Protected guard={isSignedIn} redirectTo="/sign-in">
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="transaction/[id]" options={{ title: 'Expense' }} />
              <Stack.Screen name="category/[id]" options={{ title: 'Category' }} />
              <Stack.Screen name="add" options={{ presentation: 'modal', title: 'Add expense' }} />
            </Stack.Protected>
            <Stack.Protected guard={!isSignedIn}>
              <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
            </Stack.Protected>
          </Stack>
          <ToastHost />
          <StatusBar style={rt.themeName === 'dark' ? 'light' : 'dark'} />
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

/** Keeps the splash screen up until migrations, seed data and the session are ready. */
function useAppReady() {
  const migration = useMigrations(db, migrations);
  const sessionStatus = useSessionStore((s) => s.status);
  const hydrate = useSessionStore((s) => s.hydrate);
  const [seeded, setSeeded] = useState(false);

  if (migration.error) throw migration.error;

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (migration.success) {
      seedDefaults(db).then(() => setSeeded(true));
    }
  }, [migration.success]);

  const ready = seeded && sessionStatus !== 'loading';
  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  return ready;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
