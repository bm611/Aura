import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cancel01Icon,
  SparklesIcon,
  KeyboardIcon,
  LayoutGridIcon,
  ZapIcon,
  CloudUploadIcon,
  Chat01Icon,
  StickyNoteIcon,
} from '@hugeicons/core-free-icons'
import Icon from './Icon'

interface WelcomeModalProps {
  open: boolean
  onClose: () => void
  onGetStarted: () => void
}

function TipItem({
  icon: IconComponent,
  title,
  description,
}: {
  icon: any
  title: string
  description: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="flex gap-4 p-4 panel-bordered"
    >
      <div className="flex-shrink-0 w-10 h-10 border-[1.5px] border-[var(--ink)] bg-[var(--accent)] flex items-center justify-center">
        <Icon icon={IconComponent} size={18} strokeWidth={2} style={{ color: 'var(--accent-text)' }} />
      </div>
      <div className="flex-1">
        <h3 className="text-[14px] font-semibold text-[var(--ink)] mb-1 font-mono uppercase tracking-wider">
          {title}
        </h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-mono">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

export default function WelcomeModal({ open, onClose, onGetStarted }: WelcomeModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleGetStarted = useCallback(() => {
    onGetStarted()
    onClose()
  }, [onGetStarted, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-[rgba(10,10,10,0.4)]"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Welcome to Folio"
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 border-[2px] border-[var(--ink)] bg-[var(--bg-elevated)] overflow-hidden"
            style={{ boxShadow: 'var(--stamp-shadow-lg)' }}
          >
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 border-[1.5px] border-[var(--ink)] bg-[var(--accent)] flex items-center justify-center">
                    <Icon icon={SparklesIcon} size={22} strokeWidth={2} style={{ color: 'var(--accent-text)' }} />
                  </div>
                  <div>
                    <h2 className="title-script text-[36px] leading-none">
                      Welcome to Folio
                    </h2>
                    <p className="label-mono mt-1">
                      Your notes, sharp and bordered.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-cell"
                  aria-label="Close"
                >
                  <Icon icon={Cancel01Icon} size={14} strokeWidth={1.5} />
                </button>
              </div>

              {/* Tips */}
              <div className="space-y-3 mb-8">
                <TipItem
                  icon={CloudUploadIcon}
                  title="Cloud Sync"
                  description="Your notes are automatically synced across all your devices."
                />
                <TipItem
                  icon={Chat01Icon}
                  title="AI Chat with Notes"
                  description="Chat with your notes to find information and get insights."
                />
                <TipItem
                  icon={StickyNoteIcon}
                  title="Templates"
                  description="Start with pre-built templates for meetings, projects, and more."
                />
                <TipItem
                  icon={KeyboardIcon}
                  title="Lightning Fast Commands"
                  description="Press Cmd+K to open the command palette for quick actions."
                />
                <TipItem
                  icon={LayoutGridIcon}
                  title="Slash Commands"
                  description="Type / on a new line to insert callouts, tables, tasks, and more."
                />
                <TipItem
                  icon={ZapIcon}
                  title="Markdown Power"
                  description="Full markdown support with bold, italic, code blocks, and nested lists."
                />
              </div>

              {/* Actions */}
              <button
                type="button"
                onClick={handleGetStarted}
                className="btn-stamp btn-stamp-accent w-full justify-center py-3"
              >
                <Icon icon={SparklesIcon} size={14} strokeWidth={2} />
                Get Started
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
