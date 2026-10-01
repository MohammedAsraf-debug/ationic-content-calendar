import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import { applyTemplate, newReference } from './templates'
import type {
  ContentItem,
  ContentStatus,
  ContentType,
  NewContentInput,
  Reference,
} from '../types/content'
import { CAROUSEL_SLIDE_COUNT } from '../types/content'

export const CONTENT_COLLECTION = 'content'

type Actor = { uid: string; name: string }

/** Firestore omits empty arrays / undefined values on write; normalise on read. */
function normalise(data: DocumentData, id: string): ContentItem {
  const slides = Array.isArray(data.carouselSlides) ? data.carouselSlides : []
  return {
    id,
    title: data.title ?? '',
    type: (data.type ?? 'Reel') as ContentType,
    platform: data.platform ?? 'Instagram',
    publishDate: data.publishDate ?? '',
    pillar: data.pillar ?? 'Education',
    priority: data.priority ?? 'Medium',
    status: (data.status ?? 'Idea') as ContentStatus,
    hook: data.hook ?? '',
    idea: data.idea ?? '',
    script: data.script ?? '',
    caption: data.caption ?? '',
    cta: data.cta ?? '',
    hashtags: data.hashtags ?? '',
    notes: data.notes ?? '',
    references: (Array.isArray(data.references) ? data.references : []).map((ref: Partial<Reference>) => ({
      id: ref.id ?? Math.random().toString(36).slice(2, 10),
      url: ref.url ?? '',
      label: ref.label ?? '',
    })),
    carouselSlides: Array.from({ length: CAROUSEL_SLIDE_COUNT }, (_, i) => slides[i] ?? ''),
    createdAt: data.createdAt ?? Date.now(),
    updatedAt: data.updatedAt ?? Date.now(),
    createdBy: data.createdBy ?? '',
    createdByName: data.createdByName ?? '',
    updatedBy: data.updatedBy ?? '',
    updatedByName: data.updatedByName ?? '',
  }
}

/**
 * Realtime listener over the whole `content` collection.
 * Two users + a small calendar means one shared listener is the simplest and
 * fastest option, and every view stays in sync instantly.
 */
export function subscribeToContent(
  onData: (items: ContentItem[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(collection(db, CONTENT_COLLECTION), orderBy('publishDate', 'asc'))
  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map((doc) => normalise(doc.data(), doc.id)))
    },
    (error) => onError(error),
  )
}

export async function createContent(input: NewContentInput, actor: Actor): Promise<string> {
  const template = input.template ? applyTemplate(input.template) : null
  const now = Date.now()
  const payload: Record<string, unknown> = {
    title: input.title.trim(),
    type: input.template ?? input.type,
    platform: input.platform,
    publishDate: input.publishDate,
    pillar: input.pillar,
    priority: input.priority,
    status: 'Idea',
    hook: input.hook ?? template?.hook ?? '',
    idea: template?.idea ?? '',
    script: template?.script ?? '',
    caption: template?.caption ?? '',
    cta: input.cta ?? template?.cta ?? '',
    hashtags: template?.hashtags ?? '',
    notes: '',
    references: [newReference()],
    carouselSlides: template?.carouselSlides ?? Array.from({ length: CAROUSEL_SLIDE_COUNT }, () => ''),
    createdAt: now,
    updatedAt: now,
    createdBy: actor.uid,
    createdByName: actor.name,
    updatedBy: actor.uid,
    updatedByName: actor.name,
  }
  const created = await addDoc(collection(db, CONTENT_COLLECTION), payload)
  return created.id
}

export type ContentPatch = Partial<
  Pick<
    ContentItem,
    | 'title'
    | 'type'
    | 'platform'
    | 'publishDate'
    | 'pillar'
    | 'priority'
    | 'status'
    | 'hook'
    | 'idea'
    | 'script'
    | 'caption'
    | 'cta'
    | 'hashtags'
    | 'notes'
    | 'references'
    | 'carouselSlides'
  >
>

export async function updateContent(
  id: string,
  patch: ContentPatch,
  actor: Actor,
): Promise<void> {
  await updateDoc(doc(db, CONTENT_COLLECTION, id), {
    ...patch,
    updatedAt: Date.now(),
    updatedBy: actor.uid,
    updatedByName: actor.name,
  })
}

export async function deleteContent(id: string): Promise<void> {
  await deleteDoc(doc(db, CONTENT_COLLECTION, id))
}

/** Duplicates a content item, appending `#n` to the title. */
export async function duplicateContent(
  item: ContentItem,
  actor: Actor,
  existingTitles: string[] = [],
): Promise<string> {
  const now = Date.now()
  const payload: Record<string, unknown> = {
    title: nextDuplicateTitle(item.title, existingTitles),
    type: item.type,
    platform: item.platform,
    publishDate: item.publishDate,
    pillar: item.pillar,
    priority: item.priority,
    status: 'Idea',
    hook: item.hook,
    idea: item.idea,
    script: item.script,
    caption: item.caption,
    cta: item.cta,
    hashtags: item.hashtags,
    notes: item.notes,
    references: item.references,
    carouselSlides: item.carouselSlides,
    createdAt: now,
    updatedAt: now,
    createdBy: actor.uid,
    createdByName: actor.name,
    updatedBy: actor.uid,
    updatedByName: actor.name,
  }
  const created = await addDoc(collection(db, CONTENT_COLLECTION), payload)
  return created.id
}

export function nextDuplicateTitle(originalTitle: string, allTitles: string[]): string {
  const base = originalTitle.replace(/\s*#\d+\s*$/, '').trim()
  const taken = new Set(allTitles.map((t) => t.trim().toLowerCase()))
  let n = 2
  let candidate = `${base} #${n}`
  while (taken.has(candidate.toLowerCase())) {
    n += 1
    candidate = `${base} #${n}`
  }
  return candidate
}