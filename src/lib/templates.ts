import type { ContentType, Reference, TemplateKey } from '../types/content'
import { CAROUSEL_SLIDE_COUNT } from '../types/content'

export type TemplateResult = {
  hook: string
  idea: string
  script: string
  caption: string
  cta: string
  hashtags: string
  carouselSlides: string[]
}

/**
 * Simple, opinionated scaffolds. Everything is a plain-text outline that the
 * team rewrites inside the workspace — this is intentionally not a rich text
 * editor.
 */
export const TEMPLATES: Record<TemplateKey, () => TemplateResult> = {
  Reel: () => ({
    hook: '',
    idea: 'PROBLEM:\n\nINSIGHT:\n\nOUTCOME:',
    script: 'BODY:\n\n1. \n2. \n3. \n\nKEY LINE:',
    caption: '',
    cta: '',
    hashtags: '#ationic #digitalmarketing #contentmarketing',
    carouselSlides: emptySlides(),
  }),
  Carousel: () => ({
    hook: '',
    idea: 'GOAL:\n\nAUDIENCE:\n\nCORE MESSAGE:',
    script: '',
    caption: '',
    cta: '',
    hashtags: '#ationic #digitalmarketing #carousel',
    carouselSlides: [
      'SLIDE 1 — HOOK\n\n',
      'SLIDE 2 — PROBLEM\n\n',
      'SLIDE 3 — EXPLANATION\n\n',
      'SLIDE 4 — SOLUTION\n\n',
      'SLIDE 5 — EXAMPLE\n\n',
      'SLIDE 6 — TAKEAWAY\n\n',
      'SLIDE 7 — CTA\n\n',
    ],
  }),
  'Static Post': () => ({
    hook: '',
    idea: 'MESSAGE:\n\nPROOF:\n\nFORMAT:',
    script: '',
    caption: '',
    cta: '',
    hashtags: '#ationic #digitalmarketing',
    carouselSlides: emptySlides(),
  }),
  Story: () => ({
    hook: '',
    idea: 'STORY ARC:\n\nFRAME 1:\n\nFRAME 2:\n\nFRAME 3:',
    script: '',
    caption: '',
    cta: 'SWIPE UP',
    hashtags: '',
    carouselSlides: emptySlides(),
  }),
  'YouTube Video': () => ({
    hook: '',
    idea: 'TITLE OPTIONS:\n\nTHUMBNAIL:\n\nRUNTIME:',
    script: 'COLD OPEN:\n\nSECTION 1:\n\nSECTION 2:\n\nSECTION 3:\n\nOUTRO + CTA:',
    caption: '',
    cta: '',
    hashtags: '',
    carouselSlides: emptySlides(),
  }),
}

function emptySlides(): string[] {
  return Array.from({ length: CAROUSEL_SLIDE_COUNT }, () => '')
}

export function applyTemplate(type: ContentType): TemplateResult {
  return TEMPLATES[type]()
}

export function newReference(): Reference {
  return { id: Math.random().toString(36).slice(2, 10), url: '', label: '' }
}