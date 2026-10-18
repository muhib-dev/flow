import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { StyleSheet, useUnistyles, withUnistyles } from 'react-native-unistyles';

import { Icon, type IconName } from './icon';
import { Text } from './text';

type TextFieldProps = TextInputProps & {
  label: string;
  icon?: IconName;
  error?: string | null;
};

const ThemedInput = withUnistyles(TextInput, (theme) => ({
  placeholderTextColor: theme.colors.textMuted,
  selectionColor: theme.colors.primary,
}));

export function TextField({ label, icon, error, style, onFocus, onBlur, ...rest }: TextFieldProps) {
  const { theme } = useUnistyles();
  const [focused, setFocused] = useState(false);
  styles.useVariants({ state: error ? 'error' : focused ? 'focused' : 'idle' });

  return (
    <View style={styles.container}>
      <Text variant="label">{label}</Text>
      <View style={styles.field}>
        {icon ? (
          <Icon name={icon} size={theme.sizes.iconControl} tone={focused ? 'primary' : 'muted'} />
        ) : null}
        <ThemedInput
          accessibilityLabel={label}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
          style={[styles.input, style]}
        />
      </View>
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { gap: theme.space.sm },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    minHeight: theme.sizes.controlHeight,
    paddingHorizontal: theme.space.lg,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    variants: {
      state: {
        idle: { borderColor: theme.colors.border },
        focused: {
          borderColor: theme.colors.primary,
          boxShadow: `0px 0px 0px ${theme.sizes.focusRing}px ${theme.colors.primaryMuted}`,
        },
        error: { borderColor: theme.colors.danger },
      },
    },
  },
  input: {
    ...theme.typography.body,
    flex: 1,
    alignSelf: 'stretch',
    color: theme.colors.text,
  },
}));
