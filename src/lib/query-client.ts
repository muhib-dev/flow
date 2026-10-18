import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import { addNetworkStateListener } from 'expo-network';
import { AppState } from 'react-native';

onlineManager.setEventListener((setOnline) => {
  const subscription = addNetworkStateListener((state) => setOnline(!!state.isConnected));
  return () => subscription.remove();
});

focusManager.setEventListener((setFocused) => {
  const subscription = AppState.addEventListener('change', (status) =>
    setFocused(status === 'active'),
  );
  return () => subscription.remove();
});

export const queryClient = new QueryClient({
  defaultOptions: {
    // Reads come from local SQLite, so they work offline.
    queries: { networkMode: 'always', staleTime: 30_000 },
    mutations: { networkMode: 'always' },
  },
});
