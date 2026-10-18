import { Stack } from 'expo-router';

import { useStackScreenOptions } from '@/design-system/navigation';

export default function Layout() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ title: 'Flow', headerLargeTitle: true }} />
    </Stack>
  );
}
