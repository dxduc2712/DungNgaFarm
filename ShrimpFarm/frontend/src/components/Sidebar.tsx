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
  Shield,
  UserRound,
  X,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface SidebarProps {
  open: boolean
  onClose: () => void
  onLogout: () => void
}

export default function Sidebar({ open, onClose, onLogout }: SidebarProps) {
  const { t } = useTranslation()
  const { isAdmin, displayName, user, initials } = useAuth()

  const links = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/ao', label: t('nav.ponds'), icon: Droplets },
    { to: '/kho-thuc-an', label: t('nav.feedInventory'), icon: Package },
    { to: '/canh-bao', label: t('nav.alerts'), icon: AlertTriangle },
    ...(isAdmin ? [{ to: '/admin', label: t('nav.admin'), icon: Shield }] : []),
  ]

  const content = (
    <div className="flex h-full flex-col bg-card">
      <div className="border-b border-border-soft px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-forest text-white shadow-sm">
            <Droplets className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight text-forest">
              {t('common.appName')}
            </p>
            <p className="truncate text-xs text-ink-muted">{t('common.appSubtitle')}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-forest-soft text-forest shadow-sm ring-1 ring-forest/10'
                  : 'text-ink-muted hover:bg-surface hover:text-ink'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0 opacity-80" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border-soft p-3">
        <div className="mb-2 flex items-center gap-3 rounded-2xl bg-surface px-3 py-2.5 ring-1 ring-border-soft">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-aqua-soft text-sm font-semibold tracking-wide text-forest ring-2 ring-white"
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              {displayName || t('nav.account')}
            </p>
            {user?.email && (
              <p className="truncate text-xs text-ink-muted">{user.email}</p>
            )}
          </div>
        </div>
        <div className="space-y-0.5">
          <NavLink
            to="/settings/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-forest-soft text-forest'
                  : 'text-ink-muted hover:bg-surface hover:text-ink'
              }`
            }
          >
            <UserRound className="h-4 w-4 shrink-0 opacity-80" />
            {t('nav.profile')}
          </NavLink>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink-muted transition hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4 shrink-0 opacity-80" />
            {t('nav.logout')}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-border-soft md:block">{content}</aside>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-forest-deep/40 backdrop-blur-[2px]"
            onClick={onClose}
            aria-label={t('common.closeMenu')}
          />
          <div className="absolute left-0 top-0 h-full w-72 overflow-hidden rounded-r-2xl shadow-[var(--shadow-card-hover)]">
            {content}
          </div>
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
  const { t } = useTranslation()

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border-soft bg-card/95 px-4 py-3 backdrop-blur-sm md:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        className="shrink-0 rounded-xl p-2 text-ink transition hover:bg-surface"
        aria-label={t('common.openMenu')}
      >
        <Menu className="h-6 w-6" />
      </button>
      <p className="min-w-0 truncate text-center font-semibold text-forest">{title}</p>
      <BookOpen className="h-6 w-6 shrink-0 text-transparent" aria-hidden />
    </div>
  )
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl p-2 text-ink transition hover:bg-surface md:hidden"
    >
      <X className="h-5 w-5" />
    </button>
  )
}
