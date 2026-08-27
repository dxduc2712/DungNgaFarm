import type { SensorAlert } from '../api/endpoints'
import { AlertTriangle } from 'lucide-react'
import { formatDateTime } from '../utils/sensors'

interface AlertBannerProps {
  alerts: SensorAlert[]
}

export default function AlertBanner({ alerts }: AlertBannerProps) {
  if (alerts.length === 0) return null

  return (
    <div className="space-y-2">
      {alerts.slice(0, 3).map((alert) => (
        <div
          key={alert.id}
          className="flex items-start gap-3 rounded-2xl border border-red-200/80 bg-red-50/90 p-4 text-sm text-red-800 shadow-[var(--shadow-card)]"
        >
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold">{alert.pond_name}</p>
            <p className="mt-0.5 text-red-800/90">{alert.message}</p>
            <p className="mt-1.5 text-xs text-red-600/80">{formatDateTime(alert.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
