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

const emptyFeedingForm = () => ({
  feed: '',
  quantity_kg: '',
  feeding_time: '',
  note: '',
})

const emptyTreatmentForm = () => ({
  product_name: '',
  quantity: '',
  treatment_time: '',
  note: '',
})

const emptyExchangeForm = () => ({
  action: 'PUMP_IN',
  percentage: '',
  exchange_time: '',
  note: '',
})

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

  const [feedingForm, setFeedingForm] = useState(emptyFeedingForm)
  const [treatmentForm, setTreatmentForm] = useState(emptyTreatmentForm)
  const [exchangeForm, setExchangeForm] = useState(emptyExchangeForm)

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
        endpoints.feedingRecords({ crop: activeCrop.id, page_size: 50 }),
        endpoints.waterTreatments({ crop: activeCrop.id, page_size: 50 }),
        endpoints.waterExchanges({ crop: activeCrop.id, page_size: 50 }),
      ])
      setFeedingRecords(records)
      setTreatments(treatmentList)
      setExchanges(exchangeList)
    }
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([
      endpoints.pond(pondId),
      endpoints.crops({ pond: pondId, status: 'ACTIVE' }),
      endpoints.feeds(),
    ])
      .then(async ([pondRes, cropList, feedList]) => {
        if (cancelled) return
        setPond(pondRes.data)
        const activeCrop = cropList[0] ?? null
        setCrop(activeCrop)
        setFeeds(feedList)
        if (activeCrop) {
          const [records, treatmentList, exchangeList] = await Promise.all([
            endpoints.feedingRecords({ crop: activeCrop.id, page_size: 50 }),
            endpoints.waterTreatments({ crop: activeCrop.id, page_size: 50 }),
            endpoints.waterExchanges({ crop: activeCrop.id, page_size: 50 }),
          ])
          if (cancelled) return
          setFeedingRecords(records)
          setTreatments(treatmentList)
          setExchanges(exchangeList)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
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
    setFeedingForm(emptyFeedingForm())
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
    setTreatmentForm(emptyTreatmentForm())
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
    setExchangeForm(emptyExchangeForm())
    await loadData()
  }

  if (loading) return <p className="text-ink-muted">{t('common.loading')}</p>
  if (!pond || !crop) {
    return (
      <div className="space-y-3">
        <p className="text-ink-muted">{t('feedingLog.noActiveCrop')}</p>
        <Link to={`/ao/${pondId}`} className="text-aqua-dark">
          {t('common.backToPondDetail')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/ao/${pondId}`} className="text-sm text-aqua-dark">
          ← {t('common.backTo', { name: pond.name })}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-ink">
          {t('feedingLog.title', { name: pond.name })}
        </h1>
        <p className="text-ink-muted">{t('feedingLog.cropLabel', { code: crop.code })}</p>
      </div>

      {message && (
        <div className="rounded-xl border border-aqua/20 bg-aqua-soft px-4 py-3 text-sm text-forest">{message}</div>
      )}

      <section className="rounded-2xl border border-border-soft bg-card p-5 shadow-[var(--shadow-card)]">
        <h2 className="font-semibold text-ink">{t('feedingLog.feedingSection')}</h2>
        <form onSubmit={submitFeeding} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-ink-muted">{t('common.feed')}</span>
            <select
              value={feedingForm.feed}
              onChange={(e) => setFeedingForm({ ...feedingForm, feed: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-base text-ink"
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
            <span className="text-ink-muted">{t('common.quantityKg')}</span>
            <input
              type="number"
              step="0.1"
              value={feedingForm.quantity_kg}
              onChange={(e) => setFeedingForm({ ...feedingForm, quantity_kg: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-base text-ink"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="text-ink-muted">{t('common.time')}</span>
            <input
              type="datetime-local"
              value={feedingForm.feeding_time}
              onChange={(e) => setFeedingForm({ ...feedingForm, feeding_time: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-base text-ink"
              required
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="text-ink-muted">{t('common.note')}</span>
            <input
              value={feedingForm.note}
              onChange={(e) => setFeedingForm({ ...feedingForm, note: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-base text-ink"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-forest px-4 py-3 text-base font-semibold text-white transition hover:bg-forest-deep md:col-span-2 md:max-w-xs"
          >
            {t('feedingLog.saveFeeding')}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-border-soft bg-card p-5 shadow-[var(--shadow-card)]">
        <h2 className="font-semibold text-ink">{t('feedingLog.waterTreatmentSection')}</h2>
        <form onSubmit={submitTreatment} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-ink-muted">{t('common.product')}</span>
            <input
              value={treatmentForm.product_name}
              onChange={(e) =>
                setTreatmentForm({ ...treatmentForm, product_name: e.target.value })
              }
              className="mt-1 w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-base text-ink"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="text-ink-muted">{t('common.dosage')}</span>
            <input
              value={treatmentForm.quantity}
              onChange={(e) => setTreatmentForm({ ...treatmentForm, quantity: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-base text-ink"
              required
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="text-ink-muted">{t('common.time')}</span>
            <input
              type="datetime-local"
              value={treatmentForm.treatment_time}
              onChange={(e) =>
                setTreatmentForm({ ...treatmentForm, treatment_time: e.target.value })
              }
              className="mt-1 w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-base text-ink"
              required
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-forest px-4 py-3 text-base font-semibold text-white transition hover:bg-forest-deep md:max-w-xs"
          >
            {t('feedingLog.saveTreatment')}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-border-soft bg-card p-5 shadow-[var(--shadow-card)]">
        <h2 className="font-semibold text-ink">{t('feedingLog.waterExchangeSection')}</h2>
        <form onSubmit={submitExchange} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-ink-muted">{t('common.action')}</span>
            <select
              value={exchangeForm.action}
              onChange={(e) => setExchangeForm({ ...exchangeForm, action: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-base text-ink"
            >
              <option value="PUMP_IN">{t('feedingLog.pumpIn')}</option>
              <option value="SIPHON">{t('feedingLog.siphon')}</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-ink-muted">{t('common.percentage')}</span>
            <input
              type="number"
              step="0.1"
              value={exchangeForm.percentage}
              onChange={(e) => setExchangeForm({ ...exchangeForm, percentage: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-base text-ink"
              required
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-forest px-4 py-3 text-base font-semibold text-white transition hover:bg-forest-deep md:max-w-xs"
          >
            {t('feedingLog.saveExchange')}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-border-soft bg-card p-5 shadow-[var(--shadow-card)]">
        <h2 className="font-semibold text-ink">{t('feedingLog.recentHistory')}</h2>
        <div className="mt-4 space-y-4 text-sm">
          <div>
            <h3 className="font-medium text-ink">{t('feedingLog.feedingHistory')}</h3>
            <ul className="mt-2 space-y-1 text-ink-muted">
              {feedingRecords.slice(0, 8).map((record) => (
                <li key={record.id}>
                  {formatDateTime(record.feeding_time)} — {record.feed_name}: {record.quantity_kg} kg
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-ink">{t('feedingLog.treatmentHistory')}</h3>
            <ul className="mt-2 space-y-1 text-ink-muted">
              {treatments.slice(0, 5).map((item) => (
                <li key={item.id}>
                  {formatDateTime(item.treatment_time)} — {item.product_name}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-ink">{t('feedingLog.exchangeHistory')}</h3>
            <ul className="mt-2 space-y-1 text-ink-muted">
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
