import { createPortal } from 'react-dom'
import type { ToastOptions } from '../context/UIContext'

export type ToastItem = { id: number; message: string } & ToastOptions

const TONE: Record<NonNullable<ToastOptions['tone']>, string> = {
  success: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-zinc-500 dark:text-zinc-400',
}

export default function ToastHost({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[]
  onDismiss: (id: number) => void
}) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex animate-slide-up items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-lift dark:border-white/10 dark:bg-ationic-ink-soft"
        >
          <span className={`text-sm font-semibold ${TONE[toast.tone ?? 'info']}`}>●</span>
          <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-200">{toast.message}</span>
          {toast.actionLabel ? (
            <button
              type="button"
              onClick={() => {
                toast.onAction?.()
                onDismiss(toast.id)
              }}
              className="text-sm font-semibold text-ationic-ink underline underline-offset-2 dark:text-ationic-yellow"
            >
              {toast.actionLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss"
            className="text-zinc-400 transition hover:text-zinc-700 dark:hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>,
    document.body,
  )
}