import type { Reference } from '../types/content'
import { newReference } from '../lib/templates'

export default function ReferencesEditor({
  references,
  onChange,
}: {
  references: Reference[]
  onChange: (references: Reference[]) => void
}) {
  const rows = references.length > 0 ? references : [newReference()]

  return (
    <div className="space-y-2">
      {rows.map((reference, index) => (
        <div key={reference.id} className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 dark:border-white/10 dark:bg-white/[0.04]">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="shrink-0 text-zinc-400"
            >
              <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
            </svg>
            <input
              className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-zinc-400"
              placeholder="https://example.com/reference"
              value={reference.url}
              onChange={(e) => {
                const next = [...rows]
                next[index] = { ...reference, url: e.target.value }
                onChange(next)
              }}
            />
          </div>
          <input
            className="input w-44"
            placeholder="Label"
            value={reference.label}
            onChange={(e) => {
              const next = [...rows]
              next[index] = { ...reference, label: e.target.value }
              onChange(next)
            }}
          />
          <a
            href={reference.url || undefined}
            target="_blank"
            rel="noreferrer noopener"
            className="btn-subtle px-2.5"
            aria-label="Open reference"
            title="Open link"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3h7v7M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
            </svg>
          </a>
          <button
            type="button"
            className="btn-subtle px-2.5"
            title="Remove reference"
            aria-label="Remove reference"
            onClick={() => onChange(rows.filter((_, i) => i !== index))}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn-ghost px-3 py-1.5 text-xs"
        onClick={() => onChange([...rows, newReference()])}
      >
        + Add link
      </button>
    </div>
  )
}