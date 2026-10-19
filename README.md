# Flow

Personal expense and budget tracker for iOS and Android. Track spending by category, stay on pace for the month, and keep working offline — changes sync when you’re back online.

Built with **Expo SDK 58** as a learning/demo app for modern React Native (New Architecture, React Compiler, Expo Router, local-first data).

## Features

- **Home** — month summary, “safe to spend” per day, category budgets with pace, recent expenses
- **Expenses** — full transaction list grouped by day, filters, add/edit/delete
- **Insights** — spend by category (donut) and daily spend bars
- **Settings** — appearance (system/light/dark), currency, sync status, sign out
- **Auth** — email + magic link (mock API in development)
- **Offline-first** — SQLite source of truth, outbox queue, sync on reconnect

## Stack

| Layer | Choice |
| --- | --- |
| Runtime | Expo SDK 58 · React Native 0.88 · React 19.3 · TypeScript strict |
| Navigation | Expo Router (typed routes, native tabs, API routes) |
| Server state | TanStack Query v5 |
| UI state | Zustand |
| Local data | Drizzle + expo-sqlite · expo-sqlite/kv-store · expo-secure-store |
| UI | Unistyles 3 · Reanimated 4 · FlashList · @expo/ui · expo-image |
| Builds | EAS (`development` / `preview` / `production`) |

## Requirements

- Node.js 22.13+ or 24.3+ (even releases)
- A [development build](https://docs.expo.dev/develop/development-builds/introduction/) — Expo Go is not enough for this app’s native modules

## Getting started

```bash
npm install
cp .env.example .env   # optional; leave EXPO_PUBLIC_API_URL empty in dev
```

### Development client

```bash
# iOS simulator
npx expo run:ios

# Android emulator
npx expo run:android

# Or start Metro after a client is installed
npm start
```

Native projects are generated via Continuous Native Generation (`npx expo prebuild`). Prefer configuring `app.config.ts` and plugins over editing `ios/` / `android/` by hand.

### Environment

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | API origin for `/api/*`. Empty in dev uses the Metro server. |

Mock API routes live under `src/app/api/` (Expo Router `+api.ts`).

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start Expo / Metro |
| `npm run ios` / `npm run android` | Run native development builds |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run lint` | ESLint via `expo lint` |
| `npm run format` | Prettier |
| `npm test` | Jest + React Native Testing Library |
| `npm run db:generate` | Generate Drizzle migrations after schema changes |
| `npm run doctor` | `expo-doctor` dependency/config check |

Before committing: `npm run typecheck && npm run lint && npm test`.

## Project layout

```
src/
├── app/                 # Expo Router screens (thin) + mock API routes
│   ├── (auth)/          # Sign-in
│   ├── (tabs)/          # Home, Expenses, Insights, Settings
│   ├── add.tsx          # Quick-add expense
│   ├── category/[id]    # Category budget detail
│   ├── transaction/[id] # Transaction detail / edit
│   └── api/             # Mock server (+api.ts)
├── features/            # auth, budgets, transactions, insights, settings
│   └── <name>/{components,hooks,api,store,__tests__}
├── design-system/       # Theme tokens, Text, Button, Card, states, toast…
├── lib/                 # DB (Drizzle), formatters, API helpers
└── hooks/               # Cross-feature hooks
```

Agent-oriented project rules: [`CLAUDE.md`](./CLAUDE.md) · [`AGENTS.md`](./AGENTS.md). Longer learning plan: [`doc/expo-advanced-plan.md`](./doc/expo-advanced-plan.md).

## Data model

Local SQLite tables (see `src/lib/db/schema.ts`):

- **categories** — name, icon, color
- **budgets** — per category per month (`limitCents`)
- **transactions** — amount, category, note, timestamps, sync status
- **outbox** — pending upsert/delete ops flushed by the sync engine

First launch seeds default categories (Food, Transport, Shopping, Bills, Fun, Other) and the current month’s budgets.

## Architecture notes

- Routes compose feature screens; business logic stays in `src/features/`
- Optimistic mutations with rollback + toast on failure
- Connectivity via `expo-network`; sync runs on reconnect and from Settings
- Styles use Unistyles theme tokens (spacing scale, light/dark)

## EAS

Profiles in `eas.json`:

- **development** — internal distribution, development client
- **preview** — internal APK / preview builds
- **production** — store builds with remote version auto-increment

```bash
npx eas-cli@latest build --profile development --platform ios
```

## License

See [LICENSE](./LICENSE).
