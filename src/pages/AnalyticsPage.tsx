import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import StatCards from '../components/StatCards'
import { EmptyState, Spinner } from '../components/ui'
import { useContent } from '../hooks/useContent'
import { monthStats, upcomingItems } from '../lib/filters'
import { MONTHS_SHORT, isSameMonth, monthLabel } from '../lib/date'
import { STATUS_META } from '../lib/meta'
import { CONTENT_TYPES, PILLARS, PLATFORMS, STATUSES } from '../types/content'

export default function AnalyticsPage() {
  const { items, loading } = useContent()
  const now = new Date()
  const [year, month] = [now.getFullYear(), now.getMonth()]

  useEffect(() => {
    document.title = 'Analytics · Ationic Content Hub'
  }, [])

  const monthItems = useMemo(
    () => items.filter((item) => isSameMonth(item.publishDate, year, month)),
    [items, year, month],
  )

  const lastSixMonths = useMemo(() => {
    const months: { key: string; label: string; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - i, 1)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      months.push({
        key,
        label: `${MONTHS_SHORT[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
        count: items.filter((item) => {
          const [y, m] = item.publishDate.split('-')
          return `${Number(y)}-${Number(m) - 1}` === key
        }).length,
      })
    }
    return months
  }, [items, year, month])

  if (loading) {
    return (
      <div className="surface flex h-64 items-center justify-center gap-2 text-sm text-zinc-500">
        <Spinner /> Loading analytics…
      </div>
    )
  }

  const stats = monthStats(monthItems)
  const maxMonth = Math.max(1, ...lastSixMonths.map((m) => m.count))

  const breakdown = (
    title: string,
    entries: { label: string; count: number; dot?: string }[],
    total: number,
  ) => (
    <section className="surface p-4 sm:p-5">
      <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.12em] text-ationic-ink dark:text-white">
        {title}
      </h2>
      {total === 0 ? (
        <p className="text-sm text-zinc-400">No data for this month.</p>
      ) : (
        <ul className="space-y-2.5">
          {entries.map((entry) => (
            <li key={entry.label} className="flex items-center gap-3">
              <span className="w-24 shrink-0 truncate text-xs font-medium text-zinc-600 dark:text-zinc-300">
                {entry.label}
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.07]">
                <span
                  className={`block h-full rounded-full ${entry.dot ?? 'bg-ationic-yellow'}`}
                  style={{ width: `${total ? (entry.count / total) * 100 : 0}%` }}
                />
              </span>
              <span className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
                {entry.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )

  const upcoming = upcomingItems(items, 5)

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
          Insights
        </p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ationic-ink dark:text-white sm:text-3xl">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {monthLabel(year, month)} · calculated live from Firestore
        </p>
      </header>

      {items.length === 0 ? (
        <EmptyState
          title="No content yet"
          hint="Add your first content item and these numbers will fill in automatically."
        />
      ) : (
        <>
          <StatCards stats={stats} />

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {breakdown(
              'Production status',
              STATUSES.map((status) => ({
                label: status,
                count: monthItems.filter((i) => i.status === status).length,
                dot: STATUS_META[status].dot,
              })).filter((entry) => entry.count > 0),
              monthItems.length,
            )}

            {breakdown(
              'Content type',
              CONTENT_TYPES.map((type) => ({
                label: type,
                count: monthItems.filter((i) => i.type === type).length,
              })).filter((entry) => entry.count > 0),
              monthItems.length,
            )}

            {breakdown(
              'Platform',
              PLATFORMS.map((platform) => ({
                label: platform,
                count: monthItems.filter((i) => i.platform === platform).length,
              })).filter((entry) => entry.count > 0),
              monthItems.length,
            )}

            {breakdown(
              'Content pillar',
              PILLARS.map((pillar) => ({
                label: pillar,
                count: monthItems.filter((i) => i.pillar === pillar).length,
              })).filter((entry) => entry.count > 0),
              monthItems.length,
            )}

            <section className="surface p-4 sm:p-5 lg:col-span-2">
              <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.12em] text-ationic-ink dark:text-white">
                Output · last 6 months
              </h2>
              <div className="flex h-40 items-end gap-3">
                {lastSixMonths.map((m) => (
                  <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
                      {m.count}
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-ationic-yellow transition-all"
                      style={{ height: `${Math.max(4, (m.count / maxMonth) * 110)}px` }}
                    />
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="surface p-4 sm:p-5">
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.12em] text-ationic-ink dark:text-white">
              Next up
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-zinc-400">Nothing scheduled. Add content from the calendar.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {upcoming.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={`/content/${item.id}`}
                      className="block rounded-xl border border-zinc-200 p-3 transition hover:border-ationic-yellow dark:border-white/10"
                    >
                      <p className="truncate text-sm font-semibold text-ationic-ink dark:text-zinc-100">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {item.type} · {item.status} · {item.publishDate}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}