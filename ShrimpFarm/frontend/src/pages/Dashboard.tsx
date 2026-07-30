import { useEffect, useState } from 'react'
import { AlertTriangle, Droplets, Sprout } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import AlertBanner from '../components/AlertBanner'
import SensorWidget from '../components/SensorWidget'
import StatCard from '../components/StatCard'
import type { DashboardData } from '../api/endpoints'
import { endpoints } from '../api/endpoints'

export default function Dashboard() {
  const { t } = useTranslation()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    endpoints
      .dashboard()
      .then((response) => setData(response.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="text-gray-500">{t('common.loading')}</p>
  }

  if (!data) {
    return <p className="text-gray-500">{t('dashboard.loadError')}</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-gray-500">{t('dashboard.subtitle')}</p>
      </div>

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
        <h2 className="mb-3 text-lg font-semibold text-gray-900">{t('dashboard.environmentMetrics')}</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.ponds.map((pond) => (
            <SensorWidget
              key={pond.id}
              pondName={pond.name}
              reading={pond.latest_reading}
            />
          ))}
        </div>
      </section>

      {data.low_stock.length > 0 && (
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.lowStockTitle')}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.low_stock.map((item) => (
              <li key={item.id} className="flex justify-between text-red-700">
                <span>{item.feed_name}</span>
                <span>{t('common.remainingKg', { quantity: item.quantity })}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
