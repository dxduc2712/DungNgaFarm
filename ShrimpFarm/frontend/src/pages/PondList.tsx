import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Pond } from '../api/endpoints'
import { endpoints } from '../api/endpoints'
import { pondTypeLabel } from '../utils/sensors'

export default function PondList() {
  const { t } = useTranslation()
  const [ponds, setPonds] = useState<Pond[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    endpoints.ponds().then(setPonds).finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-500">{t('common.loading')}</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('ponds.title')}</h1>
        <p className="text-gray-500">{t('ponds.subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {ponds.map((pond) => (
          <Link
            key={pond.id}
            to={`/ao/${pond.id}`}
            className="rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{pond.name}</h2>
                <p className="text-sm text-gray-500">{pondTypeLabel(pond.pond_type)}</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  pond.active ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {pond.active ? t('common.active') : t('common.inactive')}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-600">
              <p>{t('ponds.areaLabel', { value: pond.area_m2 ?? '—' })}</p>
              <p>{t('ponds.depthLabel', { value: pond.depth_m ?? '—' })}</p>
              <p className="col-span-2">
                {t('ponds.cropLabel', { value: pond.active_crop_code ?? t('common.none') })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
