import { useEffect, useRef, useState } from 'react';
import { Cancel01Icon, Loading01Icon } from '@hugeicons/core-free-icons';
import Icon from './Icon';
import { useAuth } from '../contexts/AuthContext';

interface AuthPageProps {
  onBack: () => void;
}

export default function AuthPage({ onBack }: AuthPageProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setTimeout(() => emailRef.current?.focus(), 60);
  }, [tab]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (tab === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName || undefined);
        setSuccess("You're in! Welcome to Folio.");
      }
    } catch (err) {
      setError((err as Error).message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-frame min-h-screen w-full">
      <div className="min-h-[calc(100dvh-24px)] flex items-center justify-center p-4">
        <div className="panel-bordered-thick w-full max-w-[480px] bg-[var(--bg-elevated)]">
          {/* Header bar — inverted */}
          <div className="surface-inverse flex items-center justify-between px-4 py-3 border-b-[1.5px] border-[var(--ink)]">
            <span className="label-mono-strong" style={{ color: 'var(--text-inverse)' }}>
              {tab === 'signin' ? 'Sign in' : 'Sign up'}
            </span>
            <button
              type="button"
              onClick={onBack}
              className="w-7 h-7 inline-flex items-center justify-center border border-[var(--text-inverse)] text-[var(--text-inverse)] hover:bg-[var(--ink-soft)]"
              aria-label="Back"
            >
              <Icon icon={Cancel01Icon} size={14} strokeWidth={2} />
            </button>
          </div>

          <div className="p-6">
            {/* Big script greeting */}
            <h1 className="title-script text-[44px] mb-1">
              {tab === 'signin' ? 'welcome back.' : 'join the fold.'}
            </h1>
            <p className="label-mono mb-6">
              {tab === 'signin'
                ? 'Your notes missed you.'
                : 'Keep your thoughts in sync, everywhere.'}
            </p>

            {/* Tabs */}
            <div className="grid grid-cols-2 mb-6 border-[1.5px] border-[var(--ink)]" role="tablist">
              {([
                { id: 'signin' as const, label: 'Sign in' },
                { id: 'signup' as const, label: 'Sign up' },
              ]).map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`py-2.5 font-mono text-[12px] uppercase tracking-[0.08em] transition-colors ${
                    i === 0 ? 'border-r-[1.5px] border-[var(--ink)]' : ''
                  } ${
                    tab === t.id
                      ? 'bg-[var(--bg-inverse)] text-[var(--text-inverse)]'
                      : 'bg-[var(--bg-surface)] text-[var(--ink)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {tab === 'signup' && (
                <label className="block">
                  <span className="label-mono block mb-1">Display name</span>
                  <input
                    type="text"
                    autoComplete="name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="input-brutal"
                  />
                </label>
              )}

              <label className="block">
                <span className="label-mono block mb-1">Email</span>
                <input
                  ref={emailRef}
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-brutal"
                />
              </label>

              <label className="block">
                <span className="label-mono block mb-1">Password</span>
                <input
                  type="password"
                  autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-brutal"
                />
              </label>

              {error && (
                <p
                  className="px-3 py-2 font-mono text-[12px] uppercase tracking-[0.06em] border-[1.5px] border-[var(--ink)]"
                  style={{
                    background: 'color-mix(in srgb, var(--danger) 18%, var(--bg-elevated))',
                    color: 'var(--ink)',
                  }}
                >
                  {error}
                </p>
              )}
              {success && (
                <p
                  className="px-3 py-2 font-mono text-[12px] uppercase tracking-[0.06em] border-[1.5px] border-[var(--ink)]"
                  style={{
                    background: 'color-mix(in srgb, var(--success) 18%, var(--bg-elevated))',
                    color: 'var(--ink)',
                  }}
                >
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-stamp btn-stamp-accent mt-2 py-3"
              >
                {loading && (
                  <Icon icon={Loading01Icon} size={14} strokeWidth={2} className="animate-spin" />
                )}
                {tab === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-[1.5px] flex-1 bg-[var(--ink)]" />
              <span className="label-mono">or</span>
              <div className="h-[1.5px] flex-1 bg-[var(--ink)]" />
            </div>

            <button
              type="button"
              onClick={async () => {
                setError('');
                try {
                  await signInWithGoogle();
                } catch (err) {
                  setError((err as Error).message || 'Google sign-in failed.');
                }
              }}
              className="btn-stamp w-full py-3"
            >
              <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.1 24.1 0 0 0 0 21.56l7.98-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
