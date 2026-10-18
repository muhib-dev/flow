import { addNetworkStateListener, getNetworkStateAsync } from 'expo-network';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { syncNow } from '../api/sync';

/** Flushes the offline queue at startup, when the network returns, and when the app foregrounds. */
export function useSyncOnReconnect(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let wasConnected = true;

    getNetworkStateAsync().then((state) => {
      wasConnected = !!state.isConnected;
      if (wasConnected) void syncNow();
    });
    const network = addNetworkStateListener((state) => {
      const connected = !!state.isConnected;
      if (connected && !wasConnected) void syncNow();
      wasConnected = connected;
    });
    const appState = AppState.addEventListener('change', (status) => {
      if (status === 'active' && wasConnected) void syncNow();
    });

    return () => {
      network.remove();
      appState.remove();
    };
  }, [enabled]);
}
