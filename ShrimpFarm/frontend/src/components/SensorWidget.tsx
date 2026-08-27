import type { ReactNode } from 'react'
import { Droplets, WifiOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { SensorReading } from '../api/endpoints'
import {
  expectsFirmwareSensors,
  formatDateTime,
  isFirmwareConnected,
  isOutOfRange,
} from '../utils/sensors'
import { useLatestReading } from '../hooks/useLatestReading'

interface SensorWidgetProps {
  pondId?: number
  pondName: string
  reading: SensorReading | null
  lastIotAt?: string | null
  recordMode?: string | null
  linked?: boolean
}

const cardClass =
  'min-w-0 rounded-2xl border border-border-soft bg-card p-5 shadow-[var(--shadow-card)]'

function CardShell({
  pondId,
  linked,
  children,
}: {
  pondId?: number
  linked?: boolean
  children: ReactNode
}) {
  if (pondId && linked) {
    return (
      <Link
        to={`/ao/${pondId}`}
        className={`${cardClass} block transition hover:shadow-[var(--shadow-card-hover)]`}
      >
        {children}
      </Link>
    )
  }
  return <div className={cardClass}>{children}</div>
}

function valueClass(type: 'ph' | 'salinity' | 'temperature', value: number) {
  return isOutOfRange(type, value)
    ? 'text-red-600 font-semibold'
    : 'font-semibold text-ink'
}

function resolveLastIotAt(
  liveReading: SensorReading | null,
  reading: SensorReading | null,
  lastIotAt: string | null | undefined,
): string | null {
  if (liveReading && liveReading.last_iot_at !== undefined) {
    return liveReading.last_iot_at
  }
  if (lastIotAt) return lastIotAt
  if (reading?.last_iot_at) return reading.last_iot_at
  const fallback = liveReading ?? reading
  if (fallback?.source === 'iot') return fallback.recorded_at
  return null
}

export default function SensorWidget({
  pondId,
  pondName,
  reading,
  lastIotAt,
  recordMode,
  linked,
}: SensorWidgetProps) {
  const { t } = useTranslation()
  const liveReading = useLatestReading(pondId)
  const display = liveReading ?? reading
  const isLinked = linked ?? Boolean(pondId)
  const firmwareExpected = expectsFirmwareSensors(recordMode)
  const firmwareConnected =
    firmwareExpected && isFirmwareConnected(resolveLastIotAt(liveReading, reading, lastIotAt))
  const lostConnection = firmwareExpected && !firmwareConnected

  const statusBadge = lostConnection ? (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
      <WifiOff className="h-3 w-3" aria-hidden />
      {t('sensor.lostConnection')}
    </span>
  ) : display ? (
    <span className="shrink-0 rounded-full bg-aqua-soft px-2.5 py-1 text-xs font-medium text-aqua-dark">
      {display.source === 'iot' ? t('sensor.sourceIot') : t('sensor.sourceManual')}
    </span>
  ) : null

  if (!display) {
    return (
      <CardShell pondId={pondId} linked={isLinked}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                lostConnection ? 'bg-red-50 text-red-700' : 'bg-forest-soft text-forest'
              }`}
            >
              {lostConnection ? (
                <WifiOff className="h-4 w-4" aria-hidden />
              ) : (
                <Droplets className="h-4 w-4" aria-hidden />
              )}
            </div>
            <h3 className="min-w-0 truncate font-semibold text-ink">{pondName}</h3>
          </div>
          {statusBadge}
        </div>
        <p className={`mt-4 text-sm ${lostConnection ? 'font-medium text-red-700' : 'text-ink-muted'}`}>
          {lostConnection ? t('sensor.lostConnection') : t('sensor.noData')}
        </p>
      </CardShell>
    )
  }

  const ph = Number(display.ph)
  const salinity = Number(display.salinity_ppt)
  const temperature = Number(display.temperature_c)

  return (
    <CardShell pondId={pondId} linked={isLinked}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              lostConnection ? 'bg-red-50 text-red-700' : 'bg-forest-soft text-forest'
            }`}
          >
            {lostConnection ? (
              <WifiOff className="h-4 w-4" aria-hidden />
            ) : (
              <Droplets className="h-4 w-4" aria-hidden />
            )}
          </div>
          <h3 className="truncate font-semibold text-ink">{pondName}</h3>
        </div>
        {statusBadge}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-sm sm:gap-3">
        <div className="min-w-0 rounded-xl bg-surface px-2 py-2.5 sm:px-3">
          <p className="truncate text-xs text-ink-muted">pH</p>
          <p className={`mt-1 ${valueClass('ph', ph)}`}>{ph.toFixed(1)}</p>
        </div>
        <div className="min-w-0 rounded-xl bg-surface px-2 py-2.5 sm:px-3">
          <p className="truncate text-xs text-ink-muted">{t('sensor.salinity')}</p>
          <p className={`mt-1 ${valueClass('salinity', salinity)}`}>{salinity.toFixed(1)} ppt</p>
        </div>
        <div className="min-w-0 rounded-xl bg-surface px-2 py-2.5 sm:px-3">
          <p className="truncate text-xs text-ink-muted">{t('sensor.temperature')}</p>
          <p className={`mt-1 ${valueClass('temperature', temperature)}`}>
            {temperature.toFixed(1)} °C
          </p>
        </div>
      </div>
      {lostConnection ? (
        <p className="mt-3 text-xs text-ink-muted">
          {t('sensor.lastUpdated', { time: formatDateTime(display.recorded_at) })}
        </p>
      ) : null}
    </CardShell>
  )
}
