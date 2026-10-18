import { Pressable, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, LinearTransition } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from './text';
import { useToastStore, type Toast } from './toast-store';

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <View pointerEvents="box-none" style={styles.host}>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </View>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  styles.useVariants({ tone: toast.tone });
  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutDown}
      layout={LinearTransition}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={styles.toast}
    >
      <Text variant="callout" tone="onPrimary" style={styles.message}>
        {toast.message}
      </Text>
      {toast.action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={toast.action.label}
          hitSlop={8}
          onPress={() => {
            toast.action?.onPress();
            dismiss(toast.id);
          }}
        >
          <Text variant="headline" tone="onPrimary">
            {toast.action.label}
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  host: {
    position: 'absolute',
    left: theme.space.lg,
    right: theme.space.lg,
    bottom: rt.insets.bottom + theme.space.xxxl * 2,
    gap: theme.space.sm,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.md,
    borderRadius: theme.radius.md,
    variants: {
      tone: {
        info: { backgroundColor: theme.colors.text },
        success: { backgroundColor: theme.colors.success },
        error: { backgroundColor: theme.colors.danger },
      },
    },
  },
  message: { flex: 1 },
}));
