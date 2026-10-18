import { NativeTabs } from 'expo-router/native-tabs';
import { useUnistyles } from 'react-native-unistyles';

import { usePendingWrites } from '@/features/transactions/hooks/use-pending-writes';

/**
 * Tab bar on `background` with a hairline top: the active tab takes the brand `primary`
 * with a filled icon, inactive tabs sit in `textMuted`. Settings carries a badge while
 * changes wait to sync. On iOS 26+ the system draws the glass bar itself and ignores
 * background and shadow colors.
 */
export default function TabsLayout() {
  const { theme } = useUnistyles();
  const { caption, label } = theme.typography;
  const pending = usePendingWrites();
  const waiting = pending.data ?? 0;
  return (
    <NativeTabs
      tintColor={theme.colors.primary}
      iconColor={{ default: theme.colors.textMuted, selected: theme.colors.primary }}
      labelStyle={{
        default: { color: theme.colors.textMuted, fontSize: caption.fontSize },
        selected: {
          color: theme.colors.primary,
          fontSize: caption.fontSize,
          fontWeight: label.fontWeight,
        },
      }}
      backgroundColor={theme.colors.background}
      shadowColor={theme.colors.border}
      disableTransparentOnScrollEdge
      indicatorColor={theme.colors.primaryMuted}
      rippleColor={theme.colors.surfaceMuted}
      labelVisibilityMode="labeled"
    >
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="transactions">
        <NativeTabs.Trigger.Label>Expenses</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'list.bullet.rectangle', selected: 'list.bullet.rectangle.fill' }}
          md="receipt_long"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="insights">
        <NativeTabs.Trigger.Label>Insights</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'chart.pie', selected: 'chart.pie.fill' }}
          md="donut_large"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Badge hidden={waiting === 0}>
          {String(waiting)}
        </NativeTabs.Trigger.Badge>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
          md="settings"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
