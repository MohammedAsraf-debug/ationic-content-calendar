import { useEffect, useMemo, useState } from 'react'
import Calendar from '../components/Calendar'
import FilterBar from '../components/FilterBar'
import StatCards from '../components/StatCards'
import UpcomingContent from '../components/UpcomingContent'
import { Spinner } from '../components/ui'
import { useContent } from '../hooks/useContent'
import { filterItems, monthStats, upcomingItems, type FilterKey } from '../lib/filters'
import { contentToCsv, downloadCsv } from '../lib/csv'
import { monthLabel } from '../lib/date'
import { STATUS_META } from '../lib/meta'
import { STATUSES, type ContentItem } from '../types/content'
import { useUI } from '../context/UIContext'

const QUICK_FILTERS = ['All', 'Reels', 'Carousels', 'Published', 'In Production', 'Scheduled'] as const

export default function DashboardPage() {
  const { items, loading, error } = useContent()
  const { openAddContent } = useUI()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [filter, setFilter] = useState<FilterKey>('All')

  useEffect(() => {
    document.title = 'Calendar · Ationic Content Hub'
  }, [])

  const monthItems = useMemo(
    () =>
      items.filter((item) => {
        const [y, m] = item.publishDate.split('-')
        return Number(y) === year && Number(m) === month + 1
      }),
    [items, year, month],
  )

  const visibleItems = useMemo(() => filterItems(monthItems, filter), [monthItems, filter])
  const stats = useMemo(() => monthStats(monthItems), [monthItems])
  const upcoming = useMemo(() => upcomingItems(items, 5), [items])

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1)
    setYear(next.getFullYear())
    setMonth(next.getMonth())
  }

  const goToday = () => {
    const today = new Date()
    setYear(today.getFullYear())
    setMonth(today.getMonth())
  }

  const exportCsv = () => {
    downloadCsv(
      `ationic-content-${year}-${String(month + 1).padStart(2, '0')}.csv`,
      contentToCsv(visibleItems),
    )
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            This month
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ationic-ink dark:text-white sm:text-3xl">
            {monthLabel(year, month)}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={exportCsv} className="btn-ghost">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export CSV
          </button>
          <button type="button" onClick={() => openAddContent()} className="btn-ghost">
            + Add Content
          </button>
        </div>
      </header>

      <StatCards stats={stats} />

      {error ? (
        <div className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => shiftMonth(-1)} className="btn-ghost px-2.5" aria-label="Previous month">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button type="button" onClick={goToday} className="btn-ghost">
                Today
              </button>
              <button type="button" onClick={() => shiftMonth(1)} className="btn-ghost px-2.5" aria-label="Next month">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
              <span className="ml-1 font-display text-sm font-bold uppercase tracking-[0.1em] text-ationic-ink dark:text-white">
                {monthLabel(year, month)}
              </span>
            </div>

            <FilterBar value={filter} onChange={setFilter} options={QUICK_FILTERS} />
          </div>

          {loading ? (
            <div className="surface flex h-64 items-center justify-center gap-2 text-sm text-zinc-500">
              <Spinner /> Loading content…
            </div>
          ) : (
            <Calendar year={year} month={month} items={visibleItems} />
          )}

          {loading ? null : (
            <p className="text-xs text-zinc-400">
              Showing {visibleItems.length} of {monthItems.length} item
              {monthItems.length === 1 ? '' : 's'} this month.
            </p>
          )}
        </section>

        <aside className="space-y-5">
          <UpcomingContent items={upcoming} />
          <PipelineSnapshot items={items} />
        </aside>
      </div>
    </div>
  )
}

function PipelineSnapshot({ items }: { items: ContentItem[] }) {
  const counts = STATUSES.map((status) => ({
    status,
    count: items.filter((item) => item.status === status).length,
  }))
  const max = Math.max(1, ...counts.map((c) => c.count))

  return (
    <section className="surface p-4 sm:p-5">
      <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.12em] text-ationic-ink dark:text-white">
        Production Pipeline
      </h2>
      <ul className="space-y-2">
        {counts.map(({ status, count }) => (
          <li key={status} className="flex items-center gap-2.5">
            <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_META[status].dot}`} />
            <span className="w-28 shrink-0 truncate text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {status}
            </span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.07]">
              <span
                className={`block h-full rounded-full ${STATUS_META[status].dot}`}
                style={{ width: `${(count / max) * 100}%` }}
              />
            </span>
            <span className="w-5 shrink-0 text-right text-xs font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
              {count}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}