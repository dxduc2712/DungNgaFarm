import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import Sidebar, { MobileTopBar } from './Sidebar'

export default function Layout() {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdminPage = location.pathname === '/admin'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Same shell for every route — avoid width jump when opening /admin */}
      <div id="app-shell" className="mx-auto flex min-h-screen max-w-7xl">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={handleLogout} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <MobileTopBar title={t('common.appName')} onMenuClick={() => setMenuOpen(true)} />
          <main
            className={`min-h-0 flex-1 p-4 md:p-6 lg:p-8 ${
              isAdminPage ? 'flex flex-col overflow-hidden' : ''
            }`}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
