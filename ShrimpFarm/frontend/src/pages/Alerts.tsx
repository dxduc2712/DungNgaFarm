import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SensorAlert } from '../api/endpoints'
import { endpoints } from '../api/endpoints'
import { formatDateTime } from '../utils/sensors'

export default function Alerts() {
  const { t } = useTranslation()
  const [alerts, setAlerts] = useState<SensorAlert[]>([])
  const [loading, setLoading] = useState(true)

  const loadAlerts = () => {
    endpoints.sensorAlerts({ resolved: false }).then(setAlerts).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  const resolve = async (id: number) => {
    await endpoints.resolveAlert(id)
    loadAlerts()
  }

  if (loading) return <p className="text-ink-muted">{t('common.loading')}</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{t('alerts.title')}</h1>
        <p className="mt-1 text-ink-muted">{t('alerts.subtitle')}</p>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-2xl border border-border-soft bg-card p-6 text-center shadow-[var(--shadow-card)]">
          <p className="text-ink-muted">{t('alerts.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-2xl border border-border-soft bg-card p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words font-semibold text-ink">{alert.pond_name}</p>
                  <p className="mt-1 break-words text-sm text-ink-muted">{alert.message}</p>
                  <p className="mt-2 text-xs text-ink-faint">
                    {formatDateTime(alert.created_at)} — {alert.crop_code}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => resolve(alert.id)}
                  className="rounded-xl bg-forest px-3 py-2 text-sm font-semibold text-white transition hover:bg-forest-deep"
                >
                  {t('alerts.resolve')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
