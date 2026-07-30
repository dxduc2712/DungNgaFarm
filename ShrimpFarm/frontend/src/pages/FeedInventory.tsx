import { type FormEvent, useEffect, useState } from 'react'
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
    loadInventory().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!form.pond) {
      setCrops([])
      return
    }
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

  if (loading) return <p className="text-gray-500">{t('common.loading')}</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('feedInventory.title')}</h1>
        <p className="text-gray-500">{t('feedInventory.subtitle')}</p>
      </div>

      {message && (
        <div className="rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-800">{message}</div>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        {inventory.map((item) => (
          <div key={item.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-gray-900">{item.feed_name}</h2>
                <p className="text-sm text-gray-500">{item.feed_brand}</p>
              </div>
              {item.low_stock && (
                <span className="rounded-full bg-red-50 px-2 py-1 text-xs text-red-700">
                  {t('feedInventory.lowStock')}
                </span>
              )}
            </div>
            <p className="mt-4 text-2xl font-semibold text-gray-900">{item.quantity} kg</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-gray-900">{t('feedInventory.feedingSection')}</h2>
        <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-gray-600">{t('common.pond')}</span>
            <select
              value={form.pond}
              onChange={(e) => setForm({ ...form, pond: e.target.value, crop: '' })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-base"
              required
            >
              <option value="">{t('common.selectPond')}</option>
              {ponds.map((pond) => (
                <option key={pond.id} value={pond.id}>
                  {pond.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-gray-600">{t('common.crop')}</span>
            <select
              value={form.crop}
              onChange={(e) => setForm({ ...form, crop: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-base"
              required
            >
              <option value="">{t('common.selectCrop')}</option>
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.code}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-gray-600">{t('common.feed')}</span>
            <select
              value={form.feed}
              onChange={(e) => setForm({ ...form, feed: e.target.value })}
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
              value={form.quantity_kg}
              onChange={(e) => setForm({ ...form, quantity_kg: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-base"
              required
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="text-gray-600">{t('common.note')}</span>
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-base"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-teal-600 px-4 py-3 text-base font-medium text-white hover:bg-teal-700 md:max-w-xs"
          >
            {t('feedInventory.submitFeeding')}
          </button>
        </form>
      </section>
    </div>
  )
}
