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

/** Section title with an optional right-side detail or text action. Sits above a card. */
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
    <View style={styles.header}>
      <Text variant="headline" accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {detail ? (
        <Text variant="caption" weight="semibold" tone={detailTone}>
          {detail}
        </Text>
      ) : null}
      {action ? <TextButton {...action} /> : null}
    </View>
  );
}

/** A titled block: header, then its card(s). Stack sections with `space.section` between. */
export function Section({
  title,
  detail,
  detailTone,
  action,
  footer,
  children,
  style,
}: {
  title?: string;
  detail?: string;
  detailTone?: TextProps['tone'];
  action?: Action;
  /** Caption under the card, like an iOS grouped-table footer. */
  footer?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.section, style]}>
      {title ? (
        <SectionHeader title={title} detail={detail} detailTone={detailTone} action={action} />
      ) : null}
      {children}
      {footer ? (
        <Text variant="caption" tone="muted" style={styles.footer}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  textButton: { minHeight: theme.sizes.hitTarget, justifyContent: 'center' },
  pressed: { opacity: theme.opacity.pressed },
  section: { marginTop: theme.space.section },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    minHeight: theme.sizes.hitTarget,
    paddingHorizontal: theme.space.xs,
  },
  title: { flex: 1 },
  footer: { marginTop: theme.space.sm, paddingHorizontal: theme.space.lg },
}));
