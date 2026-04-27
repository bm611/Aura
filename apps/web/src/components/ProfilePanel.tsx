import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

interface ProfilePanelProps {
  onClose: () => void
}

export default function ProfilePanel({ onClose }: ProfilePanelProps) {
  const { user, signOut, updateDisplayName } = useAuth()
  const panelRef = useRef<HTMLDivElement>(null)

  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.display_name || user?.email?.split('@')[0] || ''
  )
  const [saving, setSaving] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle')

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const timer = setTimeout(() => document.addEventListener('mousedown', handlePointerDown), 10)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [onClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function handleSave() {
    if (saving || !displayName.trim()) return
    setSaving(true)
    try {
      await updateDisplayName(displayName)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch {
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 2000)
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const initial = user.email?.[0]?.toUpperCase() || '?'

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.13, ease: [0.16, 1, 0.3, 1] }}
      className="absolute right-0 top-[calc(100%+6px)] z-50 w-80 border-[1.5px] border-[var(--ink)] bg-[var(--bg-surface)]"
      style={{ boxShadow: '4px 4px 0 var(--ink)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b-[1.5px] border-[var(--ink)] bg-[var(--bg-primary)]">
        <div className="flex items-center justify-center w-12 h-12 flex-shrink-0 bg-[var(--accent)] text-[var(--accent-text)] font-mono font-bold text-lg border-[1.5px] border-[var(--ink)]">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            initial
          )}
        </div>
        <div className="min-w-0">
          <div className="font-mono font-semibold text-sm text-[var(--ink)] truncate">
            {user.user_metadata?.display_name || user.email?.split('@')[0]}
          </div>
          <div className="font-mono text-xs text-[var(--text-muted)] truncate mt-0.5">{user.email}</div>
        </div>
      </div>

      {/* Email (read-only) */}
      <div className="px-5 pt-4 pb-3 border-b-[1.5px] border-[var(--ink)]">
        <div className="label-mono mb-1.5">Email</div>
        <div className="font-mono text-xs text-[var(--text-secondary)] px-3 py-2 border-[1.5px] border-[var(--border-subtle)] bg-[var(--bg-deep)]">
          {user.email}
        </div>
      </div>

      {/* Display name */}
      <div className="px-5 pt-4 pb-4 border-b-[1.5px] border-[var(--ink)]">
        <div className="label-mono mb-1.5">Display name</div>
        <div className="flex gap-0">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Your name"
            className="flex-1 h-9 px-3 border-[1.5px] border-[var(--ink)] border-r-0 bg-[var(--bg-primary)] font-mono text-xs text-[var(--ink)] outline-none focus:bg-[var(--bg-hover)] transition-colors placeholder:text-[var(--text-muted)]"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-cell h-9 px-4 flex-shrink-0 border-l-0"
            style={saveState === 'saved' ? { color: 'var(--success)' } : saveState === 'error' ? { color: 'var(--danger)' } : {}}
          >
            {saveState === 'saved' ? '✓ Saved' : saveState === 'error' ? 'Error' : saving ? '…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Sign out */}
      <div className="px-5 py-4">
        <button
          type="button"
          onClick={signOut}
          className="btn-pill w-full justify-center text-xs"
          style={{ borderColor: 'var(--danger)', color: 'var(--danger)', background: 'transparent' }}
        >
          Sign out
        </button>
      </div>
    </motion.div>
  )
}
