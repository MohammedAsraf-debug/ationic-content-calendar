import { useCallback, useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from './useContent'

export type SaveState = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

/**
 * Keeps a local draft of a Firestore document, debounces writes and merges
 * remote (realtime) changes whenever the user is not actively editing.
 *
 * Only the fields that actually changed are written, so two people editing the
 * same item never overwrite each other's sections.
 */
export function useContentDraft<T extends { id: string; updatedAt: number }>(
  live: T | undefined,
  onSave: (id: string, patch: Partial<T>) => Promise<void>,
  savableFields: readonly (keyof T)[],
) {
  const [draft, setDraft] = useState<T | null>(live ?? null)
  const draftRef = useRef<T | null>(live ?? null)
  const pending = useRef<Set<string>>(new Set())
  const dirty = useRef(false)
  const [state, setState] = useState<SaveState>('idle')
  const [savedAt, setSavedAt] = useState<number | null>(null)

  // Adopt realtime updates when the user is idle.
  useEffect(() => {
    if (!live) {
      // The document was deleted (possibly by the other teammate): drop the
      // local draft so the page can redirect away from a dead workspace.
      if (draftRef.current) {
        draftRef.current = null
        setDraft(null)
      }
      return
    }
    if (dirty.current) return
    if (draftRef.current && draftRef.current.id === live.id && draftRef.current.updatedAt === live.updatedAt) {
      return
    }
    draftRef.current = live
    setDraft(live)
    if (pending.current.size === 0) setState('idle')
  }, [live])

  const flush = useCallback(
    async (explicitFields?: string[]) => {
      const current = draftRef.current
      if (!current) return
      const keys = (explicitFields ?? Array.from(pending.current)).filter((key) =>
        savableFields.includes(key as keyof T),
      )
      if (keys.length === 0) return
      keys.forEach((key) => pending.current.delete(key))

      const patch: Record<string, unknown> = {}
      keys.forEach((key) => {
        patch[key] = current[key as keyof T]
      })

      setState('saving')
      try {
        await onSave(current.id, patch as Partial<T>)
        dirty.current = pending.current.size > 0
        setSavedAt(Date.now())
        setState(dirty.current ? 'pending' : 'saved')
      } catch {
        keys.forEach((key) => pending.current.add(key))
        dirty.current = true
        setState('error')
      }
    },
    [onSave, savableFields],
  )

  const flushDebounced = useDebouncedCallback(() => {
    void flush()
  }, 700)

  const update = useCallback(
    (changes: Partial<T>) => {
      const current = draftRef.current
      if (!current) return
      const next = { ...current, ...changes }
      draftRef.current = next
      setDraft(next)
      Object.keys(changes).forEach((key) => pending.current.add(key))
      dirty.current = true
      setState('pending')
      flushDebounced()
    },
    [flushDebounced],
  )

  /** Write a field immediately (used by status buttons). */
  const updateNow = useCallback(
    (changes: Partial<T>) => {
      const current = draftRef.current
      if (!current) return
      const next = { ...current, ...changes }
      draftRef.current = next
      setDraft(next)
      Object.keys(changes).forEach((key) => pending.current.add(key))
      dirty.current = true
      void flush(Object.keys(changes))
    },
    [flush],
  )

  return { draft, update, updateNow, state, savedAt }
}