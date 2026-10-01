import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import AddContentModal from '../components/AddContentModal'
import ToastHost, { type ToastItem } from '../components/ToastHost'

export type ToastOptions = {
  tone?: 'success' | 'error' | 'info'
  actionLabel?: string
  onAction?: () => void
}

type UIContextValue = {
  /** Opens the "Add content" modal, optionally pre-filled with a publish date. */
  openAddContent: (date?: string) => void
  notify: (message: string, options?: ToastOptions) => void
}

const UIContext = createContext<UIContextValue | null>(null)

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate()
  const [addOpen, setAddOpen] = useState(false)
  const [addDate, setAddDate] = useState<string | undefined>(undefined)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const openAddContent = useCallback((date?: string) => {
    setAddDate(date)
    setAddOpen(true)
  }, [])

  const notify = useCallback((message: string, options: ToastOptions = {}) => {
    counter.current += 1
    const id = counter.current
    setToasts((current) => [...current, { id, message, ...options }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id))
    }, 4200)
  }, [])

  const value = useMemo(() => ({ openAddContent, notify }), [openAddContent, notify])

  return (
    <UIContext.Provider value={value}>
      {children}
      <AddContentModal
        open={addOpen}
        defaultDate={addDate}
        onClose={() => setAddOpen(false)}
        onCreated={(id) => {
          setAddOpen(false)
          notify('Content added to the calendar', {
            tone: 'success',
            actionLabel: 'Open',
            onAction: () => void navigate(`/content/${id}`),
          })
        }}
      />
      <ToastHost
        toasts={toasts}
        onDismiss={(id) => setToasts((current) => current.filter((t) => t.id !== id))}
      />
    </UIContext.Provider>
  )
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>')
  return ctx
}