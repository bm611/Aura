export const STARTER_NOTE_TAG = 'starter'

export const STARTER_NOTE = `# Start here

This page is yours. Turn it into a scratchpad, a morning note, or the start of something bigger.

> [!tip] - Make it useful fast
> Rewrite this heading, keep the prompts you like, and delete the rest. The goal is to help you start, not teach the app.

## Three quick prompts

- What needs your attention today?
- What idea would be annoying to lose?
- What is the next concrete step on your mind right now?

## Helpful moves

- Type \`/\` on a new line to open slash commands
- Use \`/todo\` for checkboxes and quick lists
- Press \`Cmd + K\` (or \`Ctrl + K\`) to jump around fast

When you have your own notes going, rename this page or delete it without ceremony.
`

export const STARTER_TODO_NOTE = `# To-Do

A simple place for the loose tasks you want close by.

---

- [ ] Try slash commands — type \`/todo\` for quick checkboxes
- [ ] Organize notes into folders
- [ ] Explore the command palette (\`Cmd + K\`)

---

> [!tip] - Keep it or delete it
> This note starts pinned so you always have one useful place to land. Unpin it or remove it any time.
`

const UNTOUCHED_STARTER_NOTES = [
  { title: 'Start Here', content: STARTER_NOTE.trim() },
  { title: 'To-Do', content: STARTER_TODO_NOTE.trim() },
]

const LEGACY_STARTER_TITLES = new Set(['Folio Knowledge Base', 'Welcome to Folio'])

export function isStarterNote(note: { title?: string; content?: string; tags?: string[] }): boolean {
  const tags = Array.isArray(note.tags) ? note.tags : []
  const title = note.title?.trim() ?? ''
  const content = note.content?.trim() ?? ''

  if (tags.includes(STARTER_NOTE_TAG)) {
    return UNTOUCHED_STARTER_NOTES.some((starter) => starter.title === title && starter.content === content)
  }

  return LEGACY_STARTER_TITLES.has(title)
}
