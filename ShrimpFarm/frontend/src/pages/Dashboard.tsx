import { useEffect, useState } from 'react'
import { AlertTriangle, Droplets, Sprout } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import AlertBanner from '../components/AlertBanner'
import SensorWidget from '../components/SensorWidget'
import StatCard from '../components/StatCard'
import type { DashboardData } from '../api/endpoints'
import { endpoints } from '../api/endpoints'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { t } = useTranslation()
  const { displayName } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = (showSpinner = false) => {
      if (showSpinner) setLoading(true)
      endpoints
        .dashboard()
        .then((response) => {
          if (!cancelled) setData(response.data)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }

    load(true)
    const timer = window.setInterval(() => load(false), 4000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  if (loading) {
    return <p className="text-ink-muted">{t('common.loading')}</p>
  }

  if (!data) {
    return <p className="text-ink-muted">{t('dashboard.loadError')}</p>
  }

  const greetingName = displayName?.trim()

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-aqua-dark">
            {greetingName
              ? t('dashboard.greeting', { name: greetingName })
              : t('dashboard.greetingFallback')}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink md:text-3xl">
            {t('dashboard.title')}
          </h1>
          <p className="mt-1 text-ink-muted">{t('dashboard.greetingSubtitle')}</p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title={t('dashboard.totalPonds')} value={data.total_ponds} icon={<Droplets />} />
        <StatCard title={t('dashboard.activeCrops')} value={data.active_crops} icon={<Sprout />} />
        <StatCard
          title={t('dashboard.unresolvedAlerts')}
          value={data.unresolved_alerts}
          icon={<AlertTriangle />}
        />
      </div>

      <AlertBanner alerts={data.recent_alerts} />

      <section>
        <h2 className="mb-4 text-lg font-semibold text-ink">{t('dashboard.environmentMetrics')}</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.ponds.map((pond) => (
            <SensorWidget
              key={pond.id}
              pondId={pond.id}
              pondName={pond.name}
              reading={pond.latest_reading}
            />
          ))}
        </div>
      </section>

      {data.low_stock.length > 0 && (
        <section className="rounded-2xl border border-border-soft bg-card p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-lg font-semibold text-ink">{t('dashboard.lowStockTitle')}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.low_stock.map((item) => (
              <li
                key={item.id}
                className="flex justify-between rounded-xl bg-red-50/80 px-3 py-2 text-red-700"
              >
                <span className="font-medium">{item.feed_name}</span>
                <span>{t('common.remainingKg', { quantity: item.quantity })}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
