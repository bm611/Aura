import { useEffect, useRef, useState } from 'react'
import { IconX, IconLoader2, IconMail, IconLock } from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'

export default function AuthModal({ open, onClose }) {
  const { signInWithEmail, signUpWithEmail } = useAuth()
  const [tab, setTab] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const emailRef = useRef(null)

  // Focus email on open
  useEffect(() => {
    if (open) {
      setError('')
      setSuccess('')
      setEmail('')
      setPassword('')
      setTab('signin')
      setTimeout(() => emailRef.current?.focus(), 60)
    }
  }, [open])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (tab === 'signin') {
        await signInWithEmail(email, password)
        onClose()
      } else {
        await signUpWithEmail(email, password)
        setSuccess('Account created! You are now signed in.')
        setTimeout(onClose, 1200)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={tab === 'signin' ? 'Sign in' : 'Create account'}
        className="fixed left-1/2 top-1/2 z-[101] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-7 shadow-2xl"
        style={{ boxShadow: 'var(--neu-shadow)' }}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2
              className="text-2xl font-bold text-[var(--text-primary)]"
              style={{ fontFamily: '"Fraunces", serif' }}
            >
              {tab === 'signin' ? 'Welcome back.' : 'Create account.'}
            </h2>
            <p className="mt-1 text-[13px] text-[var(--text-muted)]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
              {tab === 'signin' ? 'Sign in to sync your notes.' : 'Sync your notes across devices.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="neu-icon-btn flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close"
          >
            <IconX size={16} stroke={1.5} />
          </button>
        </div>

        {/* Tab switcher */}
        <div
          className="mb-5 flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-deep)] p-1"
          role="tablist"
        >
          {[
            { id: 'signin', label: 'Sign In' },
            { id: 'signup', label: 'Sign Up' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => { setTab(t.id); setError(''); setSuccess('') }}
              className={`flex-1 rounded-lg py-2 text-[13px] font-medium transition-all duration-200 ${
                tab === t.id
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
              style={{ fontFamily: '"DM Sans", sans-serif' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Email */}
          <div className="relative">
            <IconMail
              size={15}
              stroke={1.5}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <input
              ref={emailRef}
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-deep)] py-2.5 pl-9 pr-4 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors"
              style={{ fontFamily: '"DM Sans", sans-serif' }}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <IconLock
              size={15}
              stroke={1.5}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <input
              id="auth-password"
              type="password"
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-deep)] py-2.5 pl-9 pr-4 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors"
              style={{ fontFamily: '"DM Sans", sans-serif' }}
            />
          </div>

          {/* Error / success */}
          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[13px] text-red-400" style={{ fontFamily: '"DM Sans", sans-serif' }}>
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-xl border border-[var(--success)]/20 bg-[var(--success)]/10 px-3 py-2 text-[13px] text-[var(--success)]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
              {success}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] py-3 text-[14px] font-semibold text-white transition-all duration-200 hover:translate-y-[1px] hover:shadow-[0_0_20px_rgba(209,123,136,0.3)] active:translate-y-[3px] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ fontFamily: '"DM Sans", sans-serif', boxShadow: 'var(--neu-shadow)' }}
          >
            {loading && <IconLoader2 size={15} stroke={2} className="animate-spin" />}
            {tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </>
  )
}
