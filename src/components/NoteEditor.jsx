import { lazy, Suspense, useEffect, useState } from 'react'
import { HiMoon, HiSun, HiXMark, HiBars3, HiCalendarDays, HiDocumentText, HiHashtag, HiChevronDown, HiPlus } from 'react-icons/hi2'
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
  const [metaCollapsed, setMetaCollapsed] = useState(() => window.innerWidth < 768)

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
      <div className="flex flex-1 min-w-0 items-center justify-center bg-[var(--bg-deep)]">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-surface)]">
            <HiDocumentText size={28} className="text-[var(--text-muted)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]" style={{ fontFamily: "'Inter', sans-serif" }}>No note selected</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]" style={{ fontFamily: "'Inter', sans-serif" }}>Choose a note from the sidebar or create a new one</p>
          </div>
        </div>
      </div>
    )
  }

  const tags = note.tags || []
  const createdAtLabel = formatCreatedAt(note.createdAt)
  const wordCount = countBodyWords(note.content)

  return (
    <div className="relative flex flex-1 flex-col min-h-0 min-w-0 w-full bg-[var(--bg-deep)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 md:px-6">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          title={sidebarCollapsed ? 'Open sidebar (Cmd+B)' : 'Close sidebar (Cmd+B)'}
        >
          <HiBars3 size={20} />
        </button>
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <HiSun size={18} /> : <HiMoon size={18} />}
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

          {/* Metadata Section — collapsible */}
          <div
            className="mt-4 border-b border-[var(--border-default)] pb-4 text-[13px] text-[var(--text-muted)]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <button
              type="button"
              onClick={() => setMetaCollapsed((c) => !c)}
              className="flex w-full items-center gap-2 py-1 text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
            >
              <HiChevronDown
                size={14}
                className={`shrink-0 transition-transform duration-200 ${metaCollapsed ? '-rotate-90' : ''}`}
              />
              <span className="text-[11px] uppercase tracking-widest">Details</span>
              {metaCollapsed && (
                <span className="ml-auto text-[11px] text-[var(--text-muted)] font-normal normal-case tracking-normal">
                  {createdAtLabel} · {new Intl.NumberFormat().format(wordCount)} words{tags.length > 0 ? ` · ${tags.length} tag${tags.length !== 1 ? 's' : ''}` : ''}
                </span>
              )}
            </button>

            {!metaCollapsed && (
              <div className="mt-2 flex flex-col gap-2.5">
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
                        className="group/tag relative inline-flex items-center gap-1 rounded bg-[var(--bg-surface-hover)] px-2 py-1 text-[var(--text-secondary)] transition-all max-md:pr-6 md:hover:pr-6 hover:bg-[var(--bg-hover)]"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-opacity hover:text-red-400 max-md:opacity-60 md:opacity-0 md:group-hover/tag:opacity-100"
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
                      className="min-w-[5rem] flex-1 bg-transparent py-1 text-[var(--text-muted)] outline-none placeholder:text-[var(--text-muted)] focus:text-[var(--text-primary)] transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}
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
