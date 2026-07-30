import { useTranslation } from 'react-i18next'
import type { SensorReading } from '../api/endpoints'
import { isOutOfRange } from '../utils/sensors'

interface SensorWidgetProps {
  pondName: string
  reading: SensorReading | null
}

function valueClass(type: 'ph' | 'salinity' | 'temperature', value: number) {
  return isOutOfRange(type, value) ? 'text-red-600 font-semibold' : 'text-gray-900'
}

export default function SensorWidget({ pondName, reading }: SensorWidgetProps) {
  const { t } = useTranslation()

  if (!reading) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="font-medium text-gray-900">{pondName}</h3>
        <p className="mt-3 text-sm text-gray-500">{t('sensor.noData')}</p>
      </div>
    )
  }

  const ph = Number(reading.ph)
  const salinity = Number(reading.salinity_ppt)
  const temperature = Number(reading.temperature_c)
  const sourceLabel =
    reading.source === 'iot' ? t('sensor.sourceIot') : t('sensor.sourceManual')

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium text-gray-900">{pondName}</h3>
        <span className="rounded-full bg-teal-50 px-2 py-1 text-xs text-teal-700">
          {sourceLabel}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-gray-500">pH</p>
          <p className={valueClass('ph', ph)}>{ph.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-gray-500">{t('sensor.salinity')}</p>
          <p className={valueClass('salinity', salinity)}>{salinity.toFixed(1)} ppt</p>
        </div>
        <div>
          <p className="text-gray-500">{t('sensor.temperature')}</p>
          <p className={valueClass('temperature', temperature)}>{temperature.toFixed(1)} °C</p>
        </div>
      </div>
    </div>
  )
}
