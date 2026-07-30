import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { isAuthenticated } from './api/client'
import Alerts from './pages/Alerts'
import Dashboard from './pages/Dashboard'
import FeedInventory from './pages/FeedInventory'
import FeedingLog from './pages/FeedingLog'
import Login from './pages/Login'
import PondDetail from './pages/PondDetail'
import PondList from './pages/PondList'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
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
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
