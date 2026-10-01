import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UIProvider, useUI } from '../context/UIContext'
import { useTheme } from '../hooks/useTheme'
import { Avatar } from './ui'

const NAV_ITEMS = [
  { to: '/calendar', label: 'Calendar' },
  { to: '/content', label: 'Content' },
  { to: '/analytics', label: 'Analytics' },
]

function Logo() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ationic-yellow font-display text-base font-bold text-black">
      A
    </span>
  )
}

export default function AppLayout() {
  return (
    <UIProvider>
      <AppLayoutInner />
    </UIProvider>
  )
}

function AppLayoutInner() {
  const { profile, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { openAddContent } = useUI()
  const [menuOpen, setMenuOpen] = useState(false)

  // Keyboard shortcut: press "N" anywhere (outside a text field) to add content.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      if (event.key.toLowerCase() !== 'n') return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isTyping) return
      event.preventDefault()
      openAddContent()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openAddContent])

  // Close the profile menu when navigating.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md dark:border-white/10 dark:bg-[#0B0B0C]/85">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/calendar')}
            className="flex items-center gap-3"
            aria-label="Ationic Content Hub home"
          >
            <Logo />
            <span className="hidden text-left leading-tight sm:block">
              <span className="block font-display text-[15px] font-bold tracking-tight text-ationic-ink dark:text-white">
                ATIONIC
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Content Hub
              </span>
            </span>
          </button>

          <nav className="ml-2 flex items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-white/[0.06]">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-white text-ationic-ink shadow-sm dark:bg-ationic-yellow dark:text-black'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => openAddContent()} className="btn-primary" title="Add content (N)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="hidden sm:inline">Add Content</span>
              <span className="kbd ml-1 hidden bg-black/10 text-black/60 lg:inline-flex">N</span>
            </button>

            <button
              type="button"
              onClick={toggle}
              className="btn-subtle px-2.5"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
                </svg>
              )}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl p-1 pr-2 transition hover:bg-zinc-100 dark:hover:bg-white/[0.07]"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <Avatar initials={profile?.initials ?? 'TM'} name={profile?.name} />
                <span className="hidden text-sm font-semibold text-zinc-700 md:block dark:text-zinc-200">
                  {profile?.name}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-zinc-400">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {menuOpen ? (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                  <div
                    role="menu"
                    className="absolute right-0 z-20 mt-2 w-60 animate-scale-in overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lift dark:border-white/10 dark:bg-ationic-ink-soft"
                  >
                    <div className="border-b border-zinc-100 px-4 py-3 dark:border-white/10">
                      <p className="truncate text-sm font-semibold text-ationic-ink dark:text-white">
                        {profile?.name}
                      </p>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{profile?.email}</p>
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        void signOut()
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/[0.06]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}