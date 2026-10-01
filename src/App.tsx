import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import { ContentProvider } from './hooks/useContent'
import { useContentSubscription } from './hooks/useContent'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ContentListPage from './pages/ContentListPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ContentWorkspacePage from './pages/ContentWorkspacePage'
import { useAuth } from './context/AuthContext'
import { Spinner } from './components/ui'

function FullPageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex h-full min-h-screen items-center justify-center gap-3 bg-[#F7F7F8] text-sm text-zinc-500 dark:bg-[#0B0B0C] dark:text-zinc-400">
      <Spinner />
      {label}
    </div>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <FullPageLoader label="Checking session…" />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const content = useContentSubscription()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <ContentProvider value={content}>
              <AppLayout />
            </ContentProvider>
          </RequireAuth>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/calendar" element={<DashboardPage />} />
        <Route path="/content" element={<ContentListPage />} />
        <Route path="/content/:id" element={<ContentWorkspacePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}