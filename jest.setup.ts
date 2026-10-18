import '@/design-system/unistyles';
import 'react-native-unistyles/mocks';

jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));

// Reanimated 4.7's own Jest fallback throws while initializing CSS animations, so component
// tests get a minimal stand-in: animated views are plain views and values settle at once.
jest.mock('react-native-reanimated', () => {
  const { View, Text, ScrollView } = require('react-native');
  const identity = (v: unknown) => v;
  const builder: Record<string, unknown> = {};
  for (const key of ['duration', 'delay', 'easing', 'withInitialValues', 'springify']) {
    builder[key] = () => builder;
  }
  const sharedValue = (initial: unknown) => {
    let value = initial;
    return {
      get: () => value,
      set: (next: unknown) => {
        value = next;
      },
      value,
    };
  };
  const Easing = {
    bezier: () => identity,
    inOut: () => identity,
    ease: identity,
    linear: identity,
  };
  return {
    __esModule: true,
    default: { View, Text, ScrollView, createAnimatedComponent: identity },
    Easing,
    FadeInDown: builder,
    FadeOutDown: builder,
    LinearTransition: builder,
    useSharedValue: sharedValue,
    useDerivedValue: (fn: () => unknown) => sharedValue(fn()),
    useAnimatedStyle: (fn: () => unknown) => fn(),
    useReducedMotion: () => true,
    withTiming: identity,
    withSpring: identity,
    withDelay: (_: number, v: unknown) => v,
    withRepeat: identity,
  };
});
