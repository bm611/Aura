# AGENTS.md — Aura Note-taking App

Aura is a local-first, Tiptap-based rich-text/markdown note-taking application built with
React 19 + Vite. Notes are stored in `localStorage` with optional Supabase cloud sync.

---

## Project Structure

```
src/
  App.jsx               # Root component; most global state lives here
  main.jsx
  index.css
  components/           # React UI components (PascalCase.jsx)
  contexts/             # React context providers (AuthContext.jsx)
  editor/
    core/               # Tiptap editor setup and commands
    extensions/         # Custom Tiptap extension nodes
    markdown/           # Markdown conversion utilities + tests
  lib/                  # External service clients (supabase.js, notesDb.js)
  utils/                # Pure utility functions + co-located tests
  config/               # Static config (accent colors, etc.)
public/
```

---

## Build, Dev & Preview Commands

```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # Production build (output: dist/)
npm run preview    # Preview the production build locally
```

---

## Lint

```bash
npm run lint       # ESLint over all *.js and *.jsx files
```

ESLint uses the **flat config** format (`eslint.config.js`, ESLint v9+).
- Extends `@eslint/js` recommended + `eslint-plugin-react-hooks` + `react-refresh`
- `no-unused-vars` is configured to ignore names matching `/^[A-Z_]/` (constants/components)
- No Prettier or Biome — formatting is not enforced by tooling

---

## Testing

Framework: **Vitest v4** with **jsdom** environment + **@testing-library/react**.

```bash
npm test                                              # Run all tests once
npx vitest run                                        # Same as above
npx vitest run src/utils/tree.test.js                 # Run a single test file
npx vitest run src/editor/markdown/markdownConversion.test.js
npx vitest                                            # Watch mode (interactive)
```

Test files are co-located with source files using the `*.test.js` / `*.test.jsx` suffix.

Existing test files:
- `src/utils/tree.test.js`
- `src/utils/markdownText.test.js`
- `src/utils/knowledgeBase.test.js`
- `src/editor/markdown/markdownConversion.test.js`
- `src/components/LiveMarkdownEditor.test.jsx`

---

## Language & Modules

- **TypeScript** — the project is being progressively migrated from JS to TS.
- New files should be `.ts` / `.tsx`. Remaining `.jsx` files are allowed during migration.
- ES modules throughout (`"type": "module"` in package.json).
- Use `import`/`export`; never `require()`.
- No path aliases — use relative imports (`../utils/tree`, not `@/utils/tree`).
- `tsconfig.json` has `strict: true`, `allowJs: true`, and `checkJs: false`.

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Component files | `PascalCase.jsx` | `NoteEditor.jsx` |
| Utility/lib files | `camelCase.js` | `notesDb.js`, `tree.js` |
| React components | `PascalCase` | `AuthModal`, `LiveMarkdownEditor` |
| Functions | `camelCase` | `handleDeleteNote`, `syncNoteToCloud` |
| Constants | `SCREAMING_SNAKE_CASE` | `STORAGE_KEY`, `CALLOUT_ICONS` |
| Context/hooks | `useX` / `XContext` / `XProvider` | `useAuth`, `AuthContext` |
| Test files | Same name + `.test.js/.jsx` | `tree.test.js` |

---

## Imports

Group imports in this order, separated by blank lines:
1. React and React hooks
2. Third-party libraries (Tiptap, Framer Motion, Supabase, icons, etc.)
3. Local modules (relative imports)

```js
import { useState, useEffect, useCallback } from 'react'

import { useEditor, EditorContent } from '@tiptap/react'
import { motion, AnimatePresence } from 'framer-motion'

import { buildTree } from '../utils/tree'
import { getNotes, saveNote } from '../lib/notesDb'
```

---

## Export Style

- **React components**: use `export default function ComponentName() {}`
- **Utilities and helpers**: use named exports; avoid default exports on non-components
  ```js
  export function buildTree(notes) { ... }
  export function findNote(notes, id) { ... }
  ```

---

## React Patterns

- **Functional components only** — no class components.
- **Hooks-based** state: `useState`, `useEffect`, `useCallback`, `useRef`, `useMemo`.
- Use `useCallback` when passing handlers as props to avoid unnecessary re-renders.
- Global/shared state lives in `App.jsx` via props drilling; no external state manager.
- Use React Context (`createContext` + custom hook) for cross-cutting concerns:
  ```js
  export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
  }
  ```
- **Tailwind CSS v4** utility classes inline in JSX for all styling.
- CSS custom properties (`var(--accent)`, `var(--bg-deep)`) for theme-sensitive values.

---

## Styling

- Tailwind CSS v4 is configured via `@tailwindcss/vite` — no `tailwind.config.js`.
- Do not add a `tailwind.config.js`; extend theme via CSS variables instead.
- Theming uses CSS custom properties defined in `index.css`.
- Accent colors are managed through `src/config/accents.js` and `var(--accent)`.
- Animation: use **Framer Motion** (`motion.*`, `AnimatePresence`) — already a dependency.

---

## Error Handling

- Async Supabase calls: `try/catch` and re-`throw` for callers to handle.
  ```js
  async function saveToCloud(note) {
    try {
      const { error } = await supabase.from('notes').upsert(note)
      if (error) throw error
    } catch (err) {
      throw err
    }
  }
  ```
- `localStorage` reads: silent `try/catch` with safe fallback.
  ```js
  function loadNotes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
    } catch {
      return []
    }
  }
  ```
- Fire-and-forget async: `.catch(console.error)` is acceptable.
- User-visible errors: store as a string in component state and render in UI.

---

## Testing Style

```js
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react'

afterEach(cleanup)

describe('buildTree', () => {
  it('returns empty array for no notes', () => {
    expect(buildTree([])).toEqual([])
  })
})
```

- Use `describe` / `it` (not `test`) for grouping.
- Use `vi.fn()` for mocks, `vi.spyOn()` for spying.
- Use `beforeAll` for one-time DOM shims (e.g., `window.matchMedia`).
- Always call `cleanup()` in `afterEach` for component tests.

---

## Editor (Tiptap)

- Custom Tiptap extensions live in `src/editor/extensions/`.
- Editor configuration and shared extensions are in `src/editor/core/extensions.js`.
- Editor commands/helpers are in `src/editor/core/editorCommands.js`.
- Markdown conversion logic (Tiptap JSON ↔ markdown string) is in
  `src/editor/markdown/markdownConversion.js` — keep it pure and well-tested.

---

## Data Layer

- `src/lib/notesDb.js` — all `localStorage` CRUD for notes.
- `src/lib/supabase.js` — Supabase client initialisation (reads from `.env`).
- Environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.
- Do not commit `.env`. Use `.env.example` for documenting required variables.

---

## What to Avoid

- Do not introduce Zustand, Redux, or other state managers.
- Do not add a Prettier config — formatting is not enforced.
- Do not create `tailwind.config.js` — use CSS variables for customisation.
- Do not use `require()` or CommonJS syntax.
- Do not add path aliases without updating `vite.config.js`.
- Do not use class components or lifecycle methods.
