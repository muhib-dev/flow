import { StyleSheet } from 'react-native-unistyles';

import { breakpoints, darkTheme, lightTheme } from './theme';

const themes = { light: lightTheme, dark: darkTheme };

type AppThemes = typeof themes;
type AppBreakpoints = typeof breakpoints;

// Module augmentation must use empty interfaces.
/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  settings: { adaptiveThemes: true },
  themes,
  breakpoints,
});
