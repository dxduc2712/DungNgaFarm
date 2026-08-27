import type { ReactNode } from 'react'
import { Droplets } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface AuthLayoutProps {
  /** Page-specific supporting line under the brand. */
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export default function AuthLayout({ subtitle, children, footer }: AuthLayoutProps) {
  const { t } = useTranslation()

  return (
    <div className="relative flex min-h-screen items-stretch justify-center overflow-hidden">
      {/* Atmospheric aquaculture panel — brand-forward when no pond photo asset */}
      <div className="auth-atmosphere relative hidden w-[42%] min-w-[280px] max-w-xl flex-col justify-between p-10 text-white lg:flex">
        <div className="relative z-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
            <Droplets className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="mt-8 text-3xl font-bold tracking-tight">{t('common.appName')}</h1>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/75">
            {t('common.appSubtitle')}
          </p>
        </div>
        <p className="relative z-10 text-xs text-white/50">{t('auth.atmosphereCaption')}</p>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center bg-surface px-4 py-10 sm:px-8 sm:py-14">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-forest-soft/80 to-transparent lg:hidden"
          aria-hidden
        />

        <div className="relative w-full max-w-md">
          <header className="mb-8 text-center lg:text-left">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-forest text-white shadow-[var(--shadow-card)] lg:hidden">
              <Droplets className="h-6 w-6" aria-hidden />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-forest lg:hidden">
              {t('common.appName')}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{subtitle}</p>
          </header>

          <div className="rounded-2xl border border-border-soft bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
            {children}
          </div>

          {footer ? (
            <div className="mt-6 space-y-2 text-center text-sm text-ink-muted lg:text-left">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
