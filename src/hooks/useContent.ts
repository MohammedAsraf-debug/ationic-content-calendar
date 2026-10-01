import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { subscribeToContent } from '../lib/contentService'
import type { ContentItem } from '../types/content'
import { useAuth } from '../context/AuthContext'

export type ContentState = {
  items: ContentItem[]
  loading: boolean
  error: string | null
  byId: Map<string, ContentItem>
}

const ContentContext = createContext<ContentState | null>(null)

export const ContentProvider = ContentContext.Provider

export function useContent(): ContentState {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>')
  return ctx
}

/**
 * Mounted once in <App />: a single realtime Firestore subscription shared by
 * the calendar, list, analytics and workspace pages.
 */
export function useContentSubscription(): ContentState {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      // Keep `loading` true so no view mistakes "no data yet" for "deleted".
      setItems([])
      return
    }
    setLoading(true)
    const unsubscribe = subscribeToContent(
      (next) => {
        setItems(next)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(
          (err as { code?: string }).code === 'permission-denied'
            ? 'Access denied by Firestore rules. Make sure you are signed in and the rules are published.'
            : err.message,
        )
        setLoading(false)
      },
    )
    return unsubscribe
  }, [user])

  const byId = useMemo(() => new Map(items.map((item) => [item.id, item])), [items])

  return { items, loading, error, byId }
}

/** Debounces a rapidly-changing callback (used for autosave). */
export function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef(fn)
  latest.current = fn

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  return useCallback(
    (...args: A) => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => latest.current(...args), delay)
    },
    [delay],
  )
}