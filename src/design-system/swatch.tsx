import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

/** 8pt category-color dot. Decorative: the category name always sits next to it. */
export function Swatch({ color }: { color: string }) {
  return <View style={styles.swatch(color)} accessibilityElementsHidden />;
}

const styles = StyleSheet.create((theme) => ({
  swatch: (color: string) => ({
    width: theme.sizes.swatchSm,
    height: theme.sizes.swatchSm,
    borderRadius: theme.radius.pill,
    backgroundColor: color,
  }),
}));
