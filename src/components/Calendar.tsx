import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from './Modal'
import { StatusBadge, TypeBadge } from './ui'
import { isSameMonth, monthGrid, relativeDayLabel, WEEKDAYS, formatDateLong } from '../lib/date'
import { STATUS_META } from '../lib/meta'
import type { ContentItem } from '../types/content'
import { useUI } from '../context/UIContext'

const MAX_VISIBLE = 3

function dayItems(items: ContentItem[]): Map<string, ContentItem[]> {
  const map = new Map<string, ContentItem[]>()
  for (const item of items) {
    const list = map.get(item.publishDate)
    if (list) list.push(item)
    else map.set(item.publishDate, [item])
  }
  return map
}

export default function Calendar({
  year,
  month,
  items,
}: {
  year: number
  month: number
  items: ContentItem[]
}) {
  const navigate = useNavigate()
  const { openAddContent } = useUI()
  const [dayKey, setDayKey] = useState<string | null>(null)

  const grid = useMemo(() => monthGrid(year, month), [year, month])
  const byDate = useMemo(() => dayItems(items), [items])
  const today = new Date().toDateString()
  const selectedDayItems = dayKey ? (byDate.get(dayKey) ?? []) : []

  return (
    <>
      <div className="surface overflow-hidden">
        <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-white/10">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500 sm:text-[11px]"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {grid.map((key) => {
            const date = new Date(`${key}T00:00:00`)
            const inMonth = isSameMonth(key, year, month)
            const dayContent = byDate.get(key) ?? []
            const overflow = Math.max(0, dayContent.length - MAX_VISIBLE)
            const isToday = date.toDateString() === today

            return (
              <div
                key={key}
                data-testid={`day-${key}`}
                className={`group relative min-h-[112px] border-b border-r border-zinc-200 p-1.5 transition sm:min-h-[136px] dark:border-white/10 ${
                  inMonth
                    ? 'bg-white dark:bg-white/[0.02]'
                    : 'bg-zinc-50/60 dark:bg-black/20'
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`inline-flex h-6 min-w-[24px] items-center justify-center rounded-full px-1 text-xs font-semibold ${
                      isToday
                        ? 'bg-ationic-yellow text-black'
                        : inMonth
                          ? 'text-zinc-600 dark:text-zinc-300'
                          : 'text-zinc-300 dark:text-zinc-600'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {dayContent.length > MAX_VISIBLE ? (
                    <button
                      type="button"
                      onClick={() => setDayKey(key)}
                      className="rounded-md px-1 text-[10px] font-semibold text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-200"
                    >
                      +{overflow}
                    </button>
                  ) : null}
                </div>

                <div className="space-y-1">
                  {dayContent.slice(0, MAX_VISIBLE).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      data-testid="calendar-item"
                      onClick={() => navigate(`/content/${item.id}`)}
                      className="block w-full rounded-lg border border-zinc-200 bg-white p-1.5 text-left transition hover:border-ationic-yellow hover:shadow-card dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-ationic-yellow/60"
                    >
                      <span className="line-clamp-2 block text-[11px] font-semibold leading-tight text-ationic-ink dark:text-zinc-100">
                        {item.title}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-1">
                        <TypeBadge type={item.type} size="sm" />
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ring-1 ring-inset ${
                            STATUS_META[item.status].badge
                          }`}
                        >
                          <span className={`h-1 w-1 rounded-full ${STATUS_META[item.status].dot}`} />
                          {item.status}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                {dayContent.length === 0 && inMonth ? (
                  <button
                    type="button"
                    onClick={() => openAddContent(key)}
                    title="Add content on this date"
                    className="absolute inset-x-1.5 bottom-1.5 hidden items-center justify-center rounded-lg border border-dashed border-zinc-300 py-1 text-[10px] font-semibold text-zinc-400 transition hover:border-ationic-yellow hover:text-zinc-700 group-hover:flex dark:border-white/15 dark:hover:text-zinc-200"
                  >
                    + Add
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      <Modal
        open={dayKey !== null}
        onClose={() => setDayKey(null)}
        title={dayKey ? formatDateLong(dayKey) : ''}
        subtitle={`${selectedDayItems.length} item${selectedDayItems.length === 1 ? '' : 's'} scheduled`}
        width="max-w-lg"
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setDayKey(null)}>
              Close
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                const date = dayKey
                setDayKey(null)
                if (date) openAddContent(date)
              }}
            >
              + Add content
            </button>
          </>
        }
      >
        <div className="space-y-2">
          {selectedDayItems.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Nothing planned for this day yet.
            </p>
          ) : null}
          {selectedDayItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setDayKey(null)
                navigate(`/content/${item.id}`)
              }}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 p-3 text-left transition hover:border-ationic-yellow hover:shadow-card dark:border-white/10 dark:hover:border-ationic-yellow/60"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ationic-ink dark:text-zinc-100">
                  {item.title}
                </span>
                <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <TypeBadge type={item.type} size="sm" />
                  <StatusBadge status={item.status} size="sm" />
                </span>
              </span>
              <span className="text-xs text-zinc-400">{relativeDayLabel(item.publishDate)}</span>
            </button>
          ))}
        </div>
      </Modal>
    </>
  )
}