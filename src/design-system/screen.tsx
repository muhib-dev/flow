import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type ScreenProps = {
  children: ReactNode;
  /** Scroll the content. Leave off for screens that render their own list. */
  scroll?: boolean;
  /** Pad the top inset. Off for screens under a native header. */
  insetTop?: boolean;
  /** Skip the background color so decoration behind the screen shows through. */
  transparent?: boolean;
};

export function Screen({
  children,
  scroll = false,
  insetTop = false,
  transparent = false,
}: ScreenProps) {
  styles.useVariants({ insetTop, transparent });
  if (scroll) {
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }
  return <View style={[styles.root, styles.content]}>{children}</View>;
}

const styles = StyleSheet.create((theme, rt) => ({
  root: {
    flex: 1,
    variants: {
      transparent: {
        true: { backgroundColor: 'transparent' },
        false: { backgroundColor: theme.colors.background },
      },
    },
  },
  content: {
    flexGrow: 1,
    gap: theme.space.lg,
    paddingHorizontal: theme.space.lg,
    paddingBottom: rt.insets.bottom + theme.space.lg,
    variants: {
      insetTop: {
        true: { paddingTop: rt.insets.top + theme.space.lg },
        false: { paddingTop: theme.space.lg },
      },
    },
  },
}));
