import api, { fetchAllPages, fetchPage } from './http'

export interface LoginResponse {
  access: string
  refresh: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
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

export interface RegisterPayload {
  email: string
  password: string
  password_confirm: string
  first_name?: string
  last_name?: string
  username?: string
}

export interface RegisterResponse extends LoginResponse {
  user: User
}

export interface ProfileUpdatePayload {
  first_name?: string
  last_name?: string
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
  new_password_confirm: string
}

export const endpoints = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login/', { username, password }),

  register: (data: RegisterPayload) =>
    api.post<RegisterResponse>('/auth/register/', data),

  passwordReset: (email: string) =>
    api.post<{ detail: string }>('/auth/password-reset/', { email }),

  passwordResetConfirm: (data: {
    uid: string
    token: string
    new_password: string
    new_password_confirm: string
  }) => api.post<{ detail: string }>('/auth/password-reset/confirm/', data),

  changePassword: (data: ChangePasswordPayload) =>
    api.post<{ detail: string }>('/auth/change-password/', data),

  logout: () => api.post<{ ok: boolean }>('/auth/logout/', {}, { withCredentials: true }),

  me: () => api.get<User>('/auth/me/'),

  updateProfile: (data: ProfileUpdatePayload) => api.patch<User>('/auth/me/', data),

  createDjangoSession: () =>
    api.post<{ ok: boolean }>('/auth/django-session/', {}, { withCredentials: true }),

  dashboard: () => api.get<DashboardData>('/dashboard/'),

  ponds: () => fetchAllPages<Pond>('/ponds/', { page_size: 100 }),
  pond: (id: number) => api.get<Pond>(`/ponds/${id}/`),
  createPond: (data: Partial<Pond>) => api.post<Pond>('/ponds/', data),
  updatePond: (id: number, data: Partial<Pond>) => api.patch<Pond>(`/ponds/${id}/`, data),

  crops: (params?: Record<string, unknown>) =>
    fetchAllPages<Crop>('/crops/', { page_size: 100, ...params }),

  feedingRecords: (params?: Record<string, unknown>) =>
    fetchPage<FeedingRecord>('/feeding-records/', params),
  createFeedingRecord: (data: Partial<FeedingRecord>) =>
    api.post<FeedingRecord>('/feeding-records/', data),

  waterTreatments: (params?: Record<string, unknown>) =>
    fetchPage<WaterTreatment>('/water-treatments/', params),
  createWaterTreatment: (data: Partial<WaterTreatment>) =>
    api.post<WaterTreatment>('/water-treatments/', data),

  waterExchanges: (params?: Record<string, unknown>) =>
    fetchPage<WaterExchange>('/water-exchanges/', params),
  createWaterExchange: (data: Partial<WaterExchange>) =>
    api.post<WaterExchange>('/water-exchanges/', data),

  inventory: () => fetchAllPages<InventoryItem>('/inventory-items/', { page_size: 100 }),
  feeds: () => fetchAllPages<Feed>('/feeds/', { page_size: 100 }),

  latestPondReading: async (pondId: number): Promise<SensorReading | null> => {
    const response = await api.get<SensorReading>(`/ponds/${pondId}/latest-reading/`)
    if (response.status === 204 || !response.data) {
      return null
    }
    return response.data
  },

  sensorReadings: (params?: Record<string, unknown>) =>
    fetchPage<SensorReading>('/sensor-readings/', params),

  sensorAlerts: (params?: Record<string, unknown>) =>
    fetchPage<SensorAlert>('/sensor-alerts/', { page_size: 50, ...params }),
  resolveAlert: (id: number) => api.post<SensorAlert>(`/sensor-alerts/${id}/resolve/`),

  feedingStats: (pondId: number, params: Record<string, string>) =>
    api.get<FeedingStats>(`/ponds/${pondId}/feeding-stats/`, { params }),

  farms: () => fetchAllPages<{ id: number; name: string; address: string }>('/farms/', {
    page_size: 100,
  }),
}
