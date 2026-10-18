import { NativeTabs } from 'expo-router/native-tabs';
import { useUnistyles } from 'react-native-unistyles';

/**
 * Ledger tab bar: flat `background` with a hairline top, active tab in `text` with a
 * filled icon, inactive tabs in `textMuted`, caption-sized labels. On iOS 26+ the
 * system draws the glass bar itself and ignores background and shadow colors.
 */
export default function TabsLayout() {
  const { theme } = useUnistyles();
  const { caption, label } = theme.typography;
  return (
    <NativeTabs
      tintColor={theme.colors.text}
      iconColor={{ default: theme.colors.textMuted, selected: theme.colors.text }}
      labelStyle={{
        default: { color: theme.colors.textMuted, fontSize: caption.fontSize },
        selected: {
          color: theme.colors.text,
          fontSize: caption.fontSize,
          fontWeight: label.fontWeight,
        },
      }}
      backgroundColor={theme.colors.background}
      shadowColor={theme.colors.border}
      disableTransparentOnScrollEdge
      indicatorColor={theme.colors.surfaceMuted}
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
        <NativeTabs.Trigger.Icon
          sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
          md="settings"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
