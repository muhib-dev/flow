import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Button, Card, Icon, Screen, Text, TextField } from '@/design-system';

import { useSignIn } from '../hooks/use-sign-in';
import { useSessionStore } from '../store/session-store';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

// TODO: replace with real legal pages before release.
const TERMS_URL = 'https://example.com/terms';
const PRIVACY_URL = 'https://example.com/privacy';

const ENTER_STAGGER_MS = 100;
const RING_PULSE_MS = 2400;
const RING_PULSE_SCALE = 1.06;

export function SignInScreen() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const signIn = useSignIn();
  const completeSignIn = useSessionStore((s) => s.signIn);
  // flow://sign-in?email=..&token=.. completes a magic link opened from email.
  const params = useLocalSearchParams<{ email?: string; token?: string }>();

  useEffect(() => {
    if (params.email && params.token) {
      void completeSignIn({ email: params.email, token: params.token });
    }
  }, [params.email, params.token, completeSignIn]);

  const isValid = EMAIL_PATTERN.test(email);

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.root}>
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobBottom]} />

      <Screen scroll insetTop transparent>
        <View style={styles.center}>
          <Animated.View entering={FadeInDown} style={styles.hero}>
            <LogoMark />
            <Text variant="display" align="center">
              Flow
            </Text>
            <Text tone="muted" align="center">
              Track spending. Stay on budget.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(ENTER_STAGGER_MS)}>
            <Card style={styles.form}>
              <TextField
                label="Email"
                icon={{ ios: 'envelope', android: 'mail', web: 'mail' }}
                value={email}
                onChangeText={setEmail}
                onBlur={() => setTouched(true)}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                placeholder="you@example.com"
                error={touched && !isValid ? 'Enter a valid email' : null}
                onSubmitEditing={() => isValid && signIn.mutate(email)}
                returnKeyType="send"
              />
              <Button
                label="Continue with email"
                disabled={!isValid}
                loading={signIn.isPending}
                onPress={() => signIn.mutate(email)}
              />
              <Text variant="caption" tone="muted" align="center">
                We&apos;ll email you a sign-in link. No password needed.
              </Text>
            </Card>
          </Animated.View>
        </View>

        <Text variant="caption" tone="muted" align="center">
          By continuing you agree to our{' '}
          <Text
            variant="caption"
            tone="primary"
            accessibilityRole="link"
            onPress={() => void WebBrowser.openBrowserAsync(TERMS_URL)}
          >
            Terms
          </Text>{' '}
          and{' '}
          <Text
            variant="caption"
            tone="primary"
            accessibilityRole="link"
            onPress={() => void WebBrowser.openBrowserAsync(PRIVACY_URL)}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </Screen>
    </KeyboardAvoidingView>
  );
}

/** App mark wrapped in two slowly breathing rings. */
function LogoMark() {
  const { theme } = useUnistyles();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.set(withRepeat(withTiming(RING_PULSE_SCALE, { duration: RING_PULSE_MS }), -1, true));
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.get() }] }));

  return (
    <View style={styles.logoArea} accessibilityElementsHidden importantForAccessibility="no">
      <Animated.View style={[styles.ring, styles.ringInner, pulseStyle]} />
      <View style={styles.logo}>
        <Icon
          name={{ ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' }}
          size={theme.sizes.iconLg}
          tone="onPrimary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1, backgroundColor: theme.colors.background, overflow: 'hidden' },
  blob: {
    position: 'absolute',
    width: theme.sizes.backdropBlob,
    height: theme.sizes.backdropBlob,
    borderRadius: theme.radius.pill,
  },
  blobTop: {
    top: -theme.sizes.backdropBlob / 3,
    left: -theme.sizes.backdropBlob / 3,
    backgroundColor: theme.colors.primaryMuted,
  },
  blobBottom: {
    bottom: -theme.sizes.backdropBlob / 3,
    right: -theme.sizes.backdropBlob / 3,
    backgroundColor: theme.colors.accentGlow,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.space.xxl,
    width: '100%',
    maxWidth: theme.sizes.formMaxWidth,
    alignSelf: 'center',
  },
  hero: { alignItems: 'center', gap: theme.space.xs },
  logoArea: {
    width: theme.sizes.logoRingOuter,
    height: theme.sizes.logoRingOuter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: { position: 'absolute', borderRadius: theme.radius.pill, borderWidth: 1 },
  ringOuter: {
    width: theme.sizes.logoRingOuter,
    height: theme.sizes.logoRingOuter,
    borderColor: theme.colors.primaryMuted,
  },
  ringInner: {
    width: theme.sizes.logoRingInner,
    height: theme.sizes.logoRingInner,
    borderColor: theme.colors.primaryMuted,
    backgroundColor: theme.colors.primaryMuted,
  },
  logo: {
    width: theme.sizes.logo,
    height: theme.sizes.logo,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: theme.shadows.primary,
  },
  form: {
    gap: theme.space.xl,
    padding: theme.space.xl,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.background,
  },
}));
