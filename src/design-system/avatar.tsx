import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from './text';

/** Initials on the deep `ink` disc. */
export function Avatar({ initials, size = 'md' }: { initials: string; size?: 'md' | 'lg' }) {
  styles.useVariants({ size });
  return (
    <View style={styles.avatar} accessibilityElementsHidden>
      <Text variant={size === 'lg' ? 'headline' : 'caption'} weight="bold" tone="onInk">
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  avatar: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    variants: {
      size: {
        md: { width: theme.sizes.avatar, height: theme.sizes.avatar },
        lg: { width: theme.sizes.avatarLg, height: theme.sizes.avatarLg },
      },
    },
  },
}));
