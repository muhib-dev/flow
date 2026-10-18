import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text, type TextProps } from './text';

type Action = { label: string; onPress: () => void };

/** Plain text action: label 15 semibold, 44 min hit target. */
export function TextButton({
  label,
  onPress,
  tone = 'primary',
  style,
}: Action & { tone?: 'primary' | 'dangerText'; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.textButton, style, pressed && styles.pressed]}
    >
      <Text variant="label" tone={tone}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Headline title over a hairline, with an optional right detail or text action. */
export function SectionHeader({
  title,
  detail,
  detailTone = 'muted',
  action,
}: {
  title: string;
  detail?: string;
  detailTone?: TextProps['tone'];
  action?: Action;
}) {
  return (
    <View style={[styles.header, !action && styles.headerPlain]}>
      <Text variant="headline" accessibilityRole="header">
        {title}
      </Text>
      {detail ? (
        <Text variant="caption" tone={detailTone} style={styles.semibold}>
          {detail}
        </Text>
      ) : null}
      {action ? <TextButton {...action} /> : null}
    </View>
  );
}

/**
 * A titled group of full-bleed rows. Children cancel the screen gutter so their
 * press state reaches the screen edges; rows pad themselves back in.
 */
export function Section({
  title,
  detail,
  detailTone,
  action,
  children,
  style,
}: {
  title: string;
  detail?: string;
  detailTone?: TextProps['tone'];
  action?: Action;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={style}>
      <SectionHeader title={title} detail={detail} detailTone={detailTone} action={action} />
      <View style={styles.bleed}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  textButton: { minHeight: theme.sizes.hitTarget, justifyContent: 'center' },
  pressed: { opacity: 0.55 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  headerPlain: { alignItems: 'baseline', paddingBottom: theme.space.sm },
  semibold: { fontWeight: theme.typography.label.fontWeight },
  bleed: { marginHorizontal: -theme.space.xl },
}));
