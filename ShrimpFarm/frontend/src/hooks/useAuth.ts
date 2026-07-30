import { useCallback, useEffect, useState } from 'react'
import i18n from '../i18n'
import { clearToken, isAuthenticated as checkAuth, setToken } from '../api/client'
import { endpoints } from '../api/endpoints'

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(checkAuth())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await endpoints.login(username, password)
      setToken(response.data.access)
      setAuthenticated(true)
      return true
    } catch {
      setError(i18n.t('login.invalidCredentials'))
      setAuthenticated(false)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setAuthenticated(false)
  }, [])

  useEffect(() => {
    setAuthenticated(checkAuth())
  }, [])

  return { authenticated, loading, error, login, logout }
}
