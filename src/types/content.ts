export const CONTENT_TYPES = ['Reel', 'Carousel', 'Static Post', 'Story', 'YouTube Video'] as const
export type ContentType = (typeof CONTENT_TYPES)[number]

export const PLATFORMS = ['Instagram', 'Facebook', 'YouTube', 'LinkedIn'] as const
export type Platform = (typeof PLATFORMS)[number]

export const PILLARS = [
  'Education',
  'Authority',
  'Lead Generation',
  'Case Study',
  'Founder',
  'Engagement',
  'Promotional',
] as const
export type ContentPillar = (typeof PILLARS)[number]

export const PRIORITIES = ['Low', 'Medium', 'High'] as const
export type Priority = (typeof PRIORITIES)[number]

/**
 * The 7 production stages shown in the pipeline.
 * A detailed `status` always maps to exactly one stage.
 */
export const STAGES = ['Idea', 'Script', 'Shoot', 'Edit', 'Review', 'Scheduled', 'Published'] as const
export type Stage = (typeof STAGES)[number]

export const STATUSES = [
  'Idea',
  'Script Pending',
  'Script Done',
  'Shoot Pending',
  'Shoot Completed',
  'Editing',
  'Edit Completed',
  'Review',
  'Scheduled',
  'Published',
] as const
export type ContentStatus = (typeof STATUSES)[number]

export type Reference = {
  id: string
  url: string
  label: string
}

export type ContentItem = {
  id: string
  title: string
  type: ContentType
  platform: Platform
  /** Stored as `YYYY-MM-DD` so it sorts and compares as plain text. */
  publishDate: string
  pillar: ContentPillar
  priority: Priority
  status: ContentStatus

  hook: string
  idea: string
  script: string
  caption: string
  cta: string
  hashtags: string
  notes: string
  references: Reference[]
  carouselSlides: string[]

  createdAt: number
  updatedAt: number
  createdBy: string
  createdByName: string
  updatedBy: string
  updatedByName: string
}

/** The fields the "add content" form collects (before it becomes a ContentItem). */
export type NewContentInput = {
  title: string
  type: ContentType
  platform: Platform
  publishDate: string
  pillar: ContentPillar
  priority: Priority
  hook: string
  cta: string
  template: TemplateKey | null
}

export const CAROUSEL_SLIDE_COUNT = 7

/** Template scaffolds available when creating content. */
export const TEMPLATE_KEYS = ['Reel', 'Carousel', 'Static Post', 'Story', 'YouTube Video'] as const
export type TemplateKey = (typeof TEMPLATE_KEYS)[number]