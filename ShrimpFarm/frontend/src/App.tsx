import { Navigate, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from './components/Layout'
import { useAuth } from './hooks/useAuth'
import AdminPage from './pages/AdminPage'
import Alerts from './pages/Alerts'
import Dashboard from './pages/Dashboard'
import FeedInventory from './pages/FeedInventory'
import FeedingLog from './pages/FeedingLog'
import ForgotPassword from './pages/ForgotPassword'
import Login from './pages/Login'
import PondDetail from './pages/PondDetail'
import PondList from './pages/PondList'
import ProfileSettings from './pages/ProfileSettings'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'

function LoadingScreen() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <p className="text-ink-muted">{t('common.loading')}</p>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authenticated, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading, sessionReady } = useAuth()

  if (loading || (isAdmin && !sessionReady)) {
    return <LoadingScreen />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/ao" element={<PondList />} />
        <Route path="/ao/:id" element={<PondDetail />} />
        <Route path="/ao/:id/nhat-ky" element={<FeedingLog />} />
        <Route path="/kho-thuc-an" element={<FeedInventory />} />
        <Route path="/canh-bao" element={<Alerts />} />
        <Route path="/settings/profile" element={<ProfileSettings />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
