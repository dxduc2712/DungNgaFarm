import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  BookOpen,
  Droplets,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  X,
} from 'lucide-react'

interface SidebarProps {
  open: boolean
  onClose: () => void
  onLogout: () => void
}

export default function Sidebar({ open, onClose, onLogout }: SidebarProps) {
  const { t } = useTranslation()

  const links = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/ao', label: t('nav.ponds'), icon: Droplets },
    { to: '/kho-thuc-an', label: t('nav.feedInventory'), icon: Package },
    { to: '/canh-bao', label: t('nav.alerts'), icon: AlertTriangle },
  ]

  const content = (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-gray-100 px-4 py-5">
        <p className="text-lg font-bold text-teal-700">{t('common.appName')}</p>
        <p className="text-sm text-gray-500">{t('common.appSubtitle')}</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-3 text-base ${
                isActive
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        onClick={onLogout}
        className="m-3 flex items-center gap-3 rounded-lg px-3 py-3 text-left text-base text-gray-700 hover:bg-gray-50"
      >
        <LogOut className="h-5 w-5" />
        {t('nav.logout')}
      </button>
    </div>
  )

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-gray-200 md:block">{content}</aside>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-label={t('common.closeMenu')}
          />
          <div className="absolute left-0 top-0 h-full w-72 shadow-xl">{content}</div>
        </div>
      )}
    </>
  )
}

export function MobileTopBar({
  title,
  onMenuClick,
}: {
  title: string
  onMenuClick: () => void
}) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
      <button type="button" onClick={onMenuClick} className="rounded-lg p-2 hover:bg-gray-50">
        <Menu className="h-6 w-6 text-gray-700" />
      </button>
      <p className="font-medium text-gray-900">{title}</p>
      <BookOpen className="h-6 w-6 text-transparent" />
    </div>
  )
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-lg p-2 hover:bg-gray-50 md:hidden">
      <X className="h-5 w-5" />
    </button>
  )
}
