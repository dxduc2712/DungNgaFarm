import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import Sidebar, { MobileTopBar } from './Sidebar'

export default function Layout() {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={handleLogout} />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileTopBar title={t('common.appName')} onMenuClick={() => setMenuOpen(true)} />
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
