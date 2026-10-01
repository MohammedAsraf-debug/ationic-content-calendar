import type { MonthStats } from '../lib/filters'

const CARD_ORDER: { key: keyof MonthStats; label: string; accent?: boolean }[] = [
  { key: 'planned', label: 'Planned', accent: true },
  { key: 'reels', label: 'Reels' },
  { key: 'carousels', label: 'Carousels' },
  { key: 'inProduction', label: 'In Production' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'published', label: 'Published' },
]

export default function StatCards({ stats }: { stats: MonthStats }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 xl:grid-cols-6">
      {CARD_ORDER.map(({ key, label, accent }) => (
        <div
          key={key}
          className={`rounded-card border p-3.5 shadow-card transition sm:p-4 ${
            accent
              ? 'border-ationic-yellow/60 bg-ationic-yellow dark:border-ationic-yellow/50 dark:bg-ationic-yellow'
              : 'border-zinc-200/80 bg-white dark:border-white/10 dark:bg-white/[0.03]'
          }`}
        >
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.12em] ${
              accent ? 'text-black/60' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {label}
          </p>
          <p
            data-testid={`stat-${key}`}
            className={`mt-1.5 font-display text-2xl font-bold tabular-nums sm:text-3xl ${
              accent ? 'text-black' : 'text-ationic-ink dark:text-white'
            }`}
          >
            {stats[key]}
          </p>
        </div>
      ))}
    </div>
  )
}