import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Button, Icon, Screen, Text, TextField } from '@/design-system';

import { useSignIn } from '../hooks/use-sign-in';
import { useSessionStore } from '../store/session-store';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

// TODO: replace with real legal pages before release.
const TERMS_URL = 'https://example.com/terms';
const PRIVACY_URL = 'https://example.com/privacy';

const ENTER_STAGGER_MS = 90;
const LOGO_ICON = {
  ios: 'chart.line.uptrend.xyaxis',
  android: 'trending_up',
  web: 'trending_up',
} as const;

export function SignInScreen() {
  const { theme } = useUnistyles();
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
      <Screen scroll insetTop>
        <View style={styles.center}>
          <Animated.View entering={FadeInDown} style={styles.hero}>
            <View style={styles.logo} accessibilityElementsHidden importantForAccessibility="no">
              <Icon name={LOGO_ICON} size={theme.sizes.iconMd} tone="onPrimary" />
            </View>
            <Text variant="display" accessibilityRole="header">
              Flow
            </Text>
            <Text variant="callout" tone="muted">
              Know what&apos;s safe to spend today.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(ENTER_STAGGER_MS)} style={styles.form}>
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
            <Text variant="caption" tone="muted">
              We&apos;ll email you a sign-in link. No password needed.
            </Text>
          </Animated.View>
        </View>

        <Text variant="caption" tone="muted" style={styles.legal}>
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

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.space.xxxl,
    width: '100%',
    maxWidth: theme.sizes.formMaxWidth,
    alignSelf: 'center',
  },
  hero: { gap: theme.space.xs },
  logo: {
    width: theme.sizes.categoryBadge,
    height: theme.sizes.categoryBadge,
    marginBottom: theme.space.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: theme.space.lg,
    paddingTop: theme.space.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  legal: { marginTop: theme.space.xl },
}));
