import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FilterBar from '../components/FilterBar'
import { EmptyState, PriorityBadge, Spinner, StatusBadge, TypeBadge } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'
import { useContent } from '../hooks/useContent'
import { matchesFilter, matchesSearch, type FilterKey } from '../lib/filters'
import { contentToCsv, downloadCsv } from '../lib/csv'
import { formatDateShort, relativeTime } from '../lib/date'
import { updateContent } from '../lib/contentService'
import { STATUSES, type ContentItem, type ContentStatus } from '../types/content'

export default function ContentListPage() {
  const { items, loading, error } = useContent()
  const { profile } = useAuth()
  const { openAddContent, notify } = useUI()
  const [filter, setFilter] = useState<FilterKey>('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'date-asc' | 'date-desc' | 'recent'>('date-asc')

  useEffect(() => {
    document.title = 'Content · Ationic Content Hub'
  }, [])

  const visible = useMemo(() => {
    const filtered = items.filter((item) => matchesFilter(item, filter) && matchesSearch(item, search))
    const sorted = [...filtered]
    if (sort === 'date-asc') sorted.sort((a, b) => a.publishDate.localeCompare(b.publishDate))
    if (sort === 'date-desc') sorted.sort((a, b) => b.publishDate.localeCompare(a.publishDate))
    if (sort === 'recent') sorted.sort((a, b) => b.updatedAt - a.updatedAt)
    return sorted
  }, [items, search, filter, sort])

  const quickUpdate = async (id: string, status: ContentStatus) => {
    try {
      await updateContent(id, { status }, { uid: profile?.uid ?? '', name: profile?.name ?? 'Team Member' })
    } catch (err) {
      notify((err as Error).message || 'Could not update status', { tone: 'error' })
    }
  }

  const exportCsv = () => {
    downloadCsv(`ationic-content-${new Date().toISOString().slice(0, 10)}.csv`, contentToCsv(visible))
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Library
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ationic-ink dark:text-white sm:text-3xl">
            Content
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={exportCsv} className="btn-ghost">
            Export CSV
          </button>
          <button type="button" onClick={() => openAddContent()} className="btn-ghost">
            + Add Content
          </button>
        </div>
      </header>

      <div className="surface space-y-3 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              className="input pl-9"
              placeholder="Search titles, hooks, hashtags…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search content"
            />
          </div>
          <select
            className="input w-auto"
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            aria-label="Sort content"
          >
            <option value="date-asc">Publish date ↑</option>
            <option value="date-desc">Publish date ↓</option>
            <option value="recent">Recently updated</option>
          </select>
        </div>
        <FilterBar value={filter} onChange={setFilter} />
      </div>

      {error ? (
        <div className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="surface flex h-40 items-center justify-center gap-2 text-sm text-zinc-500">
          <Spinner /> Loading content…
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          title="No content matches these filters"
          hint="Try a different filter, clear the search, or add new content."
          action={
            <button type="button" onClick={() => openAddContent()} className="btn-primary mt-2">
              + Add Content
            </button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {visible.map((item) => (
            <ContentRow key={item.id} item={item} onStatusChange={quickUpdate} />
          ))}
        </ul>
      )}
    </div>
  )
}

function ContentRow({
  item,
  onStatusChange,
}: {
  item: ContentItem
  onStatusChange: (id: string, status: ContentStatus) => void
}) {
  return (
    <li className="surface group flex flex-wrap items-center gap-3 p-3 transition hover:border-ationic-yellow/60 hover:shadow-lift sm:flex-nowrap sm:px-4">
      <div className="min-w-0 flex-1">
        <Link
          to={`/content/${item.id}`}
          className="block truncate text-sm font-semibold text-ationic-ink hover:underline dark:text-zinc-100"
        >
          {item.title}
        </Link>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <TypeBadge type={item.type} size="sm" />
          <StatusBadge status={item.status} size="sm" />
          <PriorityBadge priority={item.priority} />
          <span className="text-[11px] text-zinc-400">
            {item.platform} · {item.pillar}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <select
          className="input w-40 py-1.5 text-xs"
          value={item.status}
          onChange={(e) => onStatusChange(item.id, e.target.value as ContentStatus)}
          aria-label={`Change status for ${item.title}`}
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <div className="w-28 shrink-0 text-right">
          <p className="text-xs font-semibold text-ationic-ink dark:text-zinc-200">
            {item.publishDate ? formatDateShort(item.publishDate) : 'No date'}
          </p>
          <p className="text-[11px] text-zinc-400">
            {item.updatedByName || 'Team'} · {relativeTime(item.updatedAt)}
          </p>
        </div>
        <Link
          to={`/content/${item.id}`}
          className="btn-ghost shrink-0 px-3 py-1.5 text-xs"
          aria-label={`Open ${item.title}`}
        >
          Open
        </Link>
      </div>
    </li>
  )
}