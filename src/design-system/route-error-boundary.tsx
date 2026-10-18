import type { ErrorBoundaryProps } from 'expo-router';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ErrorState } from './state-views';

/** Re-exported as `ErrorBoundary` from route files so each route recovers on its own. */
export function RouteErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.root}>
      <ErrorState message={error.message} onRetry={retry} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
}));
