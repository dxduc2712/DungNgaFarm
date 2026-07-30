import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import FeedingStatsChart from '../components/FeedingStatsChart'
import SensorWidget from '../components/SensorWidget'
import type { Crop, FeedingRecord, Pond, SensorReading } from '../api/endpoints'
import { endpoints } from '../api/endpoints'
import { formatDateTime, pondTypeLabel } from '../utils/sensors'

export default function PondDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const pondId = Number(id)
  const [pond, setPond] = useState<Pond | null>(null)
  const [reading, setReading] = useState<SensorReading | null>(null)
  const [records, setRecords] = useState<FeedingRecord[]>([])
  const [crops, setCrops] = useState<Crop[]>([])
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pondId) return

    Promise.all([
      endpoints.pond(pondId),
      endpoints.sensorReadings({ pond: pondId }),
      endpoints.crops({ pond: pondId }),
    ]).then(async ([pondRes, readings, cropList]) => {
      setPond(pondRes.data)
      setReading(readings[0] ?? null)
      setCrops(cropList)
      const activeCrop =
        cropList.find((crop) => crop.status === 'ACTIVE') ?? cropList[0] ?? null
      setSelectedCropId(activeCrop?.id ?? null)

      if (activeCrop) {
        const feedingRecords = await endpoints.feedingRecords({ crop: activeCrop.id })
        setRecords(feedingRecords.slice(0, 10))
      }
    }).finally(() => setLoading(false))
  }, [pondId])

  useEffect(() => {
    if (!selectedCropId) return
    endpoints.feedingRecords({ crop: selectedCropId }).then((data) => {
      setRecords(data.slice(0, 10))
    })
  }, [selectedCropId])

  if (loading) return <p className="text-gray-500">{t('common.loading')}</p>
  if (!pond) return <p className="text-gray-500">{t('ponds.notFound')}</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pond.name}</h1>
          <p className="text-gray-500">{pondTypeLabel(pond.pond_type)}</p>
        </div>
        <Link
          to={`/ao/${pond.id}/nhat-ky`}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          {t('ponds.openLog')}
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900">{t('ponds.infoTitle')}</h2>
          <dl className="mt-3 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <dt>{t('common.area')}</dt>
              <dd>{pond.area_m2 ?? '—'} m²</dd>
            </div>
            <div className="flex justify-between">
              <dt>{t('common.depth')}</dt>
              <dd>{pond.depth_m ?? '—'} m</dd>
            </div>
            <div className="flex justify-between">
              <dt>{t('common.status')}</dt>
              <dd>{pond.active ? t('common.active') : t('common.inactive')}</dd>
            </div>
          </dl>
        </div>
        <SensorWidget pondName={pond.name} reading={reading} />
      </div>

      {crops.length > 1 && (
        <label className="block text-sm">
          <span className="text-gray-600">{t('ponds.selectCrop')}</span>
          <select
            value={selectedCropId ?? ''}
            onChange={(e) => setSelectedCropId(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-base md:max-w-sm"
          >
            {crops.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.code} ({crop.status})
              </option>
            ))}
          </select>
        </label>
      )}

      {pond.pond_type === 'GROW' && (
        <FeedingStatsChart pondId={pond.id} cropId={selectedCropId} />
      )}

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">{t('ponds.recentFeedingTitle')}</h2>
        {records.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">{t('ponds.noFeedingRecords')}</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2 pr-4">{t('common.time')}</th>
                  <th className="py-2 pr-4">{t('common.feed')}</th>
                  <th className="py-2">{t('common.quantity')}</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4">{formatDateTime(record.feeding_time)}</td>
                    <td className="py-2 pr-4">{record.feed_name}</td>
                    <td className="py-2">{record.quantity_kg} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
