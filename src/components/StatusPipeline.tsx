import { STAGES, type ContentStatus, type Stage } from '../types/content'
import { DEFAULT_STATUS_FOR_STAGE, STATUS_META } from '../lib/meta'

const STAGE_STATUSES: Record<Stage, ContentStatus[]> = {
  Idea: ['Idea'],
  Script: ['Script Pending', 'Script Done'],
  Shoot: ['Shoot Pending', 'Shoot Completed'],
  Edit: ['Editing', 'Edit Completed'],
  Review: ['Review'],
  Scheduled: ['Scheduled'],
  Published: ['Published'],
}

export default function StatusPipeline({
  status,
  onSelectStage,
}: {
  status: ContentStatus
  onSelectStage: (status: ContentStatus) => void
}) {
  const currentIndex = STAGES.indexOf(STATUS_META[status].stage)

  return (
    <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 py-1">
      {STAGES.map((stage, index) => {
        const done = index < currentIndex
        const active = index === currentIndex
        const suggested = DEFAULT_STATUS_FOR_STAGE[stage]
        const isExact = status === suggested
        return (
          <button
            key={stage}
            type="button"
            data-testid={`stage-${stage}`}
            onClick={() => onSelectStage(suggested)}
            title={`Set status to “${suggested}”${STAGE_STATUSES[stage].length > 1 ? ` (also: ${STAGE_STATUSES[stage].filter((s) => s !== suggested).join(', ')})` : ''}`}
            className={`group relative flex min-w-[112px] flex-1 items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition ${
              active
                ? 'border-ationic-yellow bg-ationic-yellow/15 shadow-card dark:bg-ationic-yellow/10'
                : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20'
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                done
                  ? 'bg-emerald-500 text-white'
                  : active
                    ? isExact
                      ? 'bg-ationic-yellow text-black'
                      : 'bg-ationic-yellow/60 text-black'
                    : 'bg-zinc-200 text-zinc-500 dark:bg-white/10 dark:text-zinc-400'
              }`}
            >
              {done ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m20 6-11 11-5-5" />
                </svg>
              ) : active ? (
                <span className="h-2 w-2 rounded-full bg-black" />
              ) : (
                index + 1
              )}
            </span>
            <span className="min-w-0">
              <span
                className={`block truncate text-xs font-semibold ${
                  active ? 'text-ationic-ink dark:text-white' : 'text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {stage}
              </span>
              {active ? (
                <span className="block truncate text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                  {status}
                </span>
              ) : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}