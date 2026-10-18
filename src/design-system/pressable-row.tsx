import * as Haptics from 'expo-haptics';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type PressableRowProps = Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle> };

/** Row-shaped press target: muted fill while pressed plus a selection tick on tap. */
export function PressableRow({ style, onPress, disabled, ...rest }: PressableRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={disabled || !onPress}
      onPress={(e) => {
        void Haptics.selectionAsync();
        onPress?.(e);
      }}
      style={({ pressed }) => [styles.row, style, pressed && styles.pressed]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  row: { paddingHorizontal: theme.space.lg },
  pressed: { backgroundColor: theme.colors.surfaceMuted },
}));
