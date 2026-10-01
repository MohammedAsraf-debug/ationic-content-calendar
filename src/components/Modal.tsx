import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  width?: string
  /** Height class for the scrollable body area. */
  bodyClass?: string
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'max-w-2xl',
  bodyClass = 'max-h-[70vh]',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    }, 40)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      window.clearTimeout(timer)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 sm:p-6">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={`relative z-10 my-auto w-full ${width} animate-slide-up overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-modal dark:border-white/10 dark:bg-ationic-ink-soft`}
      >
        {(title || subtitle) && (
          <header className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4 dark:border-white/10">
            <div className="min-w-0">
              {title ? (
                <h2 className="font-display text-lg font-bold tracking-tight text-ationic-ink dark:text-white">
                  {title}
                </h2>
              ) : null}
              {subtitle ? <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</div> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-1 -mt-1 rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </header>
        )}
        <div className={`overflow-y-auto px-5 py-4 ${bodyClass}`}>{children}</div>
        {footer ? (
          <footer className="flex items-center justify-end gap-2 border-t border-zinc-200 bg-zinc-50/70 px-5 py-3.5 dark:border-white/10 dark:bg-white/[0.02]">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  destructive = true,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      width="max-w-md"
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={destructive ? 'btn bg-red-500 text-white hover:bg-red-600' : 'btn-primary'}
            onClick={onConfirm}
            data-autofocus
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="text-sm text-zinc-600 dark:text-zinc-300">{message}</div>
    </Modal>
  )
}