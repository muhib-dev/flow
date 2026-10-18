import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useUnistyles } from 'react-native-unistyles';

/** SF Symbol on iOS, Material Symbol on Android/web. */
export type IconName = SymbolViewProps['name'];

type IconProps = {
  name: IconName;
  size?: number;
  tone?:
    | 'normal'
    | 'muted'
    | 'subtle'
    | 'primary'
    | 'danger'
    | 'dangerText'
    | 'success'
    | 'successText'
    | 'warningText'
    | 'onPrimary'
    | 'onInk'
    | 'onInkMuted';
  /** Overrides `tone`, for data-driven colors like categories. */
  color?: string;
};

const TONE_COLOR = {
  normal: 'text',
  muted: 'textMuted',
  subtle: 'textSubtle',
  primary: 'primary',
  danger: 'danger',
  dangerText: 'dangerText',
  success: 'success',
  successText: 'successText',
  warningText: 'warningText',
  onPrimary: 'onPrimary',
  onInk: 'onInk',
  onInkMuted: 'onInkMuted',
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
