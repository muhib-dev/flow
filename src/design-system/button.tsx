import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon, type IconName } from './icon';
import { Text } from './text';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'inverse';
  icon?: IconName;
  loading?: boolean;
};

const PRESSED_SCALE = 0.97;

export function Button({
  label,
  variant = 'primary',
  icon,
  loading = false,
  disabled,
  onPress,
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps) {
  const { theme } = useUnistyles();
  styles.useVariants({ variant });
  const scale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const isDisabled = disabled || loading;
  const isFilled = variant === 'primary' || variant === 'danger';
  const tone = isDisabled
    ? 'muted'
    : isFilled
      ? 'onPrimary'
      : variant === 'outline'
        ? 'normal'
        : 'primary';

  return (
    <Animated.View style={scaleStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        style={[styles.button, isDisabled && variant !== 'ghost' && styles.disabled]}
        onPressIn={(e) => {
          scale.set(withSpring(PRESSED_SCALE));
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.set(withSpring(1));
          onPressOut?.(e);
        }}
        onPress={(e) => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress?.(e);
        }}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={isFilled ? theme.colors.onPrimary : theme.colors.primary} />
        ) : (
          <>
            {icon ? <Icon name={icon} size={theme.sizes.iconControl} tone={tone} /> : null}
            <Text variant="headline" tone={tone}>
              {label}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  button: {
    minHeight: theme.sizes.controlHeight,
    paddingHorizontal: theme.space.xl,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    gap: theme.space.sm,
    alignItems: 'center',
    justifyContent: 'center',
    variants: {
      variant: {
        primary: { backgroundColor: theme.colors.primary },
        secondary: { backgroundColor: theme.colors.primaryMuted },
        outline: {
          backgroundColor: theme.colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
        },
        ghost: { backgroundColor: 'transparent' },
        danger: { backgroundColor: theme.colors.danger },
        inverse: { backgroundColor: theme.colors.onPrimary },
      },
    },
  },
  disabled: { backgroundColor: theme.colors.surfaceMuted },
}));
