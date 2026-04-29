import { motion } from 'framer-motion'
import { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { File01Icon, Calendar01Icon } from '@hugeicons/core-free-icons'

import Icon from './Icon'
import type { SharedNoteData } from '../lib/sharedNotes'

interface SharedNoteViewerProps {
  note: SharedNoteData
}

function formatDate(iso: string): string {
  try {
    const date = new Date(iso)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-8 text-2xl font-bold text-[var(--ink)] border-b-[1.5px] border-[var(--ink)] pb-2">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-6 text-xl font-bold text-[var(--ink)]">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 text-lg font-semibold text-[var(--ink)]">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 list-disc pl-6 last:mb-0 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal pl-6 last:mb-0 space-y-1">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="pl-1">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-[3px] border-[var(--accent)] pl-4 italic my-4 text-[var(--text-secondary)]">{children}</blockquote>
  ),
  a: (props) => (
    <a href={props.href} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline underline-offset-2">{props.children}</a>
  ),
  code: (props) => {
    const { className, children } = props as { className?: string; children?: React.ReactNode }
    return className ? (
      <code className="block bg-[var(--bg-elevated)] p-4 overflow-x-auto text-[13px] leading-relaxed border-[1.5px] border-[var(--ink)] my-3">{children}</code>
    ) : (
      <code className="px-1.5 py-0.5 bg-[var(--bg-elevated)] text-[var(--ink)] text-[13px] border-[1px] border-[var(--ink)]">{children}</code>
    )
  },
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto">{children}</pre>
  ),
  hr: () => <hr className="my-8 border-t-[1.5px] border-[var(--ink)]" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse border-[1.5px] border-[var(--ink)] text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-[1.5px] border-[var(--ink)] bg-[var(--bg-elevated)] px-3 py-2 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-[1.5px] border-[var(--ink)] px-3 py-2">{children}</td>
  ),
}

export default function SharedNoteViewer({ note }: SharedNoteViewerProps) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = `${note.title || 'Shared Note'} — Folio`
    return () => {
      document.title = prevTitle
    }
  }, [note.title])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]"
    >
      {/* Header */}
      <header className="border-b-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)] px-4 py-3 md:px-8 md:py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon icon={File01Icon} size={20} strokeWidth={1.5} className="text-[var(--text-muted)]" />
            <h1 className="text-lg md:text-xl font-bold truncate max-w-[400px]">
              {note.title || 'Untitled'}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em] font-mono">
            <Icon icon={Calendar01Icon} size={14} strokeWidth={1.5} />
            <span>{formatDate(note.updatedAt || note.createdAt)}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
        <div className="prose-shared font-[var(--font-prose)] text-[15px] leading-relaxed text-[var(--text-primary)] space-y-1">
          {note.content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {note.content}
            </ReactMarkdown>
          ) : (
            <p className="text-[var(--text-muted)] italic">This note is empty.</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)] px-4 py-3 md:px-8">
        <div className="mx-auto max-w-4xl flex items-center justify-between text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em] font-mono">
          <span>Shared via Folio</span>
          <span>Read only</span>
        </div>
      </footer>
    </motion.div>
  )
}
