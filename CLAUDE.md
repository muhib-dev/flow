# Flow — project rules for Claude Code

## Stack

Expo SDK 58, React Native 0.88, React 19.3, TypeScript strict, New Architecture, React Compiler enabled.
Expo Router (typed routes, native tabs, API routes for the mock server), TanStack Query v5, Zustand,
Drizzle + expo-sqlite, expo-sqlite/kv-store (key/values), expo-secure-store (secrets), expo-network,
Reanimated 4 + react-native-worklets, Gesture Handler, Unistyles 3, expo-image, FlashList v2,
react-native-keyboard-controller, @expo/ui (BottomSheet, Menu, Picker, DateTimePicker, SegmentedControl, Slider),
@shopify/react-native-skia, expo-widgets, expo-observe, Maestro, Jest (jest-expo) + RNTL.

## Library selection (Expo first)

- Before adding any library or building any feature, check the Expo docs (Context7 `/websites/expo_dev_versions_unversioned` or docs.expo.dev) for an Expo package or an Expo-recommended library, and use it.
- Only if Expo has nothing, pick a valid, popular, actively maintained library that supports New Architecture and SDK 58.
- Prefer @expo/ui drop-in replacements over community equivalents (BottomSheet over @gorhom/bottom-sheet, Picker, DateTimePicker, Menu, Slider, SegmentedControl, PagerView, MaskedView).
- Always install with `npx expo install <pkg>` so the SDK-compatible version is pinned.

## Commands

- Node 22.13+ / 24.3+ (no odd releases).
- `npx expo start` dev server (use dev client; SDK 58 needs a development build)
- `npx expo prebuild --clean` regenerate native dirs (never commit ios/ android/)
- `npm run typecheck` `npm run lint` `npm run test` must pass before any commit
- `maestro test e2e/` for end-to-end

## Conventions

- Feature folders under src/features/<name>/{components,hooks,api,store,**tests**}
- Routes live in src/app/ (SDK 58 default) and are thin; import screens from features. Mock API = src/app/api/*+api.ts.
- Local data: Drizzle schema in src/lib/db/schema.ts; after changing it run `npm run db:generate` and commit drizzle/.
- Styles via Unistyles `StyleSheet.create` with theme tokens; no magic numbers, use spacing scale.
- Use the Strict TypeScript API: never import from react-native/Libraries/\*.
- Animations run on the UI thread (Reanimated worklets). No Animated API from RN core.
- Lists: FlashList with stable keyExtractor, getItemType, memoized row components.
- Images: expo-image with contentFit, placeholder (thumbhash), cachePolicy.
- Handle platform divergence with .ios.tsx/.android.tsx files, not scattered Platform.OS checks.
- Every async action: optimistic update + rollback + toast on failure.

## Do not

- Add a library without checking Expo docs first and confirming New Architecture + SDK 58 support.
- Use localStorage/AsyncStorage/MMKV for new code (expo-sqlite/kv-store or Drizzle tables).
- Write snapshot tests for screens (only design-system components).
- Profile in dev mode; always `--variant release` / `--configuration Release`.
