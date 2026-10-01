import type { ContentStatus, ContentType, Priority, Stage } from '../types/content'

type StatusMeta = {
  stage: Stage
  /** Tailwind classes for the badge (light + dark). */
  badge: string
  /** Colour of the status dot. */
  dot: string
  /** Filter group used by the quick filters + content list. */
  group: 'idea' | 'production' | 'scheduled' | 'published'
}

export const STATUS_META: Record<ContentStatus, StatusMeta> = {
  Idea: {
    stage: 'Idea',
    badge: 'bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-white/5 dark:text-zinc-300 dark:ring-white/10',
    dot: 'bg-zinc-400 dark:bg-zinc-500',
    group: 'idea',
  },
  'Script Pending': {
    stage: 'Script',
    badge: 'bg-yellow-100 text-yellow-800 ring-yellow-200 dark:bg-yellow-400/10 dark:text-yellow-300 dark:ring-yellow-400/20',
    dot: 'bg-yellow-400',
    group: 'production',
  },
  'Script Done': {
    stage: 'Script',
    badge: 'bg-yellow-200 text-yellow-900 ring-yellow-300 dark:bg-yellow-400/15 dark:text-yellow-200 dark:ring-yellow-400/25',
    dot: 'bg-yellow-400',
    group: 'production',
  },
  'Shoot Pending': {
    stage: 'Shoot',
    badge: 'bg-orange-100 text-orange-800 ring-orange-200 dark:bg-orange-400/10 dark:text-orange-300 dark:ring-orange-400/20',
    dot: 'bg-orange-400',
    group: 'production',
  },
  'Shoot Completed': {
    stage: 'Shoot',
    badge: 'bg-orange-100 text-orange-800 ring-orange-200 dark:bg-orange-400/10 dark:text-orange-300 dark:ring-orange-400/20',
    dot: 'bg-orange-400',
    group: 'production',
  },
  Editing: {
    stage: 'Edit',
    badge: 'bg-orange-200 text-orange-900 ring-orange-300 dark:bg-orange-400/20 dark:text-orange-200 dark:ring-orange-400/30',
    dot: 'bg-orange-500',
    group: 'production',
  },
  'Edit Completed': {
    stage: 'Edit',
    badge: 'bg-orange-200 text-orange-900 ring-orange-300 dark:bg-orange-400/20 dark:text-orange-200 dark:ring-orange-400/30',
    dot: 'bg-orange-500',
    group: 'production',
  },
  Review: {
    stage: 'Review',
    badge: 'bg-violet-100 text-violet-800 ring-violet-200 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/20',
    dot: 'bg-violet-500',
    group: 'production',
  },
  Scheduled: {
    stage: 'Scheduled',
    badge: 'bg-blue-100 text-blue-800 ring-blue-200 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/20',
    dot: 'bg-blue-500',
    group: 'scheduled',
  },
  Published: {
    stage: 'Published',
    badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20',
    dot: 'bg-emerald-500',
    group: 'published',
  },
}

export const TYPE_META: Record<ContentType, { badge: string; short: string }> = {
  Reel: {
    badge: 'bg-ationic-yellow/20 text-yellow-900 ring-yellow-400/40 dark:bg-ationic-yellow/15 dark:text-ationic-yellow',
    short: 'REEL',
  },
  Carousel: {
    badge: 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20',
    short: 'CAROUSEL',
  },
  'Static Post': {
    badge: 'bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-white/5 dark:text-zinc-200 dark:ring-white/10',
    short: 'POST',
  },
  Story: {
    badge: 'bg-pink-100 text-pink-800 ring-pink-200 dark:bg-pink-400/10 dark:text-pink-300 dark:ring-pink-400/20',
    short: 'STORY',
  },
  'YouTube Video': {
    badge: 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/20',
    short: 'YOUTUBE',
  },
}

export const PRIORITY_META: Record<Priority, { badge: string; dot: string }> = {
  Low: {
    badge: 'text-zinc-500 dark:text-zinc-400',
    dot: 'bg-zinc-300 dark:bg-zinc-600',
  },
  Medium: {
    badge: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-400',
  },
  High: {
    badge: 'text-red-600 dark:text-red-400',
    dot: 'bg-red-500',
  },
}

/**
 * The status that "advances" a content item to the given stage when the user
 * clicks a stage on the pipeline.
 */
export const DEFAULT_STATUS_FOR_STAGE: Record<Stage, ContentStatus> = {
  Idea: 'Idea',
  Script: 'Script Pending',
  Shoot: 'Shoot Pending',
  Edit: 'Editing',
  Review: 'Review',
  Scheduled: 'Scheduled',
  Published: 'Published',
}