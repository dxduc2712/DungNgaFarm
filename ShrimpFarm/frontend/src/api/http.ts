import axios from 'axios'
import { API_BASE_URL, clearToken, getToken } from './client'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname
      const isPublicAuth =
        path === '/login' ||
        path === '/register' ||
        path === '/forgot-password' ||
        path.startsWith('/reset-password')
      clearToken()
      if (!isPublicAuth) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export async function fetchPage<T>(url: string, params?: Record<string, unknown>): Promise<T[]> {
  const response = await api.get<PaginatedResponse<T> | T[]>(url, { params })
  const data = response.data
  if (Array.isArray(data)) {
    return data
  }
  return data.results
}

export async function fetchAllPages<T>(url: string, params?: Record<string, unknown>): Promise<T[]> {
  const items: T[] = []
  let nextUrl: string | null = url
  let queryParams = params

  while (nextUrl) {
    const response: { data: PaginatedResponse<T> | T[] } = await api.get(nextUrl, {
      params: queryParams,
    })
    const data = response.data
    if (Array.isArray(data)) {
      return data
    }
    items.push(...data.results)
    nextUrl = data.next
    queryParams = undefined
  }

  return items
}
