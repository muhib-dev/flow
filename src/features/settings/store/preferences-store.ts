import { Appearance } from 'react-native';
import { UnistylesRuntime } from 'react-native-unistyles';
import { create } from 'zustand';

import { deviceCurrency, setCurrency } from '@/lib/format';
import { storage } from '@/lib/storage';

export type AppearancePreference = 'system' | 'light' | 'dark';

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'BDT', 'JPY'] as const;

const isAppearance = (v: string | null): v is AppearancePreference =>
  v === 'system' || v === 'light' || v === 'dark';

/** Points Unistyles and native controls (menus, segmented controls) at the same scheme. */
function applyAppearance(pref: AppearancePreference) {
  Appearance.setColorScheme(pref === 'system' ? 'unspecified' : pref);
  if (pref === 'system') {
    UnistylesRuntime.setAdaptiveThemes(true);
  } else {
    UnistylesRuntime.setAdaptiveThemes(false);
    UnistylesRuntime.setTheme(pref);
  }
}

function readAppearance(): AppearancePreference {
  const stored = storage.getString('prefs.appearance');
  return isAppearance(stored) ? stored : 'system';
}

type PreferencesState = {
  appearance: AppearancePreference;
  currency: string;
  setAppearance: (pref: AppearancePreference) => void;
  setCurrency: (code: string) => void;
};

export const usePreferencesStore = create<PreferencesState>((set) => ({
  appearance: readAppearance(),
  currency: storage.getString('prefs.currency') ?? deviceCurrency,
  setAppearance: (appearance) => {
    storage.setString('prefs.appearance', appearance);
    applyAppearance(appearance);
    set({ appearance });
  },
  setCurrency: (currency) => {
    storage.setString('prefs.currency', currency);
    setCurrency(currency);
    set({ currency });
  },
}));

/** Applies stored preferences before the first frame. Call once at startup. */
export function applyStoredPreferences() {
  const { appearance, currency } = usePreferencesStore.getState();
  applyAppearance(appearance);
  setCurrency(currency);
}

/**
 * Remount key for screens that format money: memoized rows don't see a currency change
 * otherwise. `<Fragment key={useCurrencyKey()}>`.
 */
export const useCurrencyKey = () => usePreferencesStore((s) => s.currency);
