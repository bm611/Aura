import { lazy, Suspense, useState } from 'react'
import { HiMoon, HiSun, HiXMark, HiBars3, HiCalendarDays, HiDocumentText, HiHashtag } from 'react-icons/hi2'
import { countBodyWords, formatCreatedAt } from '../utils/noteMeta'

const LiveMarkdownEditor = lazy(() => import('./LiveMarkdownEditor'))

function EditorFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--text-muted)]">
      Loading...
    </div>
  )
}

export default function NoteEditor({
  note,
  onUpdateNote,
  onRegisterEditorApi,
  theme,
  onToggleTheme,
  sidebarCollapsed,
  onToggleSidebar,
}) {
  const [tagInput, setTagInput] = useState('')

  const handleAddTag = (event) => {
    if (event.key !== 'Enter' || !tagInput.trim()) {
      return
    }

    event.preventDefault()
    const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')

    if (newTag && !(note.tags || []).includes(newTag)) {
      onUpdateNote(note.id, { tags: [...(note.tags || []), newTag] })
    }

    setTagInput('')
  }

  const handleRemoveTag = (tagToRemove) => {
    const newTags = (note.tags || []).filter((tag) => tag !== tagToRemove)
    onUpdateNote(note.id, { tags: newTags })
  }

  if (!note) {
    return (
      <div className="flex flex-1 min-w-0 items-center justify-center bg-[var(--bg-deep)] text-[var(--text-muted)]">
        <p className="text-sm italic">Select a note or create a new one</p>
      </div>
    )
  }

  const tags = note.tags || []
  const createdAtLabel = formatCreatedAt(note.createdAt)
  const wordCount = countBodyWords(note.content)

  return (
    <div className="relative flex flex-1 flex-col min-h-0 min-w-0 w-full bg-[var(--bg-deep)]">
      {/* Minimal top bar */}
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {sidebarCollapsed ? (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="rounded-md p-1.5 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            title="Open sidebar (Cmd+B)"
          >
            <HiBars3 size={18} />
          </button>
        ) : (
          <div />
        )}
        <button
          type="button"
          onClick={onToggleTheme}
          className="rounded-md p-1.5 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <HiSun size={16} /> : <HiMoon size={16} />}
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto max-w-3xl px-4 pb-32 sm:px-6 md:px-10">
          {/* Title */}
          <input
            type="text"
            value={note.title}
            onChange={(event) => onUpdateNote(note.id, { title: event.target.value })}
            className="w-full bg-transparent text-3xl font-black tracking-tight text-[var(--title-color)] outline-none placeholder:text-[var(--text-muted)] sm:text-4xl md:text-5xl"
            style={{ fontFamily: "'Fraunces', serif" }}
            placeholder="Untitled"
          />

          {/* Modern Metadata Section */}
          <div
            className="mt-6 flex flex-col gap-3 border-b border-[var(--border-default)] pb-6 text-[13px] text-[var(--text-muted)] transition-all"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {/* Created */}
            <div className="flex items-start gap-4">
              <div className="flex w-24 shrink-0 items-center gap-2 text-[var(--text-tertiary)]">
                <HiCalendarDays className="h-4 w-4" />
                <span>Created</span>
              </div>
              <div className="text-[var(--text-secondary)]">{createdAtLabel}</div>
            </div>

            {/* Word Count */}
            <div className="flex items-start gap-4">
              <div className="flex w-24 shrink-0 items-center gap-2 text-[var(--text-tertiary)]">
                <HiDocumentText className="h-4 w-4" />
                <span>Words</span>
              </div>
              <div className="text-[var(--text-secondary)]">
                {new Intl.NumberFormat().format(wordCount)} word{wordCount !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-start gap-4">
              <div className="flex w-24 shrink-0 items-center gap-2 pt-1 text-[var(--text-tertiary)]">
                <HiHashtag className="h-4 w-4" />
                <span>Tags</span>
              </div>
              <div className="flex flex-1 flex-wrap items-center gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="group/tag relative inline-flex items-center gap-1 overflow-hidden rounded bg-[var(--bg-surface-hover)] px-2 py-0.5 text-[var(--text-secondary)] transition-all hover:pr-5 hover:bg-[var(--bg-hover)]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="absolute right-0.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 opacity-0 transition-opacity hover:text-red-400 group-hover/tag:opacity-100"
                      aria-label={`Remove ${tag}`}
                    >
                      <HiXMark size={12} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={tags.length === 0 ? 'Add a tag...' : 'Add tag...'}
                  className="min-w-[5rem] flex-1 bg-transparent py-0.5 text-[var(--text-muted)] outline-none placeholder:text-[var(--text-tertiary)] focus:text-[var(--text-primary)] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="mt-8">
            <Suspense fallback={<EditorFallback />}>
              <LiveMarkdownEditor
                value={note.content}
                onChange={(content) => onUpdateNote(note.id, { content })}
                onRegisterEditorApi={onRegisterEditorApi}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
