import api, { fetchAllPages } from './http'

export interface LoginResponse {
  access: string
  refresh: string
}

export interface DashboardData {
  total_ponds: number
  active_crops: number
  unresolved_alerts: number
  ponds: Array<{
    id: number
    name: string
    pond_type: string
    active_crop_code: string | null
    latest_reading: SensorReading | null
  }>
  low_stock: InventoryItem[]
  recent_alerts: SensorAlert[]
}

export interface Pond {
  id: number
  farm: number
  farm_name: string
  name: string
  pond_type: string
  area_m2: string | null
  depth_m: string | null
  record_mode: string
  active: boolean
  active_crop_id: number | null
  active_crop_code: string | null
}

export interface Crop {
  id: number
  code: string
  pond: number
  pond_name: string
  shrimp_species: string
  start_date: string
  expected_harvest_date: string | null
  end_date: string | null
  status: string
}

export interface Feed {
  id: number
  name: string
  brand: string
  weight_kg: string
  price: string
}

export interface InventoryItem {
  id: number
  feed: number
  feed_name: string
  feed_brand: string
  quantity: number
  updated_at: string
  low_stock: boolean
}

export interface FeedingRecord {
  id: number
  crop: number
  crop_code: string
  feed: number
  feed_name: string
  pond_name: string
  quantity_kg: string
  feeding_time: string
  note: string
}

export interface WaterTreatment {
  id: number
  crop: number
  crop_code: string
  product_name: string
  quantity: string
  treatment_time: string
  note: string
}

export interface WaterExchange {
  id: number
  crop: number
  crop_code: string
  action: string
  percentage: string
  exchange_time: string
  note: string
}

export interface SensorReading {
  id: number
  pond: number
  pond_name: string
  ph: string
  salinity_ppt: string
  temperature_c: string
  recorded_at: string
  source: 'manual' | 'iot'
}

export interface SensorAlert {
  id: number
  crop: number
  crop_code: string
  pond: number
  pond_name: string
  sensor_type: string
  value: string
  threshold: string
  message: string
  created_at: string
  resolved: boolean
}

export interface FeedingStats {
  pond_id: number
  pond_name: string
  crop_id: number | null
  crop_code: string | null
  from: string
  to: string
  group_by: string
  total_kg: number
  series: Array<{
    period_start: string
    period_label: string
    quantity_kg: number
  }>
  recommended_kg: number | null
}

export const endpoints = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login/', { username, password }),

  dashboard: () => api.get<DashboardData>('/dashboard/'),

  ponds: () => fetchAllPages<Pond>('/ponds/'),
  pond: (id: number) => api.get<Pond>(`/ponds/${id}/`),
  createPond: (data: Partial<Pond>) => api.post<Pond>('/ponds/', data),
  updatePond: (id: number, data: Partial<Pond>) => api.patch<Pond>(`/ponds/${id}/`, data),

  crops: (params?: Record<string, unknown>) => fetchAllPages<Crop>('/crops/', params),

  feedingRecords: (params?: Record<string, unknown>) =>
    fetchAllPages<FeedingRecord>('/feeding-records/', params),
  createFeedingRecord: (data: Partial<FeedingRecord>) =>
    api.post<FeedingRecord>('/feeding-records/', data),

  waterTreatments: (params?: Record<string, unknown>) =>
    fetchAllPages<WaterTreatment>('/water-treatments/', params),
  createWaterTreatment: (data: Partial<WaterTreatment>) =>
    api.post<WaterTreatment>('/water-treatments/', data),

  waterExchanges: (params?: Record<string, unknown>) =>
    fetchAllPages<WaterExchange>('/water-exchanges/', params),
  createWaterExchange: (data: Partial<WaterExchange>) =>
    api.post<WaterExchange>('/water-exchanges/', data),

  inventory: () => fetchAllPages<InventoryItem>('/inventory-items/'),
  feeds: () => fetchAllPages<Feed>('/feeds/'),

  sensorReadings: (params?: Record<string, unknown>) =>
    fetchAllPages<SensorReading>('/sensor-readings/', params),

  sensorAlerts: (params?: Record<string, unknown>) =>
    fetchAllPages<SensorAlert>('/sensor-alerts/', params),
  resolveAlert: (id: number) => api.post<SensorAlert>(`/sensor-alerts/${id}/resolve/`),

  feedingStats: (pondId: number, params: Record<string, string>) =>
    api.get<FeedingStats>(`/ponds/${pondId}/feeding-stats/`, { params }),

  farms: () => fetchAllPages<{ id: number; name: string; address: string }>('/farms/'),
}
