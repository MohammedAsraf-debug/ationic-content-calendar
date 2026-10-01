import { useEffect, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { friendlyAuthError, useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui'

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51Z"
      />
    </svg>
  )
}

export default function LoginPage() {
  const { user, loading, accessError, clearAccessError, signIn, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const busy = submitting || googleLoading

  useEffect(() => {
    document.title = 'Sign in · Ationic Content Hub'
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ationic-ink text-zinc-400">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  if (user) return <Navigate to="/calendar" replace />

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    clearAccessError()
    setSubmitting(true)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(friendlyAuthError(err))
      setSubmitting(false)
    }
  }

  const onGoogle = async () => {
    setError(null)
    clearAccessError()
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(friendlyAuthError(err))
      setGoogleLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-ationic-ink p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FFE01B 0%, transparent 70%)' }}
        />
        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ationic-yellow font-display text-lg font-bold text-black">
            A
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-white">ATIONIC</span>
        </div>

        <div className="relative max-w-md">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ationic-yellow">
            Internal tool
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white xl:text-5xl">
            CONTENT HUB
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            One shared calendar for planning, writing and shipping content. Plan the month, move work through
            production, and publish on time.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {['Calendar', 'Pipeline', 'Realtime'].map((label) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
                <p className="font-display text-sm font-semibold text-white">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-zinc-600">Ationic Digital Marketing Agency</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-[#F7F7F8] px-5 py-12 dark:bg-[#0B0B0C]">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ationic-yellow font-display font-bold text-black">
              A
            </span>
            <span className="font-display text-base font-bold tracking-tight text-ationic-ink dark:text-white">
              ATIONIC CONTENT HUB
            </span>
          </div>

          <h2 className="font-display text-2xl font-bold tracking-tight text-ationic-ink dark:text-white">
            Sign in
          </h2>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            Use your Ationic team account or your Google account to continue.
          </p>

          {error || accessError ? (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
            >
              {error ?? accessError}
            </div>
          ) : null}

          <button
            type="button"
            onClick={onGoogle}
            disabled={busy}
            className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
          >
            {googleLoading ? <Spinner /> : <GoogleMark />}
            {googleLoading ? 'Connecting to Google…' : 'Continue with Google'}
          </button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
              or use email
            </span>
            <span className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="field-label">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ationic.com"
                className="input"
                data-autofocus
              />
            </label>

            <label className="block">
              <span className="field-label">Password</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
              />
            </label>

            <button type="submit" disabled={busy} className="btn-primary w-full py-2.5">
              {submitting ? <Spinner /> : null}
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-400">
            Access is limited to invited team members.
          </p>
        </div>
      </div>
    </div>
  )
}