import { useNavigate } from 'react-router-dom'
import { StatusBadge, TypeBadge, EmptyState } from './ui'
import { daysUntil, relativeDayLabel } from '../lib/date'
import type { ContentItem } from '../types/content'

export default function UpcomingContent({ items }: { items: ContentItem[] }) {
  const navigate = useNavigate()

  return (
    <section className="surface p-4 sm:p-5">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-ationic-ink dark:text-white">
          Upcoming Content
        </h2>
        <button type="button" onClick={() => navigate('/content')} className="btn-subtle px-2 py-1 text-xs">
          View all
        </button>
      </header>

      {items.length === 0 ? (
        <EmptyState
          title="Nothing upcoming"
          hint="Add content with a future publish date and it will show up here."
        />
      ) : (
        <ul className="divide-y divide-zinc-100 dark:divide-white/10">
          {items.map((item) => {
            const days = daysUntil(item.publishDate)
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/content/${item.id}`)}
                  className="flex w-full items-center gap-3 py-2.5 text-left transition hover:opacity-80"
                >
                  <span
                    className={`flex w-16 shrink-0 flex-col items-center rounded-lg px-2 py-1.5 text-center ${
                      days <= 1
                        ? 'bg-ationic-yellow text-black'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wide">
                      {relativeDayLabel(item.publishDate)}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ationic-ink dark:text-zinc-100">
                      {item.title}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5">
                      <TypeBadge type={item.type} size="sm" />
                      <StatusBadge status={item.status} size="sm" />
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}