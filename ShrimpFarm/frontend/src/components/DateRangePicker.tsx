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

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function daysAgoIso(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const { t } = useTranslation()

  const presets = [
    { label: t('dateRange.days7'), from: daysAgoIso(7), to: todayIso() },
    { label: t('dateRange.weeks4'), from: daysAgoIso(28), to: todayIso() },
    { label: t('dateRange.months3'), from: daysAgoIso(90), to: todayIso() },
  ]

  const groupByOptions: { key: GroupBy; label: string }[] = [
    { key: 'day', label: t('dateRange.byDay') },
    { key: 'week', label: t('dateRange.byWeek') },
    { key: 'month', label: t('dateRange.byMonth') },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onChange({ ...value, from: preset.from, to: preset.to })}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:border-teal-300"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-gray-600">{t('dateRange.fromDate')}</span>
          <input
            type="date"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-base"
          />
        </label>
        <label className="block text-sm">
          <span className="text-gray-600">{t('dateRange.toDate')}</span>
          <input
            type="date"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-base"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {groupByOptions.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ ...value, groupBy: key })}
            className={`rounded-lg px-3 py-2 text-sm ${
              value.groupBy === key
                ? 'bg-teal-600 text-white'
                : 'border border-gray-200 bg-white text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
