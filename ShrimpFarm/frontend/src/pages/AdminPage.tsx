import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'

const adminPath = import.meta.env.VITE_DJANGO_ADMIN_PATH || '/django-admin/'

function isSpaPath(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname === '/admin' ||
    pathname.startsWith('/ao') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/canh-bao') ||
    pathname.startsWith('/kho-thuc-an') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')
  )
}

export default function AdminPage() {
  const { t } = useTranslation()
  const { sessionReady } = useAuth()
  const navigate = useNavigate()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleIframeLoad = () => {
    try {
      const win = iframeRef.current?.contentWindow
      const loc = win?.location
      const iframePath = loc?.pathname ?? ''
      const looksLikeSpa = isSpaPath(iframePath) && !iframePath.startsWith('/django-admin')

      // Nested SPA inside iframe caused duplicate sidebars — break out to parent shell.
      if (looksLikeSpa && iframePath !== '/admin') {
        navigate(iframePath + (loc?.search || '') + (loc?.hash || ''), { replace: true })
        if (iframeRef.current) {
          iframeRef.current.src = adminPath
        }
      } else if (looksLikeSpa && iframePath === '/admin') {
        if (iframeRef.current) {
          iframeRef.current.src = adminPath
        }
      }
    } catch {
      // Cross-origin Django admin — expected in some deployments.
    }
  }

  if (!sessionReady) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center">
        <p className="text-ink-muted">{t('admin.loading')}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border-soft bg-card shadow-[var(--shadow-card)]">
      <iframe
        ref={iframeRef}
        title={t('nav.admin')}
        src={adminPath}
        onLoad={handleIframeLoad}
        className="min-h-[calc(100vh-8rem)] w-full flex-1 rounded-2xl bg-white"
      />
    </div>
  )
}
