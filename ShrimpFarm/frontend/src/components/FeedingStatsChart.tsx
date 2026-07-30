import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { FeedingStats } from '../api/endpoints'
import { endpoints } from '../api/endpoints'
import DateRangePicker, { type DateRangeValue } from './DateRangePicker'

interface FeedingStatsChartProps {
  pondId: number
  cropId?: number | null
}

function defaultRange(): DateRangeValue {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 28)
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
    groupBy: 'week',
  }
}

export default function FeedingStatsChart({ pondId, cropId }: FeedingStatsChartProps) {
  const { t } = useTranslation()
  const [range, setRange] = useState<DateRangeValue>(defaultRange)
  const [stats, setStats] = useState<FeedingStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    const params: Record<string, string> = {
      from: range.from,
      to: range.to,
      group_by: range.groupBy,
    }
    if (cropId) params.crop_id = String(cropId)

    endpoints
      .feedingStats(pondId, params)
      .then((response) => {
        if (active) setStats(response.data)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [pondId, cropId, range])

  const average =
    stats && stats.series.length > 0 ? stats.total_kg / stats.series.length : 0

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{t('chart.feedingStatsTitle')}</h2>
      <div className="mt-4">
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-500">{t('common.loading')}</p>
      ) : !stats || stats.series.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">{t('chart.noDataInRange')}</p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[320px] h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period_label" />
                  <YAxis unit=" kg" />
                  <Tooltip formatter={(value) => [`${value} kg`, t('chart.feedAmount')]} />
                  <Bar dataKey="quantity_kg" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  {stats.recommended_kg != null && (
                    <ReferenceLine
                      y={stats.recommended_kg}
                      stroke="#f97316"
                      strokeDasharray="4 4"
                      label={{ value: t('chart.planned'), position: 'insideTopRight' }}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-700">
            <span>
              <strong>{t('chart.total')}:</strong> {stats.total_kg.toFixed(1)} kg
            </span>
            <span>
              <strong>{t('chart.averagePerWeek')}:</strong> {average.toFixed(1)} kg
            </span>
          </div>
        </>
      )}
    </div>
  )
}
