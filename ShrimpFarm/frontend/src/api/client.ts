const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const getToken = () => localStorage.getItem('access_token')

export const setToken = (token: string) => {
  localStorage.setItem('access_token', token)
}

export const clearToken = () => {
  localStorage.removeItem('access_token')
}

export const isAuthenticated = () => Boolean(getToken())

export { API_BASE_URL }
