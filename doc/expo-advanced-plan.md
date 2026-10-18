# Advanced React Native + Expo Plan — "Flow" Demo App

> A 10-week learning plan built around one real app. Each phase has learning goals, concrete tasks, acceptance criteria, and a ready-to-paste Claude Code prompt. Work phase by phase; do not skip ahead.

**Target stack (as of October 2026):** Expo SDK 58 · React Native 0.88 · React 19.3 · TypeScript (Strict TypeScript API) · New Architecture only · React Compiler on.

---

## 0. The demo app: Flow

**What it is:** A personal expense and budget tracker. Chosen because it naturally needs every advanced topic: large lists, forms, charts, offline data, sync, animation-heavy UI, native platform features, notifications, widgets, and a real release pipeline.

**Core user stories**

1. Sign in (email + magic link or mock OAuth) and stay signed in.
2. Add an expense fast: amount, category, note, optional receipt photo.
3. See a scrollable, searchable transaction list with swipe-to-delete and undo.
4. See monthly budgets per category with animated progress rings and a spending chart.
5. Get a notification when a budget hits 80% and 100%.
6. Work fully offline; sync when back online.
7. Home-screen widget showing remaining budget (Android + iOS).
8. Light/dark theme, large-text support, RTL-safe layouts.
9. Receives over-the-air fixes; crashes are reported.

**Screens**

| Route | Purpose |
|---|---|
| `(auth)/sign-in` | Auth flow, protected-route redirect |
| `(tabs)/index` | Dashboard: budgets, chart, recent transactions |
| `(tabs)/transactions` | Full list, search, filters, swipe actions |
| `(tabs)/insights` | Charts by category / month |
| `(tabs)/settings` | Theme, currency, notifications, export, about |
| `transaction/[id]` | Detail + edit |
| `add` (modal) | Quick-add sheet with numeric keypad |
| `category/[id]` | Category budget detail |

---

## 1. Repository layout

```
flow/
├── app/                     # Expo Router routes only (thin files)
│   ├── (auth)/
│   ├── (tabs)/
│   ├── transaction/[id].tsx
│   ├── add.tsx
│   └── _layout.tsx
├── src/
│   ├── features/            # feature = ui + hooks + api + store + tests
│   │   ├── auth/
│   │   ├── transactions/
│   │   ├── budgets/
│   │   ├── insights/
│   │   └── settings/
│   ├── design-system/       # tokens, Text, Button, Card, Sheet, Skeleton...
│   ├── lib/                 # db, query client, storage, analytics, errors
│   ├── hooks/               # cross-feature hooks
│   └── native/              # Expo Modules (widget, intents)
├── modules/                 # local Expo modules (SDK 56+ in-project modules)
├── e2e/                     # Maestro flows
├── CLAUDE.md
├── app.config.ts
└── eas.json
```

**Rules enforced from day one**

- `app/` files only compose feature components; no business logic in routes.
- Server data lives in TanStack Query; UI state in Zustand; persistent local data in SQLite (Drizzle); tiny key/values in `expo-sqlite/kv-store`; secrets in `expo-secure-store`.
- Expo first: check the Expo docs for an Expo package or Expo-recommended library before reaching for anything else.

### SDK 58 Expo-first package map

| Original choice | Use instead (SDK 58) | Why |
|---|---|---|
| `@gorhom/bottom-sheet` | `@expo/ui` `BottomSheet` | API-compatible drop-in, native SwiftUI / Compose sheet |
| MMKV | `expo-sqlite/kv-store` | Sync + async KV on the SQLite we already ship |
| Sentry | `expo-observe` | JS errors, native crashes, error boundary, source maps via EAS |
| Community picker / menu / slider / segmented / pager | `@expo/ui` drop-ins | Native controls, same API |
| `@react-native-community/netinfo` | `expo-network` | Expo-native connectivity hook |
| Hand-written widget Expo Module | `expo-widgets` | iOS + Android widgets built in since SDK 58 |
| Hand-written App Intents module | `expo-app-intents` (alpha) | Siri / Shortcuts / Spotlight |
| `msw` / Hono mock server | Expo Router API routes (`+api.ts`) | Mock API lives in the app repo |
| `react-native-performance` | `expo-observe` metrics first | Add RNP only for marks Observe can't do |
- No inline styles in list items. No anonymous functions passed to list renderers.
- Every screen has loading, empty, error states.
- Every interactive element has an accessibility role and label.

---

## 2. CLAUDE.md

The live copy is `CLAUDE.md` at the repo root (stack updated to the SDK 58 Expo-first map above, plus a "Library selection" rule: check Expo docs first, use the Expo package or Expo-recommended library, otherwise a valid popular library that supports New Architecture + SDK 58, always installed with `npx expo install`).

---

## 3. Phase plan

### Phase 0 — Foundation (Week 1)

**Learn**
- New Architecture: Fabric, TurboModules, JSI; why old "bridge" advice is obsolete.
- Strict TypeScript API migration (RN 0.87+).
- Continuous Native Generation, config plugins, dev clients, EAS Build profiles.
- React Compiler: what it auto-memoizes, how to verify with the compiler health check.

**Tasks**
1. `npx create-expo-app@latest flow` on SDK 58, TypeScript strict, Expo Router.
2. Enable React Compiler; run `npx react-compiler-healthcheck`.
3. Add ESLint (expo config + react-compiler plugin), Prettier, absolute imports (`@/`).
4. Create `eas.json` with `development`, `preview`, `production` profiles.
5. Build a dev client for iOS simulator and Android emulator.
6. Add `CLAUDE.md`, `.github/workflows/ci.yml` (typecheck, lint, test).
7. Set up environment variables with `EXPO_PUBLIC_*` and EAS secrets.

**Acceptance**
- `npm run typecheck && npm run lint && npm test` pass in CI.
- Dev client installs and hot-reloads on both platforms.
- No `ios/` or `android/` in git.

**Claude Code prompt**
> Set up Phase 0 of Flow per CLAUDE.md: scaffold on Expo SDK 58 with TypeScript strict and Expo Router, enable React Compiler and run the health check, configure ESLint/Prettier/absolute imports, create eas.json with development/preview/production profiles, add a GitHub Actions CI workflow running typecheck, lint and tests. Do not add any feature code yet. Show me the final file tree and confirm all checks pass.

---

### Phase 1 — Architecture, data, navigation (Weeks 2–3)

**Learn**
- Server state vs client state; why mixing them causes stale UI.
- TanStack Query: keys, invalidation, optimistic updates, `persistQueryClient` for offline.
- Expo Router: typed routes, groups, protected routes, modals, data loaders, deep links, native tabs.
- Drizzle + expo-sqlite migrations; `expo-sqlite/kv-store` for settings; SecureStore for tokens.
- Error boundaries per route and a global toast system.

**Tasks**
1. Design system skeleton first (so screens never use raw `<Text>`): tokens, `Text`, `Button`, `Card`, `Screen` wrapper with safe areas.
2. Auth feature: sign-in screen, token in SecureStore, `useSession` hook, protected `(tabs)` group with redirect.
3. Local DB: `transactions`, `categories`, `budgets` tables via Drizzle; migration runner on app start behind splash.
4. Mock API as Expo Router API routes (`app/api/*+api.ts`) with artificial latency and random failures.
5. `transactions` feature: query hooks, `useAddTransaction` with optimistic update + rollback, offline queue flushed on reconnect (`expo-network`).
6. Routes wired with native tabs; `add` as modal; `transaction/[id]` with typed params; deep link `flow://transaction/123`.
7. Loading/empty/error states on every screen; error boundary with "retry" per route.

**Acceptance**
- Kill network mid-add: item appears instantly, syncs when network returns, never duplicates.
- Deep link opens the correct detail screen cold and warm.
- Typecheck fails if a route param is misspelled.

**Claude Code prompt**
> Implement Phase 1 of Flow. Create src/design-system with tokens (spacing 4-pt scale, type scale, light/dark color roles) using Unistyles 3, plus Screen/Text/Button/Card. Build the auth feature with SecureStore and a protected (tabs) group. Set up Drizzle + expo-sqlite with tables transactions, categories, budgets and a migration runner behind the splash screen. Add a mock API as Expo Router API routes with latency and 10% failure rate. Implement the transactions feature with TanStack Query: list, detail, add with optimistic update and rollback, and an offline mutation queue that flushes on reconnect. Wire Expo Router with native tabs, the add modal, typed routes, and a deep link to transaction/[id]. Every screen must have loading, empty and error states. Write unit tests for the offline queue.

---

### Phase 2 — Performance (Weeks 4–5)

**Learn**
- Measure before optimizing: React Native DevTools profiler and performance screenshots, Perfetto (Android), Instruments (iOS), `expo-observe` metrics (custom marks via `react-native-performance` only if Observe lacks them).
- FlashList v2 internals: recycling, `getItemType`, why row components must be pure.
- expo-image caching, thumbhash placeholders, correct `contentFit`, server-side sizing.
- Startup: lazy routes, asset preloading, font loading, bundle analysis.
- JS-thread hygiene: worklets, debounce, `InteractionManager`, avoiding re-render cascades.

**Tasks**
1. Seed 10,000 transactions; record baseline: TTI, list FPS, memory, bundle size (release build).
2. Convert list to FlashList v2 with `getItemType` (header / transaction / date separator); memoize rows; move formatting to a cached util.
3. Receipt thumbnails via expo-image with thumbhash placeholder and `cachePolicy="memory-disk"`.
4. Search with debounced input running in a worklet-friendly way; filter in SQLite, not JS.
5. Startup: keep splash until fonts + session + DB migration resolve; lazy-load insights route; analyze bundle with `npx expo export` + source-map-explorer; replace full icon library with a tree-shaken set.
6. Instrument with `expo-observe` (fall back to `react-native-performance`) for `app_start`, `list_first_render`, `add_transaction`.
7. Record after-numbers; write `docs/perf-report.md`.

**Acceptance**
- 10k-item list scrolls at 60 fps on a mid-range Android (release build).
- Cold TTI under 2s on that device.
- JS bundle reduced by at least 20% from baseline.

**Claude Code prompt**
> Phase 2 of Flow: performance. First add a dev-only script to seed 10,000 transactions and instrument app_start, list_first_render and add_transaction with expo-observe (react-native-performance only for marks Observe cannot record). Then: migrate the transactions list to FlashList v2 with getItemType and memoized pure row components; move search/filter into SQLite queries with a debounced input; switch receipt thumbnails to expo-image with thumbhash placeholders; gate the splash screen on fonts, session and migrations; lazy-load the insights route; run npx expo export and source-map-explorer and remove the two largest avoidable dependencies. Produce docs/perf-report.md with before/after numbers and explain each change in one line.

---

### Phase 3 — Professional UI and animation (Weeks 6–7)

**Learn**
- Design systems: tokens → primitives → components. Typography and spacing discipline. Apple HIG vs Material 3.
- Reanimated 4: shared values, `withSpring`/`withTiming`, layout animations, entering/exiting, scroll-driven animations, `useAnimatedScrollHandler`, gesture + animation composition.
- Gesture Handler: swipeable rows, pan-driven sheets, long-press menus.
- Micro-interactions: haptics, skeletons, pressed states, toast/sheet transitions.
- Expo UI (SwiftUI / Jetpack Compose) for native controls; Liquid Glass on iOS 27; variable fonts.
- Accessibility: dynamic type, reduced motion, 44-pt targets, focus order.

**Tasks**
1. Finish the design system: variable font via expo-font with `fontVariationSettings`; `Text` variants; `Button` with pressed scale + haptic; `Card`; `Skeleton` shimmer; `Toast`; `Sheet` (`@expo/ui` `BottomSheet`).
2. Dashboard: animated budget rings (Skia or SVG + Reanimated), numbers that count up, header that collapses on scroll.
3. Transactions list: swipe-to-delete with undo toast; layout animations on insert/remove; date headers that stick.
4. Quick-add modal: custom numeric keypad with key-press animation and haptics; amount text that scales on input; keyboard handled with `react-native-keyboard-controller`.
5. Category picker as a native `@expo/ui` `Menu` on iOS and an `@expo/ui` `BottomSheet` on Android.
6. Insights: animated bar/line chart with scrubbing gesture and a tooltip that follows the finger.
7. Settings: theme toggle with animated crossfade; respects system theme and reduced motion.
8. Accessibility pass: VoiceOver/TalkBack walk-through of every screen; large-text screenshots.

**Acceptance**
- Every animation runs on the UI thread (verify with DevTools: no JS-thread spikes during gestures).
- App usable at 200% font scale without clipped text.
- A non-developer says "this looks like a real app" when shown side by side with the old version.

**Claude Code prompt**
> Phase 3 of Flow: UI and animation. Complete the design system (variable font, Text variants, Button with pressed scale and haptics, Card, Skeleton, Toast, Sheet). Build the dashboard with Reanimated 4 budget rings and a collapsing header driven by scroll. Add swipe-to-delete with undo and layout animations to the transaction list. Build the quick-add modal with a custom animated numeric keypad and keyboard-controller. Use Expo UI for a native category menu on iOS and a bottom sheet on Android via .ios.tsx/.android.tsx. Add a scrubbable insights chart. All animations must use worklets on the UI thread; respect reduced-motion; every control needs accessibility props. Finish with an accessibility checklist in docs/a11y.md.

---

### Phase 4 — Cross-platform correctness and native features (Week 8)

**Learn**
- Safe areas, Android edge-to-edge, status/navigation bar theming, keyboard avoidance.
- Platform conventions: iOS swipe-back and large titles; Android predictive back; where sheets vs dialogs belong.
- Permissions UX; notifications; background tasks.
- Local Expo Modules: widgets (iOS WidgetKit, Android Glance), App Intents for Siri.
- Device matrix: small Android, tablets, foldables, Dynamic Island, RTL, large fonts.

**Tasks**
1. Edge-to-edge audit on Android; safe-area audit on iOS incl. landscape and Dynamic Island.
2. Predictive back on Android; large title + swipe back on iOS transactions stack.
3. Notifications: schedule budget alerts at 80% / 100% with `expo-notifications`; request permission in context, handle "denied forever" with a settings deep link.
4. Receipt capture with `expo-camera` / `expo-image-picker`, compressed before save.
5. Home-screen widget showing remaining budget with `expo-widgets` (iOS + Android in SDK 58); shared data through the widget data API / App Group.
6. iOS App Intent: "Add expense to Flow" via Siri with `expo-app-intents` (alpha, optional stretch).
7. RTL check with `I18nManager.forceRTL(true)` dev toggle; tablet layout with two-pane transactions list/detail.
8. Write `docs/platform-checklist.md` and run it.

**Acceptance**
- No content under system bars on any test device.
- Widget updates within a minute of adding a transaction.
- Notification fires correctly with app killed.

**Claude Code prompt**
> Phase 4 of Flow: cross-platform and native. Audit and fix edge-to-edge and safe areas on both platforms. Enable predictive back on Android and native large titles with swipe-back on iOS. Implement budget-threshold notifications with expo-notifications, with in-context permission requests and a "denied" fallback that deep-links to settings. Add receipt capture with compression. Use expo-widgets for a home-screen widget showing remaining budget on iOS and Android, sharing data through its data API / App Group. Add a dev toggle for RTL and a two-pane tablet layout. Produce docs/platform-checklist.md.

---

### Phase 5 — Quality, release, maintenance (Weeks 9–10)

**Learn**
- Testing pyramid for RN: unit (Jest + RNTL), component (design system only), e2e (Maestro).
- Observability: `expo-observe` errors, crashes + performance, analytics events, feature flags.
- EAS Build/Submit/Update, fingerprint presets, bytecode diffing, rollout strategy.
- Store assets: icons, adaptive icons, splash, screenshots, privacy manifests.
- Security: no secrets in bundle, token refresh, certificate pinning when warranted.
- Upgrade discipline across SDK versions.

**Tasks**
1. Tests: unit tests for query hooks, offline queue, formatters; RNTL tests for Button/Text/Sheet; Maestro flows: sign-in, add transaction offline → sync, delete with undo.
2. `expo-observe` with `uploadSourceMaps` in EAS Build; wrap root in `ObserveErrorBoundary`; report handled errors with `reportError`.
3. Analytics wrapper with typed events; feature flag for the new insights chart.
4. EAS Update channels: `preview`, `production`; test an OTA fix end to end; verify fingerprint behavior when a native dep changes.
5. Store assets with `expo-splash-screen` config plugin and adaptive icons; iOS privacy manifest; Android data safety notes.
6. CI: PR → typecheck/lint/test/maestro on EAS Workflows; main → preview build; tag → production build + submit.
7. Write `docs/release-runbook.md` and `docs/upgrade-runbook.md` (SDK upgrade steps with `npx expo install --fix`, `npx expo-doctor`, changelog review).

**Acceptance**
- CI green; e2e runs on a PR.
- A deliberate crash appears in EAS Observe with a readable stack trace.
- An OTA update reaches a preview build without a store submission.

**Claude Code prompt**
> Phase 5 of Flow: quality and release. Add Jest + RNTL tests for hooks and design-system components, and Maestro flows for sign-in, offline add → sync, and delete with undo. Integrate expo-observe with source-map upload in EAS Build and a root ObserveErrorBoundary. Add a typed analytics wrapper and a feature flag system. Configure EAS Update channels preview/production and document how to ship an OTA fix. Add store assets via config plugins and the iOS privacy manifest. Set up EAS Workflows: PR checks, preview build on main, production build + submit on tag. Write docs/release-runbook.md and docs/upgrade-runbook.md.

---

## 4. Weekly rhythm

| Day | Activity |
|---|---|
| 1 | Read official docs for the phase topics; write 5 questions you can't answer yet |
| 2–4 | Build with Claude Code using the phase prompt; review every diff, don't accept blind |
| 5 | Profile / test / audit against acceptance criteria |
| 6 | Port one learning back into an old app; note anti-patterns found |
| 7 | Off, or write a short retro in `docs/retro-weekN.md` |

## 5. How to use Claude Code on this plan

- Paste the phase prompt, then `/review` the diff before accepting. Ask "why" on anything you don't understand; that is the learning.
- Keep `CLAUDE.md` current — add a rule every time you catch a repeated mistake.
- Ask Claude Code to explain trade-offs ("why TanStack Query instead of Zustand here?") before implementation.
- Use the Expo and Reanimated skills/MCPs if available so it reads current docs instead of guessing.
- Pin versions; ask it to confirm New Architecture + SDK 58 support before adding any dependency.

## 6. Done criteria for the whole program

- Flow runs on iOS and Android with 60 fps lists, <2s cold start, offline sync, widgets, notifications, OTA updates, crash reporting, and CI.
- You can explain every architectural choice in one sentence.
- At least three of your ten existing apps have adopted the design system, the data layer pattern, and the release pipeline.
