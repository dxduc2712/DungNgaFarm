import { useTranslation } from 'react-i18next'

export type GroupBy = 'day' | 'week' | 'month'

export interface DateRangeValue {
  from: string
  to: string
  groupBy: GroupBy
}

interface DateRangePickerProps {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
}

function toLocalIso(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayIso() {
  return toLocalIso(new Date())
}

export function daysAgoIso(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return toLocalIso(date)
}

const activeBtn = 'rounded-lg bg-forest px-3 py-2 text-sm font-semibold text-white'
const idleBtn =
  'rounded-lg border border-border-soft bg-white px-3 py-2 text-sm text-ink hover:border-aqua'

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const { t } = useTranslation()

  const presets: { label: string; from: string; to: string; groupBy: GroupBy }[] = [
    { label: t('dateRange.days7'), from: daysAgoIso(7), to: todayIso(), groupBy: 'day' },
    { label: t('dateRange.weeks4'), from: daysAgoIso(28), to: todayIso(), groupBy: 'week' },
    { label: t('dateRange.months3'), from: daysAgoIso(90), to: todayIso(), groupBy: 'month' },
  ]

  const groupByOptions: { key: GroupBy; label: string }[] = [
    { key: 'day', label: t('dateRange.byDay') },
    { key: 'week', label: t('dateRange.byWeek') },
    { key: 'month', label: t('dateRange.byMonth') },
  ]

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const selected = value.from === preset.from && value.to === preset.to
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() =>
                onChange({
                  from: preset.from,
                  to: preset.to,
                  groupBy: preset.groupBy,
                })
              }
              className={selected ? activeBtn : idleBtn}
            >
              {preset.label}
            </button>
          )
        })}
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 *:min-w-0">
        <label className="block text-sm">
          <span className="text-ink-muted">{t('dateRange.fromDate')}</span>
          <input
            type="date"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="mt-1 w-full min-w-0 max-w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-base text-ink"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink-muted">{t('dateRange.toDate')}</span>
          <input
            type="date"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="mt-1 w-full min-w-0 max-w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-base text-ink"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {groupByOptions.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ ...value, groupBy: key })}
            className={value.groupBy === key ? activeBtn : idleBtn}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
