import { type FormEvent, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type {
  Crop,
  FeedingRecord,
  Feed,
  Pond,
  WaterExchange,
  WaterTreatment,
} from '../api/endpoints'
import { endpoints } from '../api/endpoints'
import { formatDateTime } from '../utils/sensors'

export default function FeedingLog() {
  const { t } = useTranslation()
  const { id } = useParams()
  const pondId = Number(id)
  const [pond, setPond] = useState<Pond | null>(null)
  const [crop, setCrop] = useState<Crop | null>(null)
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([])
  const [treatments, setTreatments] = useState<WaterTreatment[]>([])
  const [exchanges, setExchanges] = useState<WaterExchange[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [feedingForm, setFeedingForm] = useState({
    feed: '',
    quantity_kg: '',
    feeding_time: new Date().toISOString().slice(0, 16),
    note: '',
  })
  const [treatmentForm, setTreatmentForm] = useState({
    product_name: '',
    quantity: '',
    treatment_time: new Date().toISOString().slice(0, 16),
    note: '',
  })
  const [exchangeForm, setExchangeForm] = useState({
    action: 'PUMP_IN',
    percentage: '',
    exchange_time: new Date().toISOString().slice(0, 16),
    note: '',
  })

  const loadData = async () => {
    const [pondRes, cropList, feedList] = await Promise.all([
      endpoints.pond(pondId),
      endpoints.crops({ pond: pondId, status: 'ACTIVE' }),
      endpoints.feeds(),
    ])
    setPond(pondRes.data)
    const activeCrop = cropList[0] ?? null
    setCrop(activeCrop)
    setFeeds(feedList)
    if (activeCrop) {
      const [records, treatmentList, exchangeList] = await Promise.all([
        endpoints.feedingRecords({ crop: activeCrop.id }),
        endpoints.waterTreatments({ crop: activeCrop.id }),
        endpoints.waterExchanges({ crop: activeCrop.id }),
      ])
      setFeedingRecords(records)
      setTreatments(treatmentList)
      setExchanges(exchangeList)
    }
  }

  useEffect(() => {
    loadData().finally(() => setLoading(false))
  }, [pondId])

  const submitFeeding = async (event: FormEvent) => {
    event.preventDefault()
    if (!crop) return
    await endpoints.createFeedingRecord({
      crop: crop.id,
      feed: Number(feedingForm.feed),
      quantity_kg: feedingForm.quantity_kg,
      feeding_time: new Date(feedingForm.feeding_time).toISOString(),
      note: feedingForm.note,
    })
    setMessage(t('feedingLog.recordFeedingSuccess'))
    await loadData()
  }

  const submitTreatment = async (event: FormEvent) => {
    event.preventDefault()
    if (!crop) return
    await endpoints.createWaterTreatment({
      crop: crop.id,
      product_name: treatmentForm.product_name,
      quantity: treatmentForm.quantity,
      treatment_time: new Date(treatmentForm.treatment_time).toISOString(),
      note: treatmentForm.note,
    })
    setMessage(t('feedingLog.recordTreatmentSuccess'))
    await loadData()
  }

  const submitExchange = async (event: FormEvent) => {
    event.preventDefault()
    if (!crop) return
    await endpoints.createWaterExchange({
      crop: crop.id,
      action: exchangeForm.action,
      percentage: exchangeForm.percentage,
      exchange_time: new Date(exchangeForm.exchange_time).toISOString(),
      note: exchangeForm.note,
    })
    setMessage(t('feedingLog.recordExchangeSuccess'))
    await loadData()
  }

  if (loading) return <p className="text-gray-500">{t('common.loading')}</p>
  if (!pond || !crop) {
    return (
      <div className="space-y-3">
        <p className="text-gray-500">{t('feedingLog.noActiveCrop')}</p>
        <Link to={`/ao/${pondId}`} className="text-teal-700">
          {t('common.backToPondDetail')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/ao/${pondId}`} className="text-sm text-teal-700">
          ← {t('common.backTo', { name: pond.name })}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {t('feedingLog.title', { name: pond.name })}
        </h1>
        <p className="text-gray-500">{t('feedingLog.cropLabel', { code: crop.code })}</p>
      </div>

      {message && (
        <div className="rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-800">{message}</div>
      )}

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-gray-900">{t('feedingLog.feedingSection')}</h2>
        <form onSubmit={submitFeeding} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-gray-600">{t('common.feed')}</span>
            <select
              value={feedingForm.feed}
              onChange={(e) => setFeedingForm({ ...feedingForm, feed: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-base"
              required
            >
              <option value="">{t('common.selectFeed')}</option>
              {feeds.map((feed) => (
                <option key={feed.id} value={feed.id}>
                  {feed.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-gray-600">{t('common.quantityKg')}</span>
            <input
              type="number"
              step="0.1"
              value={feedingForm.quantity_kg}
              onChange={(e) => setFeedingForm({ ...feedingForm, quantity_kg: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-base"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="text-gray-600">{t('common.time')}</span>
            <input
              type="datetime-local"
              value={feedingForm.feeding_time}
              onChange={(e) => setFeedingForm({ ...feedingForm, feeding_time: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-base"
              required
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="text-gray-600">{t('common.note')}</span>
            <input
              value={feedingForm.note}
              onChange={(e) => setFeedingForm({ ...feedingForm, note: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-base"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-teal-600 px-4 py-3 text-base font-medium text-white hover:bg-teal-700 md:col-span-2 md:max-w-xs"
          >
            {t('feedingLog.saveFeeding')}
          </button>
        </form>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-gray-900">{t('feedingLog.waterTreatmentSection')}</h2>
        <form onSubmit={submitTreatment} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-gray-600">{t('common.product')}</span>
            <input
              value={treatmentForm.product_name}
              onChange={(e) =>
                setTreatmentForm({ ...treatmentForm, product_name: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-base"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="text-gray-600">{t('common.dosage')}</span>
            <input
              value={treatmentForm.quantity}
              onChange={(e) => setTreatmentForm({ ...treatmentForm, quantity: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-base"
              required
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="text-gray-600">{t('common.time')}</span>
            <input
              type="datetime-local"
              value={treatmentForm.treatment_time}
              onChange={(e) =>
                setTreatmentForm({ ...treatmentForm, treatment_time: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-base"
              required
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-teal-600 px-4 py-3 text-base font-medium text-white hover:bg-teal-700 md:max-w-xs"
          >
            {t('feedingLog.saveTreatment')}
          </button>
        </form>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-gray-900">{t('feedingLog.waterExchangeSection')}</h2>
        <form onSubmit={submitExchange} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-gray-600">{t('common.action')}</span>
            <select
              value={exchangeForm.action}
              onChange={(e) => setExchangeForm({ ...exchangeForm, action: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-base"
            >
              <option value="PUMP_IN">{t('feedingLog.pumpIn')}</option>
              <option value="SIPHON">{t('feedingLog.siphon')}</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-gray-600">{t('common.percentage')}</span>
            <input
              type="number"
              step="0.1"
              value={exchangeForm.percentage}
              onChange={(e) => setExchangeForm({ ...exchangeForm, percentage: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-base"
              required
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-teal-600 px-4 py-3 text-base font-medium text-white hover:bg-teal-700 md:max-w-xs"
          >
            {t('feedingLog.saveExchange')}
          </button>
        </form>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-gray-900">{t('feedingLog.recentHistory')}</h2>
        <div className="mt-4 space-y-4 text-sm">
          <div>
            <h3 className="font-medium text-gray-800">{t('feedingLog.feedingHistory')}</h3>
            <ul className="mt-2 space-y-1 text-gray-600">
              {feedingRecords.slice(0, 8).map((record) => (
                <li key={record.id}>
                  {formatDateTime(record.feeding_time)} — {record.feed_name}: {record.quantity_kg} kg
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{t('feedingLog.treatmentHistory')}</h3>
            <ul className="mt-2 space-y-1 text-gray-600">
              {treatments.slice(0, 5).map((item) => (
                <li key={item.id}>
                  {formatDateTime(item.treatment_time)} — {item.product_name}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{t('feedingLog.exchangeHistory')}</h3>
            <ul className="mt-2 space-y-1 text-gray-600">
              {exchanges.slice(0, 5).map((item) => (
                <li key={item.id}>
                  {formatDateTime(item.exchange_time)} — {item.percentage}%
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
