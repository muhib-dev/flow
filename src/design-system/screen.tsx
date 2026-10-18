import type { ReactElement, ReactNode } from 'react';
import { ScrollView, View, type RefreshControlProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type ScreenProps = {
  children: ReactNode;
  /** Scroll the content. Leave off for screens that render their own list. */
  scroll?: boolean;
  /** Pad the top inset. Off for screens under a native header. */
  insetTop?: boolean;
  /** Skip the background color so decoration behind the screen shows through. */
  transparent?: boolean;
  /** Pull-to-refresh, scroll screens only. */
  refreshControl?: ReactElement<RefreshControlProps>;
};

export function Screen({
  children,
  scroll = false,
  insetTop = false,
  transparent = false,
  refreshControl,
}: ScreenProps) {
  styles.useVariants({ insetTop, transparent });
  if (scroll) {
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
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
    paddingHorizontal: theme.space.gutter,
    paddingBottom: rt.insets.bottom + theme.space.xxl,
    variants: {
      insetTop: {
        true: { paddingTop: rt.insets.top + theme.space.sm },
        false: { paddingTop: theme.space.sm },
      },
    },
  },
}));
