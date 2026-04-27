import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Search01Icon } from '@hugeicons/core-free-icons'
import Icon from './Icon'

export interface PaletteItem {
  id: string
  section: string
  title: string
  subtitle?: string
  hint?: string
  icon?: ReactNode
  keywords?: string[]
  run: () => void
}

interface CommandPaletteProps {
  open: boolean
  query: string
  items: PaletteItem[]
  onClose: () => void
  onQueryChange: (query: string) => void
  onSelectItem: (item: PaletteItem) => void
}

type SectionEntry =
  | { type: 'section'; id: string; label: string }
  | { type: 'item'; item: PaletteItem; index: number }

export default function CommandPalette({
  open,
  query,
  items,
  onClose,
  onQueryChange,
  onSelectItem,
}: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!open) {
      return
    }

    // Skip auto-focus on touch devices to prevent the mobile keyboard
    // from opening and blocking the command options
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
    if (!isTouchDevice) {
      window.requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((current) => Math.min(current + 1, Math.max(items.length - 1, 0)))
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((current) => Math.max(current - 1, 0))
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        const selected = items[activeIndex]
        if (selected) {
          onSelectItem(selected)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, items, onClose, onSelectItem, open])

  const sections = useMemo(() => {
    const grouped: SectionEntry[] = []
    let currentSection = ''

    items.forEach((item, index) => {
      if (item.section !== currentSection) {
        currentSection = item.section
        grouped.push({
          type: 'section',
          id: `section-${currentSection}`,
          label: currentSection,
        })
      }

      grouped.push({
        type: 'item',
        item,
        index,
      })
    })

    return grouped
  }, [items])

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-start justify-center bg-[rgba(10,10,10,0.4)] px-0 md:px-4 pt-0 md:pt-[12vh]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="w-full max-w-lg overflow-hidden border-[2px] border-[var(--ink)] bg-[var(--bg-elevated)] max-md:max-h-[70vh] max-md:animate-[slideUpSheet_0.18s_ease-out] md:animate-ctx-fade-in"
        style={{
          boxShadow: 'var(--stamp-shadow-lg)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          transformOrigin: 'top center',
        }}
      >
        {/* Title strip */}
        <div className="px-4 py-2 surface-inverse label-mono-strong" style={{ color: 'var(--text-inverse)' }}>
          ⌘K · Command Palette
        </div>

        {/* Search input */}
        <div className="flex items-center gap-2.5 border-b-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)] px-4 py-3">
          <Icon icon={Search01Icon} size={15} stroke={1.5} className="shrink-0 text-[var(--ink)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="What are you looking for?"
            className="w-full bg-transparent text-[13px] font-mono text-[var(--ink)] outline-none placeholder:text-[var(--text-muted)]"
          />
          <kbd className="shrink-0 border-[1.5px] border-[var(--ink)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] uppercase tracking-wider font-mono text-[var(--ink)]">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-3 py-8 text-center label-mono">Nothing matched — try a different search.</div>
          ) : (
            <div>
              {sections.map((entry) => {
                if (entry.type === 'section') {
                  return (
                    <div
                      key={entry.id}
                      className="px-4 pt-3 pb-1 label-mono border-t border-[var(--border-subtle)]"
                    >
                      {entry.label}
                    </div>
                  )
                }

                const { item, index } = entry
                const isActive = index === activeIndex

                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => onSelectItem(item)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors ${
                      isActive
                        ? 'bg-[var(--bg-inverse)] text-[var(--text-inverse)]'
                        : 'text-[var(--ink)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
                      <span
                        className="truncate text-[13px] font-mono"
                      >
                        {item.title}
                      </span>
                    </div>
                    {item.hint ? (
                      <span className="shrink-0 text-[10px] uppercase tracking-wider font-mono opacity-70">
                        {item.hint}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
