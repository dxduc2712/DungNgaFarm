import { Droplets } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { SensorReading } from '../api/endpoints'
import { isOutOfRange } from '../utils/sensors'

interface SensorWidgetProps {
  pondName: string
  reading: SensorReading | null
}

function valueClass(type: 'ph' | 'salinity' | 'temperature', value: number) {
  return isOutOfRange(type, value)
    ? 'text-red-600 font-semibold'
    : 'font-semibold text-ink'
}

export default function SensorWidget({ pondName, reading }: SensorWidgetProps) {
  const { t } = useTranslation()

  if (!reading) {
    return (
      <div className="rounded-2xl border border-border-soft bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-soft text-forest">
            <Droplets className="h-4 w-4" aria-hidden />
          </div>
          <h3 className="font-semibold text-ink">{pondName}</h3>
        </div>
        <p className="mt-4 text-sm text-ink-muted">{t('sensor.noData')}</p>
      </div>
    )
  }

  const ph = Number(reading.ph)
  const salinity = Number(reading.salinity_ppt)
  const temperature = Number(reading.temperature_c)
  const sourceLabel =
    reading.source === 'iot' ? t('sensor.sourceIot') : t('sensor.sourceManual')

  return (
    <div className="rounded-2xl border border-border-soft bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-soft text-forest">
            <Droplets className="h-4 w-4" aria-hidden />
          </div>
          <h3 className="truncate font-semibold text-ink">{pondName}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-aqua-soft px-2.5 py-1 text-xs font-medium text-aqua-dark">
          {sourceLabel}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl bg-surface px-3 py-2.5">
          <p className="text-xs text-ink-muted">pH</p>
          <p className={`mt-1 ${valueClass('ph', ph)}`}>{ph.toFixed(1)}</p>
        </div>
        <div className="rounded-xl bg-surface px-3 py-2.5">
          <p className="text-xs text-ink-muted">{t('sensor.salinity')}</p>
          <p className={`mt-1 ${valueClass('salinity', salinity)}`}>{salinity.toFixed(1)} ppt</p>
        </div>
        <div className="rounded-xl bg-surface px-3 py-2.5">
          <p className="text-xs text-ink-muted">{t('sensor.temperature')}</p>
          <p className={`mt-1 ${valueClass('temperature', temperature)}`}>
            {temperature.toFixed(1)} °C
          </p>
        </div>
      </div>
    </div>
  )
}
