const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3))
export const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

/** `YYYY-MM-DD` for a Date, in local time (avoids UTC off-by-one). */
export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Parses `YYYY-MM-DD` into a local Date at midnight. */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function formatDateLong(key: string): string {
  const d = fromDateKey(key)
  return `${WEEKDAYS[(d.getDay() + 6) % 7]} · ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

export function formatDateShort(key: string): string {
  const d = fromDateKey(key)
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`
}

export function monthLabel(year: number, month: number): string {
  return `${MONTHS[month]} ${year}`
}

/** All `YYYY-MM-DD` keys for a month grid, starting Monday. Always 42 cells. */
export function monthGrid(year: number, month: number): string[] {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7 // Monday = 0
  const start = new Date(year, month, 1 - offset)
  const keys: string[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    keys.push(toDateKey(d))
  }
  return keys
}

export function isSameMonth(key: string, year: number, month: number): boolean {
  const d = fromDateKey(key)
  return d.getFullYear() === year && d.getMonth() === month
}

/** "Today" / "Tomorrow" / "Oct 4" for upcoming content lists. */
export function relativeDayLabel(key: string): string {
  const target = fromDateKey(key)
  const today = fromDateKey(todayKey())
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 1 && diff < 7) return target.toLocaleDateString(undefined, { weekday: 'long' })
  return formatDateShort(key)
}

export function daysUntil(key: string): number {
  const target = fromDateKey(key)
  const today = fromDateKey(todayKey())
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

/** "2 minutes ago", "3 hours ago", "Oct 4" */
export function relativeTime(timestamp?: number | null): string {
  if (!timestamp) return '—'
  const seconds = Math.round((Date.now() - timestamp) / 1000)
  if (seconds < 45) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}