import type { ReactNode } from 'react'
import { STATUS_META, TYPE_META } from '../lib/meta'
import type { ContentStatus, ContentType, Priority } from '../types/content'
import { PRIORITY_META } from '../lib/meta'

export function StatusBadge({
  status,
  size = 'md',
}: {
  status: ContentStatus
  size?: 'sm' | 'md'
}) {
  const meta = STATUS_META[status]
  return (
    <span className={`chip ${meta.badge} ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : ''}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {status}
    </span>
  )
}

export function TypeBadge({ type, size = 'md' }: { type: ContentType; size?: 'sm' | 'md' }) {
  const meta = TYPE_META[type]
  return (
    <span className={`chip ${meta.badge} ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : ''}`}>
      {meta.short}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority]
  return (
    <span className={`chip bg-transparent px-0 py-0 ring-0 ${meta.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {priority}
    </span>
  )
}

export function Avatar({ initials, name }: { initials: string; name?: string }) {
  return (
    <span
      title={name}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ationic-ink text-[11px] font-bold text-white dark:bg-ationic-yellow dark:text-black"
    >
      {initials}
    </span>
  )
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-zinc-300 px-6 py-10 text-center dark:border-white/15">
      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{title}</p>
      {hint ? <p className="max-w-sm text-xs text-zinc-500 dark:text-zinc-400">{hint}</p> : null}
      {action}
    </div>
  )
}

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-zinc-400">{hint}</span> : null}
    </label>
  )
}