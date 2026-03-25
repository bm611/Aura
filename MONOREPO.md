# Folio Monorepo Architecture

## Overview

Folio is a local-first, Tiptap-based note-taking app structured as an **npm workspaces monorepo** targeting three platforms:

| Platform    | Location              | Tech                                            |
| ----------- | --------------------- | ----------------------------------------------- |
| **Web**     | `apps/web/`           | React 19 + Vite 7 + Tailwind v4                 |
| **Desktop** | `apps/web/src-tauri/` | Tauri v2 (wraps the same React frontend)        |
| **Mobile**  | `apps/mobile/`        | React Native (Expo 53)                          |
| **Shared**  | `packages/shared/`    | Platform-agnostic TS (types, utils, data layer) |

---

## Directory Structure

```
folio/
├── apps/
│   ├── web/                          # React + Vite web app (+ Tauri desktop shell)
│   │   ├── src/                      # React components, editor, hooks, utils
│   │   ├── public/                   # Static assets, fonts
│   │   ├── src-tauri/                # Tauri v2 desktop shell
│   │   │   ├── src/main.rs           # Tauri entry point
│   │   │   ├── src/lib.rs            # Tauri command registration
│   │   │   ├── src/chat.rs           # AI chat proxy (OpenRouter streaming)
│   │   │   ├── icons/                # Generated app icons (.icns, .ico, PNGs)
│   │   │   ├── Cargo.toml
│   │   │   ├── build.rs
│   │   │   └── tauri.conf.json       # Window config, build paths, bundle settings
│   │   ├── netlify/                  # Serverless functions (AI chat proxy)
│   │   │   ├── functions/chat.ts     # OpenRouter streaming proxy
│   │   │   └── dev-server.js         # Local dev proxy
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   ├── vitest.config.js
│   │   ├── eslint.config.js
│   │   ├── tsconfig.json             # Extends ../../tsconfig.base.json
│   │   └── package.json              # name: "note"
│   │
│   └── mobile/                       # React Native (Expo) mobile app
│       ├── src/
│       │   ├── screens/              # (empty — ready for implementation)
│       │   ├── components/
│       │   └── hooks/
│       ├── assets/                   # App icons, splash screen
│       ├── App.tsx                   # Placeholder entry component
│       ├── index.js                  # Expo registerRootComponent
│       ├── app.json                  # Expo config (com.folio.mobile)
│       ├── tsconfig.json             # Extends ../../tsconfig.base.json
│       └── package.json              # name: "@folio/mobile"
│
├── packages/
│   └── shared/                       # @folio/shared — platform-agnostic code
│       ├── src/
│       │   └── index.ts              # Barrel export (empty — migrate incrementally)
│       ├── tsconfig.json             # composite: true
│       └── package.json              # name: "@folio/shared"
│
├── package.json                      # Root workspaces config
├── tsconfig.base.json                # Shared TS compiler options
├── netlify.toml                      # Deploys from apps/web/
├── .gitignore                        # Includes Tauri target/ and Expo ios/android/
├── AGENTS.md
├── MONOREPO.md
└── README.md
```

---

## Workspaces

Root `package.json` defines npm workspaces:

```json
{
	"workspaces": ["apps/*", "packages/*"]
}
```

Apps import shared code as:

```ts
import { fetchNotes } from '@folio/shared/supabase/notesDb';
import { buildTree } from '@folio/shared/utils/tree';
import type { TreeNode } from '@folio/shared/types';
```

---

## Commands

### Web (from repo root)

```bash
npm run dev                              # Vite dev server (web)
npm run build                            # Production build (apps/web/dist/)
npm run test                             # Vitest (all 20 tests)
npm run lint                             # ESLint
```

### Tauri Desktop (from repo root or apps/web)

```bash
npm run tauri:dev                        # Run desktop app in dev mode (from root)
npm run tauri:build                      # Build distributable (from root)

# Or from apps/web/
npm run tauri:dev
npm run tauri:build
```

**Prerequisites:** Rust toolchain (`rustup`) and system deps per [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/).

### React Native Mobile

```bash
cd apps/mobile
npx expo start                           # Expo dev server
npx expo run:ios                         # Run on iOS simulator
npx expo run:android                     # Run on Android emulator
```

**Prerequisites:** Xcode (iOS) or Android Studio (Android).

---

## Deployment

### Netlify (Web)

`netlify.toml` at repo root:

```toml
[build]
  command = "npm install && npm run build --workspace=apps/web"
  publish = "apps/web/dist"
  functions = "apps/web/netlify/functions"
```

The Netlify function `apps/web/netlify/functions/chat.ts` proxies AI requests to OpenRouter. It requires the `OPENROUTER_API_KEY` env var in Netlify settings.

### Tauri (Desktop)

`npm run tauri:build` produces platform-specific installers:

- **macOS:** `.dmg` / `.app`
- **Windows:** `.msi` / `.exe`
- **Linux:** `.AppImage` / `.deb`

### Expo (Mobile)

Use `eas build` for production builds or `npx expo run:ios/android` for local dev builds.

---

## Tauri Configuration

`apps/web/src-tauri/tauri.conf.json` key settings:

| Setting                             | Value                   | Purpose                     |
| ----------------------------------- | ----------------------- | --------------------------- |
| `build.frontendDist`                | `../dist`               | Points to Vite build output |
| `build.devUrl`                      | `http://localhost:5173` | Vite dev server URL         |
| `app.windows[0]`                    | 1200x800, min 800x600   | Default window dimensions   |
| `identifier`                        | `com.folio.app`         | App bundle ID               |
| `bundle.macOS.minimumSystemVersion` | `10.15`                 | Minimum macOS version       |

### Vite configuration for Tauri

`vite.config.js` includes Tauri-specific settings:

- `clearScreen: false` — Prevents Vite from clearing Tauri's output
- `server.host` — Reads `TAURI_DEV_HOST` env var so the webview can reach the dev server
- `server.port: 5173` with `strictPort: true` — Matches `devUrl` in `tauri.conf.json`

### Rust backend

The Rust backend lives in `apps/web/src-tauri/src/` and currently provides two Tauri commands:

| Command       | File      | Purpose                                                       |
| ------------- | --------- | ------------------------------------------------------------- |
| `greet`       | `lib.rs`  | Placeholder test command                                      |
| `chat_stream` | `chat.rs` | AI chat proxy — streams OpenRouter responses via Tauri events |

**Cargo dependencies** (`Cargo.toml`):

| Crate                              | Purpose                                      |
| ---------------------------------- | -------------------------------------------- |
| `tauri` v2                         | Core framework                               |
| `tauri-plugin-opener` v2           | Open URLs/files natively                     |
| `tauri-plugin-window-state`        | Persist window size/position across sessions |
| `tauri-plugin-dialog`              | Native OS save/open file dialogs             |
| `tauri-plugin-fs`                  | Read/write files on the local filesystem     |
| `tauri-plugin-global-shortcut`     | System-wide keyboard shortcuts               |
| `tauri-plugin-store`               | Persistent key-value store (settings, keys)  |
| `tauri-plugin-updater`             | In-app auto-updates from GitHub Releases     |
| `tauri-plugin-process`             | Relaunch app after update install            |
| `serde` + `serde_json`            | JSON serialization                           |
| `reqwest` v0.12 (json, stream)     | HTTP client for OpenRouter API               |
| `tokio` v1 (full)                  | Async runtime                                |
| `futures-util` v0.3               | Stream combinators for SSE parsing           |

### AI chat proxy (desktop)

The `chat_stream` command in `src/chat.rs` replaces the Netlify function for desktop builds:

1. Reads `OPENROUTER_API_KEY` from the Tauri store (`settings.json`) first, then falls back to the environment variable
2. Builds the same system prompt as the Netlify function (with optional note context)
3. POSTs to `https://openrouter.ai/api/v1/chat/completions` with `stream: true`
4. Parses the SSE response and emits `chat-stream` events to the frontend with payloads:
   - `{ kind: "token", token: "..." }` — streamed content
   - `{ kind: "done" }` — stream complete
   - `{ kind: "error", error: "..." }` — error occurred

The frontend (`src/utils/aiChat.ts`) auto-detects the runtime:

- **Tauri** (detected via `window.__TAURI_INTERNALS__`): Uses `invoke('chat_stream')` + `listen('chat-stream')`
- **Web**: Uses the existing `fetch`-based SSE path to `/.netlify/functions/chat`

### Desktop-native features

| Feature                    | Plugin                           | Frontend hook / file                       | Behaviour                                                                 |
| -------------------------- | -------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------- |
| Window state persistence   | `tauri-plugin-window-state`      | —  (automatic)                             | Remembers window size, position & maximized state across sessions         |
| Native file export         | `tauri-plugin-dialog` + `fs`     | `src/utils/exportNote.ts`                  | OS save dialog → writes `.md` to disk (falls back to Blob download on web) |
| Global quick-capture       | `tauri-plugin-global-shortcut`   | `src/hooks/useTauriGlobalShortcut.ts`      | `Cmd/Ctrl+Shift+N` — creates a new note from anywhere, even when minimized |
| Secure API key store       | `tauri-plugin-store`             | `src-tauri/src/chat.rs`                    | Reads `openrouter_api_key` from `settings.json` store, falls back to env var |
| Auto-updater               | `tauri-plugin-updater`           | `src/hooks/useTauriUpdater.ts`             | Checks GitHub Releases for updates on launch, downloads & relaunches      |

---

## Code Sharing Strategy

### What belongs in `packages/shared/`

These files in `apps/web/src/` are **already platform-agnostic** and should be migrated incrementally:

| File                            | Why it's portable                                      |
| ------------------------------- | ------------------------------------------------------ |
| `types.ts`                      | Pure type definitions                                  |
| `utils/tree.ts`                 | Pure functions, no DOM deps                            |
| `utils/knowledgeBase.ts`        | Pure search logic                                      |
| `utils/noteMeta.ts`             | Pure string helpers                                    |
| `utils/markdownText.ts`         | Pure string helpers                                    |
| `lib/supabase.ts`               | `@supabase/supabase-js` works on RN                    |
| `lib/notesDb.ts`                | Supabase CRUD, uses `fetch` internally                 |
| `utils/aiChat.ts`               | Platform-aware streaming (Tauri invoke / web fetch)    |
| `contexts/AuthContext.tsx`      | Auth _logic_ is portable (split from React context)    |
| Sync queue logic (in `App.tsx`) | localStorage queue logic -> extract as `syncEngine.ts` |

### What stays platform-specific

| Layer         | Web/Desktop                  | Mobile                              |
| ------------- | ---------------------------- | ----------------------------------- |
| Editor        | Tiptap (DOM-based)           | RN rich-text (e.g. `tentap-editor`) |
| UI components | Tailwind + Framer Motion     | RN components + Reanimated          |
| Local storage | `localStorage`               | `react-native-mmkv`                 |
| Navigation    | State-based                  | React Navigation                    |
| File export   | Blob download / Tauri dialog | Share sheet                         |
| Haptics       | `navigator.vibrate`          | `expo-haptics`                      |

---

## Key Decisions

1. **Tauri over Electron** — No Node.js APIs needed in renderer. ~5 MB bundle vs ~200 MB. Rust backend is ideal for securely proxying the OpenRouter API key.
2. **React Native over Flutter** — Shares ~60% of code (types, utils, Supabase layer, AI chat) via `@folio/shared`. Flutter would require rewriting the entire data layer in Dart.
3. **Expo managed workflow** — Simplifies builds and OTA updates. Can eject to bare if needed.
4. **Incremental migration** — `packages/shared/` starts empty. Move modules one at a time, updating imports in `apps/web/` and adding them to `apps/mobile/` as the mobile app is built out.

---

## Environment Variables

| Variable                       | Where                                         | Purpose                           |
| ------------------------------ | --------------------------------------------- | --------------------------------- |
| `VITE_SUPABASE_URL`            | `apps/web/.env`                               | Supabase project URL              |
| `VITE_SUPABASE_ANON_KEY`       | `apps/web/.env`                               | Supabase anonymous key            |
| `OPENROUTER_API_KEY`           | Netlify env / shell env / Tauri store          | AI chat proxy API key             |
| `TAURI_SIGNING_PRIVATE_KEY`    | CI env (GitHub Actions)                        | Signs update bundles for updater  |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | CI env (GitHub Actions)                  | Password for the signing key      |

Never commit `.env` files. See `.env.example` for required variables.

For Tauri desktop, the API key can be set via the Tauri store (`settings.json → openrouter_api_key`) or exported as an env var:

```bash
export OPENROUTER_API_KEY="sk-or-..."
npm run tauri:dev
```

---

## Implementation Status

### Completed

- [x] Monorepo structure with npm workspaces
- [x] Web app (React 19 + Vite 7 + Tailwind v4 + Tiptap)
- [x] Supabase cloud sync with auth
- [x] AI chat via Netlify function (OpenRouter, SSE streaming)
- [x] Tauri v2 desktop shell — compiles and launches
- [x] Tauri npm packages (`@tauri-apps/cli`, `@tauri-apps/api`)
- [x] Vite config adapted for Tauri (`server.host`, `clearScreen`, `strictPort`)
- [x] App icons generated from `folio-favicon.svg` (`.icns`, `.ico`, PNGs)
- [x] AI chat proxy implemented as Rust Tauri command (`chat_stream`)
- [x] Frontend auto-detects Tauri vs web and routes AI requests accordingly
- [x] `tauri:dev` / `tauri:build` scripts at both workspace and root level
- [x] Window state persistence (`tauri-plugin-window-state`)
- [x] Native file export with OS save dialog (`tauri-plugin-dialog` + `tauri-plugin-fs`)
- [x] Global shortcut `Cmd/Ctrl+Shift+N` for quick note capture (`tauri-plugin-global-shortcut`)
- [x] Secure API key store — chat proxy reads from Tauri store, falls back to env var (`tauri-plugin-store`)
- [x] Auto-updater plugin wired up with `useTauriUpdater` hook (`tauri-plugin-updater`)
- [x] PWA support for web (`vite-plugin-pwa` with manifest, service worker, offline caching)
- [x] Mobile app scaffold (Expo, placeholder)
- [x] Shared package scaffold (`@folio/shared`, empty)

### TODO — Auto-updater & GitHub Releases

The updater plugin and CI workflow (`.github/workflows/release-desktop.yml`) are set up. Follow these steps to activate:

#### One-time setup

1. **Generate a signing keypair** (run once, keep the private key safe):
   ```bash
   npx tauri signer generate -w ~/.tauri/folio.key
   ```
   This outputs a **public key** to the terminal — copy it.

2. **Set the public key** in `apps/web/src-tauri/tauri.conf.json`:
   ```json
   "updater": {
     "endpoints": ["https://github.com/bm611/folio/releases/latest/download/latest.json"],
     "pubkey": "PASTE_YOUR_PUBLIC_KEY_HERE"
   }
   ```

3. **Add CI secrets** — go to GitHub → repo Settings → Secrets and variables → Actions → New repository secret:
   - `TAURI_SIGNING_PRIVATE_KEY` — paste the full contents of `~/.tauri/folio.key`
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — the password you chose when generating

#### Releasing a new version

Every time you want to ship a desktop update:

1. **Bump the version** in `apps/web/src-tauri/tauri.conf.json`:
   ```json
   "version": "0.2.0"
   ```

2. **Commit and push** the version bump:
   ```bash
   git add apps/web/src-tauri/tauri.conf.json
   git commit -m "release: v0.2.0"
   git push
   ```

3. **Create and push a git tag** matching the version:
   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```

4. **GitHub Actions runs automatically** — the workflow builds for macOS (ARM + Intel), Linux, and Windows, then creates a **draft Release** with all installers attached.

5. **Publish the release** — go to GitHub → Releases → find the draft → review the assets → click **Publish release**.

That's it. Existing Folio desktop users will see an update notification on next launch (via the `useTauriUpdater` hook).

#### Wire update UI (remaining)

- Hook `useTauriUpdater` into the UI — render an update banner or toast when `available` is `true`, with a button that calls `installUpdate()`
