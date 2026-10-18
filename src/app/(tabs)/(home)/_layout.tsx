import { Stack } from 'expo-router';

import { useStackScreenOptions } from '@/design-system/navigation';

export default function Layout() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      {/* The dashboard draws its own month header. */}
      <Stack.Screen name="index" options={{ title: 'Flow', headerShown: false }} />
    </Stack>
  );
}
