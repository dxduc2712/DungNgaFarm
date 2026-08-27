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
import DateRangePicker, { daysAgoIso, todayIso, type DateRangeValue } from './DateRangePicker'

interface FeedingStatsChartProps {
  pondId: number
  cropId?: number | null
}

function defaultRange(): DateRangeValue {
  return {
    from: daysAgoIso(28),
    to: todayIso(),
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

  const barSize = range.groupBy === 'day' ? 18 : 28
  const barCategoryGap = range.groupBy === 'day' ? '18%' : '55%'

  return (
    <div className="rounded-2xl border border-border-soft bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-lg font-semibold text-ink">{t('chart.feedingStatsTitle')}</h2>
      <div className="mt-4">
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-ink-muted">{t('common.loading')}</p>
      ) : !stats || stats.series.length === 0 ? (
        <p className="mt-6 text-sm text-ink-muted">{t('chart.noDataInRange')}</p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[320px] h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.series} barCategoryGap={barCategoryGap}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period_label" />
                  <YAxis unit=" kg" />
                  <Tooltip formatter={(value) => [`${value} kg`, t('chart.feedAmount')]} />
                  <Bar
                    dataKey="quantity_kg"
                    fill="#0f3d2e"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={barSize}
                  />
                  <ReferenceLine
                    y={Number(average.toFixed(1))}
                    stroke="#0284c7"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    label={{
                      value: `${t('chart.average')} ${average.toFixed(1)} kg`,
                      position: 'insideTopLeft',
                      fill: '#0284c7',
                      fontSize: 12,
                    }}
                  />
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
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink">
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
