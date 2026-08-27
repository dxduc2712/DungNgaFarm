import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Crop, Feed, InventoryItem, Pond } from '../api/endpoints'
import { endpoints } from '../api/endpoints'

export default function FeedInventory() {
  const { t } = useTranslation()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [ponds, setPonds] = useState<Pond[]>([])
  const [crops, setCrops] = useState<Crop[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    pond: '',
    crop: '',
    feed: '',
    quantity_kg: '',
    note: '',
  })

  const loadInventory = async () => {
    const [items, feedList, pondList] = await Promise.all([
      endpoints.inventory(),
      endpoints.feeds(),
      endpoints.ponds(),
    ])
    setInventory(items)
    setFeeds(feedList)
    setPonds(pondList.filter((pond) => pond.pond_type === 'GROW'))
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([
      endpoints.inventory(),
      endpoints.feeds(),
      endpoints.ponds(),
    ])
      .then(([items, feedList, pondList]) => {
        if (cancelled) return
        setInventory(items)
        setFeeds(feedList)
        setPonds(pondList.filter((pond) => pond.pond_type === 'GROW'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!form.pond) return
    endpoints.crops({ pond: form.pond, status: 'ACTIVE' }).then(setCrops)
  }, [form.pond])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await endpoints.createFeedingRecord({
      crop: Number(form.crop),
      feed: Number(form.feed),
      quantity_kg: form.quantity_kg,
      feeding_time: new Date().toISOString(),
      note: form.note,
    })
    setMessage(t('feedInventory.recordSuccess'))
    setForm({ pond: '', crop: '', feed: '', quantity_kg: '', note: '' })
    await loadInventory()
  }

  if (loading) return <p className="text-ink-muted">{t('common.loading')}</p>

  return (
    <div className="min-w-0 space-y-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-ink">{t('feedInventory.title')}</h1>
        <p className="text-ink-muted">{t('feedInventory.subtitle')}</p>
      </div>

      {message && (
        <div className="rounded-xl border border-aqua/20 bg-aqua-soft px-4 py-3 text-sm text-forest">{message}</div>
      )}

      <section className="grid min-w-0 gap-4 md:grid-cols-2 *:min-w-0">
        {inventory.map((item) => (
          <div key={item.id} className="min-w-0 rounded-2xl border border-border-soft bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-ink">{item.feed_name}</h2>
                <p className="truncate text-sm text-ink-muted">{item.feed_brand}</p>
              </div>
              {item.low_stock && (
                <span className="shrink-0 rounded-full bg-red-50 px-2 py-1 text-xs text-red-700">
                  {t('feedInventory.lowStock')}
                </span>
              )}
            </div>
            <p className="mt-4 text-2xl font-semibold text-ink">{item.quantity} kg</p>
          </div>
        ))}
      </section>

      <section className="min-w-0 overflow-x-clip rounded-2xl border border-border-soft bg-card p-5 shadow-[var(--shadow-card)]">
        <h2 className="font-semibold text-ink">{t('feedInventory.feedingSection')}</h2>
        <form onSubmit={submit} className="mt-4 grid min-w-0 gap-3 md:grid-cols-2 *:min-w-0">
          <label className="block min-w-0 text-sm">
            <span className="text-ink-muted">{t('common.pond')}</span>
            <div className="mt-1 min-w-0 w-full overflow-hidden">
              <select
                value={form.pond}
                onChange={(e) => {
                  const pond = e.target.value
                  setForm({ ...form, pond, crop: '' })
                  if (!pond) setCrops([])
                }}
                className="block w-full min-w-0 max-w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-base text-ink"
                required
              >
                <option value="">{t('common.selectPond')}</option>
                {ponds.map((pond) => (
                  <option key={pond.id} value={pond.id}>
                    {pond.name}
                  </option>
                ))}
              </select>
            </div>
          </label>
          <div className="block min-w-0 text-sm md:col-span-2">
            <span className="text-ink-muted">{t('common.crop')}</span>
            <div className="mt-1 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center">
              <div className="min-w-0 w-full overflow-hidden lg:flex-1">
                <select
                  value={form.crop}
                  onChange={(e) => setForm({ ...form, crop: e.target.value })}
                  className="block w-full min-w-0 max-w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-base text-ink"
                  required
                >
                  <option value="">{t('common.selectCrop')}</option>
                  {crops.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.code} — {crop.shrimp_species}
                    </option>
                  ))}
                </select>
              </div>
              {form.pond ? (
                <Link
                  to={`/ao/${form.pond}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-forest px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-forest-deep lg:w-auto lg:shrink-0"
                >
                  {t('feedInventory.viewPondDetail')}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex w-full items-center justify-center rounded-xl bg-forest px-3 py-2 text-center text-sm font-semibold text-white opacity-50 lg:w-auto lg:shrink-0"
                >
                  {t('feedInventory.viewPondDetail')}
                </button>
              )}
            </div>
          </div>
          <label className="block text-sm">
            <span className="text-ink-muted">{t('common.feed')}</span>
            <select
              value={form.feed}
              onChange={(e) => setForm({ ...form, feed: e.target.value })}
              className="mt-1 w-full min-w-0 max-w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-base text-ink"
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
              value={form.quantity_kg}
              onChange={(e) => setForm({ ...form, quantity_kg: e.target.value })}
              className="mt-1 w-full min-w-0 max-w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-base text-ink"
              required
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="text-ink-muted">{t('common.note')}</span>
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="mt-1 w-full min-w-0 max-w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-base text-ink"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-forest px-4 py-3 text-base font-semibold text-white transition hover:bg-forest-deep md:max-w-xs"
          >
            {t('feedInventory.submitFeeding')}
          </button>
        </form>
      </section>
    </div>
  )
}
