import { FILTERS, type FilterKey } from '../lib/filters'

export default function FilterBar({
  value,
  onChange,
  options = FILTERS,
}: {
  value: FilterKey
  onChange: (value: FilterKey) => void
  options?: readonly FilterKey[]
}) {
  return (
    <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 py-0.5">
      {options.map((filter) => {
        const active = filter === value
        return (
          <button
            key={filter}
            type="button"
            onClick={() => onChange(filter)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? 'bg-ationic-ink text-white dark:bg-ationic-yellow dark:text-black'
                : 'bg-white text-zinc-600 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 dark:bg-white/[0.03] dark:text-zinc-300 dark:ring-white/10 dark:hover:bg-white/[0.07]'
            }`}
          >
            {filter}
          </button>
        )
      })}
    </div>
  )
}