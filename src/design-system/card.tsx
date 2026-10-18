import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type CardProps = {
  children: ReactNode;
  /** `ink` is the deep hero surface; pair it with `onInk` text tones. */
  variant?: 'surface' | 'ink';
  /** Inner padding. Off for cards that hold full-width rows. */
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Rounded surface with a soft shadow in light mode and a hairline edge in dark mode. */
export function Card({ children, variant = 'surface', padded = true, style }: CardProps) {
  styles.useVariants({ variant, padded });
  return <View style={[styles.card, style]}>{children}</View>;
}

/**
 * Card of stacked rows split by hairlines. `inset` indents the separators, usually to line
 * up with the row text past a leading badge.
 */
export function ListGroup({
  children,
  inset = 0,
  style,
}: {
  children: ReactNode;
  inset?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <Card padded={false} style={[styles.group, style]}>
      {rows.map((row, i) => (
        <Fragment key={row.key ?? i}>
          {i > 0 ? <View style={styles.separator(inset)} /> : null}
          {row}
        </Fragment>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    borderRadius: theme.radius.card,
    borderCurve: 'continuous',
    variants: {
      variant: {
        surface: {
          backgroundColor: theme.colors.surface,
          boxShadow: theme.shadows.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.separator,
        },
        ink: { backgroundColor: theme.colors.ink, boxShadow: theme.shadows.hero },
      },
      padded: {
        true: { padding: theme.space.lg },
        false: {},
      },
    },
  },
  group: { overflow: 'hidden' },
  separator: (inset: number) => ({
    height: StyleSheet.hairlineWidth,
    marginLeft: theme.space.lg + inset,
    backgroundColor: theme.colors.separator,
  }),
}));
