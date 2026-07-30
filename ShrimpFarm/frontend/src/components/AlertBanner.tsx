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
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">{alert.pond_name}</p>
            <p>{alert.message}</p>
            <p className="mt-1 text-xs text-red-600">{formatDateTime(alert.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
