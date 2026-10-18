import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useUnistyles } from 'react-native-unistyles';

/** SF Symbol on iOS, Material Symbol on Android/web. */
export type IconName = SymbolViewProps['name'];

type IconProps = {
  name: IconName;
  size?: number;
  tone?: 'normal' | 'muted' | 'primary' | 'danger' | 'onPrimary';
  /** Overrides `tone`, for data-driven colors like categories. */
  color?: string;
};

const TONE_COLOR = {
  normal: 'text',
  muted: 'textMuted',
  primary: 'primary',
  danger: 'danger',
  onPrimary: 'onPrimary',
} as const;

export function Icon({ name, size, tone = 'normal', color }: IconProps) {
  const { theme } = useUnistyles();
  return (
    <SymbolView
      name={name}
      size={size ?? theme.sizes.iconMd}
      tintColor={color ?? theme.colors[TONE_COLOR[tone]]}
      weight="semibold"
    />
  );
}
