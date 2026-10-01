import type { ContentItem, ContentType } from '../types/content'
import { STATUS_META } from './meta'

export const FILTERS = [
  'All',
  'Reels',
  'Carousels',
  'Stories',
  'YouTube',
  'Published',
  'In Production',
  'Scheduled',
] as const

export type FilterKey = (typeof FILTERS)[number]

const TYPE_BY_FILTER: Partial<Record<FilterKey, ContentType>> = {
  Reels: 'Reel',
  Carousels: 'Carousel',
  Stories: 'Story',
  YouTube: 'YouTube Video',
}

export function matchesFilter(item: ContentItem, filter: FilterKey): boolean {
  if (filter === 'All') return true
  const type = TYPE_BY_FILTER[filter]
  if (type) return item.type === type
  if (filter === 'Published') return STATUS_META[item.status].group === 'published'
  if (filter === 'Scheduled') return STATUS_META[item.status].group === 'scheduled'
  if (filter === 'In Production') return STATUS_META[item.status].group === 'production'
  return true
}

export function filterItems(items: ContentItem[], filter: FilterKey): ContentItem[] {
  return items.filter((item) => matchesFilter(item, filter))
}

export function matchesSearch(item: ContentItem, term: string): boolean {
  const q = term.trim().toLowerCase()
  if (!q) return true
  return (
    item.title.toLowerCase().includes(q) ||
    item.hook.toLowerCase().includes(q) ||
    item.idea.toLowerCase().includes(q) ||
    item.hashtags.toLowerCase().includes(q) ||
    item.platform.toLowerCase().includes(q) ||
    item.pillar.toLowerCase().includes(q)
  )
}

export type MonthStats = {
  planned: number
  reels: number
  carousels: number
  inProduction: number
  scheduled: number
  published: number
}

export function monthStats(items: ContentItem[]): MonthStats {
  return {
    planned: items.length,
    reels: items.filter((i) => i.type === 'Reel').length,
    carousels: items.filter((i) => i.type === 'Carousel').length,
    inProduction: items.filter((i) => STATUS_META[i.status].group === 'production').length,
    scheduled: items.filter((i) => STATUS_META[i.status].group === 'scheduled').length,
    published: items.filter((i) => STATUS_META[i.status].group === 'published').length,
  }
}

/** Next N items that are not published, ordered by publish date. */
export function upcomingItems(items: ContentItem[], limit = 5): ContentItem[] {
  return [...items]
    .filter((i) => STATUS_META[i.status].group !== 'published')
    .sort((a, b) => a.publishDate.localeCompare(b.publishDate))
    .slice(0, limit)
}