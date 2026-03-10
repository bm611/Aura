import {
  HiMagnifyingGlass,
  HiMiniPlus,
  HiXMark,
} from 'react-icons/hi2'
import { getNoteDisplayTitle } from '../utils/noteMeta'

function getRelativeTime(date) {
  const now = Date.now()
  const diff = now - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d`

  const months = Math.floor(days / 30)
  return `${months}mo`
}

export default function Sidebar({
  notes,
  activeNoteId,
  onSelectNote,
  onNewNote,
  onDeleteNote,
  collapsed,
  onToggleCollapse,
  searchQuery,
  onSearchChange,
}) {
  return (
    <>
      {/* Backdrop — mobile only, visible when sidebar is open */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={onToggleCollapse}
        />
      )}

      <aside
        className={`
          ${collapsed ? 'w-0' : 'w-72'}
          fixed inset-y-0 left-0 z-40
          md:relative md:z-auto
          h-screen shrink-0 overflow-hidden
          border-r border-[var(--border-subtle)]
          bg-[var(--bg-primary)]
          transition-all duration-300 ease-[var(--ease-out-quart)]
        `}
      >
        <div className="flex h-full w-72 flex-col">
          {/* Header */}
          <div className="px-4 pb-3 pt-5">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="text-sm font-semibold tracking-tight text-[var(--text-primary)] transition-colors hover:text-[var(--text-secondary)]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Canvas
              </button>
              <button
                type="button"
                onClick={onNewNote}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                title="New note (Cmd+N)"
              >
                <HiMiniPlus size={16} />
              </button>
            </div>

            <div className="mt-3">
              <label className="flex h-8 items-center gap-2 rounded-lg bg-[var(--bg-surface)] px-2.5">
                <HiMagnifyingGlass size={14} className="shrink-0 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Search..."
                  className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              </label>
            </div>
          </div>

          {/* Note list */}
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {searchQuery.trim() && (
              <div className="mb-1 px-2">
                <span
                  className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {notes.length} result{notes.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            <div className="space-y-px">
              {notes.length === 0 ? (
                <div className="px-2 py-8 text-center">
                  <p className="text-xs text-[var(--text-muted)]">
                    {searchQuery.trim() ? 'No results.' : 'No notes yet.'}
                  </p>
                </div>
              ) : (
                notes.map((entry) => {
                  const note = entry.note || entry
                  const isActive = note.id === activeNoteId
                  const title = getNoteDisplayTitle(note)
                  const time = getRelativeTime(note.updatedAt || note.createdAt)

                  return (
                    <div
                      key={note.id}
                      className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                        isActive
                          ? 'bg-[var(--bg-surface)] text-[var(--text-primary)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelectNote(note.id)
                          // Auto-close sidebar on mobile after selecting
                          if (window.innerWidth < 768) onToggleCollapse()
                        }}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span
                            className="truncate text-[13px] font-medium"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            {title}
                          </span>
                          <span className="shrink-0 text-[10px] tabular-nums text-[var(--text-muted)]">
                            {time}
                          </span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onDeleteNote(note.id)
                        }}
                        className="hidden shrink-0 rounded p-0.5 text-[var(--text-muted)] transition-colors hover:text-[var(--danger)] group-hover:block"
                      >
                        <HiXMark size={12} />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
