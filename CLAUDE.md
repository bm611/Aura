# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Folio** — a local-first, Tiptap-based rich-text note-taking app. Notes persist in `localStorage` with optional Supabase cloud sync and built-in AI chat (OpenRouter). Targets Web, Desktop (Tauri v2), and Mobile (Expo).

## Commands

All root-level scripts delegate to `apps/web/`:

```bash
npm run dev           # Vite dev server (web)
npm run dev:ai        # Vite + local Netlify AI proxy (run from apps/web/)
npm run build         # tsc --noEmit && vite build
npm run test          # vitest run (all tests)
npm run lint          # ESLint flat config
npm run typecheck     # tsc --noEmit only

# Run a single test file
npx vitest run apps/web/src/utils/tree.test.ts

# Tauri desktop
npm run tauri:dev     # dev mode (requires Rust toolchain)
npm run tauri:build   # build distributable

# Mobile (from apps/mobile/)
npx expo start
```

## Architecture

### Monorepo

```
apps/web/             # React 19 + Vite 7 + Tailwind v4 (primary codebase)
apps/web/src-tauri/   # Tauri v2 Rust desktop shell (minimal; 2 Rust files)
apps/web/netlify/     # Serverless AI chat proxy (web/Netlify)
apps/mobile/          # Expo 54 + React Navigation + TenTap editor (early-mid stage)
packages/shared/      # @folio/shared — platform-agnostic TS (incremental migration)
```

### Web app (`apps/web/src/`)

- **`App.tsx`** (~2,100 lines) — root component; owns all global state (notes tree, selected note, sync queue, save status, theme, accent, font). This is intentionally monolithic — avoid further growth; split only as directed.
- **`types.ts`** — core type definitions: `NoteFile`, `NoteFolder`, `TreeNode` (union), `FlatNode`
- **`components/`** — UI components (flat directory, `PascalCase.tsx`). Major ones: `AiChatPage`, `HomeScreen`, `LandingPage`, `Sidebar`, `NoteEditor`, `SettingsMenu`, `NoteBanner`, `CommandPalette`, `AuthPage`, `TemplateGallery`, `WelcomeModal`
- **`contexts/AuthContext.tsx`** — Supabase auth state; consume via `useAuth()` hook
- **`editor/core/`** — Tiptap extension configuration (`extensions.ts`) and editor commands (`editorCommands.ts`)
- **`editor/extensions/`** — custom Tiptap node/mark extensions: `AiPromptBlock`, `CalloutNode`, `CodeBlockView`, `TaskItemNode`, `TableView`, `DateCommand`, `DateMention`, `MarkdownPaste`, `SlashCommand`
- **`editor/markdown/`** — `markdownConversion.ts`: Tiptap JSON ↔ Markdown conversion (keep pure and tested)
- **`lib/notesDb.ts`** — all `localStorage` CRUD for notes (`loadTree`, `saveTree`, `upsertNote`, `softDeleteNotes`, `fetchNotes`, `restoreNotes`)
- **`lib/supabase.ts`** — Supabase client (reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`)
- **`utils/aiChat.ts`** — AI streaming via `fetch('/.netlify/functions/chat')` SSE
- **`utils/exportNote.ts`** — file export: Tauri native dialog (`isTauri()` checks `'__TAURI_INTERNALS__' in window`) or Blob download for web
- **`utils/tree.ts`** — tree node operations (`insertNode`, `deleteNode`, `moveNode`, `flattenTree`, `rebuildTreeFromFlat`, etc.)
- **`utils/editorCommands.ts`** — command palette entry definitions
- **`utils/knowledgeBase.ts`** — note search and retrieval logic
- **`utils/noteMeta.ts`** — metadata extraction, title normalization
- **`config/accents.ts`** — `ACCENT_COLORS` array used with `var(--accent)`
- **`config/fonts.ts`** — `FONT_OPTIONS` (Fraunces, DM Sans, IBM Plex Mono, Lora, Outfit, Inter, etc.)
- **`config/themes.ts`** — `THEMES` definitions
- **`config/templates.ts`** — built-in note templates
- **`config/categoryIcons.ts`** — icon mapping for categories
- **`styles/`** — 17 modular CSS files imported by `index.css` (see CSS Architecture below)

### AI chat

`utils/aiChat.ts` always uses `fetch('/.netlify/functions/chat')` (SSE stream). The Netlify function:
- Accepts `POST { question, noteContents[], mode?: 'chat' | 'inline' }`
- Streams to OpenRouter using model **`x-ai/grok-4.1-fast`**
- Reads `OPENROUTER_API_KEY` from Netlify env var

For local dev, `npm run dev:ai` starts `netlify/dev-server.js` on port 9898 which proxies to OpenRouter directly. Vite config proxies `/.netlify/functions/chat` → `localhost:9898`.

### Tauri desktop shell

Located in `apps/web/src-tauri/`. Minimal Rust footprint — only 2 source files:
- **`src/lib.rs`** — Tauri builder with 3 plugins: `tauri-plugin-window-state`, `tauri-plugin-dialog`, `tauri-plugin-fs`
- **`src/main.rs`** — entrypoint; suppresses Windows console, calls `folio_lib::run()`

Tauri is used for: (1) native file-save dialogs via `exportNote.ts`, (2) persistent window geometry. **There is no Tauri-side AI chat** — the web frontend handles all AI via Netlify functions even on desktop.

### Data flow

Notes are always written to `localStorage` first (local-first). Cloud sync to Supabase is queued in `App.tsx` and flushed asynchronously. Auth state from `AuthContext` gates cloud operations. Soft-delete pattern (`deletedAt` flag) supports data recovery.

### CSS architecture

`src/index.css` imports 17 modular CSS files from `src/styles/`:

```
theme.css          # Light/dark theme variables
colors.css         # Full design token definitions (~29 KB)
base.css           # Reset and base element styles
glass.css          # Glassmorphism utilities
neumorphic.css     # Neumorphic shadow utilities
editor.css         # Tiptap editor styling (~17 KB)
syntax.css         # Code syntax highlighting
callouts.css       # Callout block styles
slash-command.css  # Slash command menu
ai-prompt.css      # AI prompt block
date-mention.css   # Date mention chip
tags.css           # Note tag chips
sidebar.css        # Navigation sidebar (~20 KB)
settings.css       # Settings menu
auth.css           # Auth page styles
mobile.css         # Responsive mobile overrides
utilities.css      # Shared utility classes
```

All theme extension goes via CSS custom properties — never add a `tailwind.config.js`.

### Mobile app (`apps/mobile/src/`)

Expo 54 + React Navigation. More than a scaffold — has screens and components in place:
- **Screens:** `HomeScreen`, `EditorScreen`, `NoteListScreen`, `AiChatScreen`, `SettingsScreen`, `LoginScreen`, `WelcomeScreen`
- **Editor:** TenTap (`@10play/tentap-editor`) — not Tiptap
- **Components:** `TenTapEditor`, `AiMessageBubble`, `FileRow`, `SearchBar`, `TreeNodeRow`, `FormatToolbar`, `FolderRow`
- **Hooks:** `useAiChat`, `useOnlineStatus`, `useTreeManager`
- **Contexts:** `AuthContext`, `NotesContext`, `ThemeContext`
- **Navigation:** `RootNavigator`, `AppNavigator`
- **Lib:** `storage.ts`, `supabaseClient.ts`, `generateId.ts`, `markdown.ts`

### Shared package (`packages/shared/`)

`@folio/shared` — designed for cross-platform code. Currently contains migrated copies of `types.ts`, `lib/notesDb.ts`, `lib/supabase.ts`, `utils/aiChat.ts`, `utils/noteMeta.ts`, `utils/tree.ts`. Migration is incremental; don't force consumers to use it yet.

## Conventions

### Language & modules
- Progressive TS migration: new files use `.ts`/`.tsx`; existing `.jsx` files are OK
- ES modules only — no `require()`; no path aliases (use relative imports)
- `tsconfig.json`: `strict: true`, `allowJs: true`, `checkJs: false`

### Naming

| Thing | Convention |
|---|---|
| Component files | `PascalCase.tsx` |
| Utility/lib files | `camelCase.ts` |
| Constants | `SCREAMING_SNAKE_CASE` |
| Context/hooks | `useX` / `XContext` / `XProvider` |
| Test files | `*.test.ts` / `*.test.tsx` co-located |

### Styling
- Tailwind CSS v4 via `@tailwindcss/vite` — **no `tailwind.config.js`**
- Theme via CSS custom properties (`var(--accent)`, `var(--bg-deep)`, etc.) defined in `styles/colors.css`
- Animations via Framer Motion (`motion.*`, `AnimatePresence`)
- Component-specific styles go in the relevant CSS file under `src/styles/`

### State management
- Global state: `App.tsx` props drilling — **no Zustand/Redux**
- Cross-cutting concerns: React Context + custom hook pattern
- Functional components and hooks only — no class components

### Testing
- Vitest v4 + jsdom + `@testing-library/react`
- Use `describe`/`it` (not `test`), `vi.fn()`, `vi.spyOn()`
- Always `cleanup()` in `afterEach` for component tests
- Current test files: `AiChatPage.test.tsx`, `LiveMarkdownEditor.test.jsx`, `knowledgeBase.test.ts`, `tree.test.ts`, `markdownConversion.test.ts`

## Environment variables

Create `apps/web/.env`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
OPENROUTER_API_KEY=...    # for npm run dev:ai (dev-server.js)
```

For production Netlify deploys, set `OPENROUTER_API_KEY` as a Netlify environment variable.

## What to avoid

- No Zustand, Redux, or other state managers
- No `tailwind.config.js` — extend via CSS variables only
- No `require()` or CommonJS syntax
- No path aliases without updating `vite.config.js`
- No Prettier config — formatting is not enforced
- Do not add Tauri-side AI logic — AI chat runs entirely through the web/Netlify path
- Do not create a `hooks/` directory in `apps/web/src/` — hooks live inside the component or context that owns them
