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

  if (loading) return <p className="text-gray-500">{t('common.loading')}</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('alerts.title')}</h1>
        <p className="text-gray-500">{t('alerts.subtitle')}</p>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="text-gray-500">{t('alerts.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{alert.pond_name}</p>
                  <p className="mt-1 text-sm text-gray-700">{alert.message}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {formatDateTime(alert.created_at)} — {alert.crop_code}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => resolve(alert.id)}
                  className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
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
