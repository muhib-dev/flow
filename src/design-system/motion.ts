import { Easing, FadeInDown } from 'react-native-reanimated';
import { useUnistyles } from 'react-native-unistyles';

/** Shared ease-out for fills, charts and entrances. Kept out of the theme: themes must stay plain data. */
export const MOTION_EASING = Easing.bezier(0.2, 0.8, 0.2, 1);

/** Staggered fade-up for the blocks of a screen: `entering={enter(0)}`, `enter(1)`… */
export function useEntering() {
  const { theme } = useUnistyles();
  return (index: number) =>
    FadeInDown.duration(theme.motion.enterMs)
      .delay(index * theme.motion.staggerMs)
      .easing(MOTION_EASING)
      .withInitialValues({ opacity: 0, transform: [{ translateY: theme.space.md }] });
}
