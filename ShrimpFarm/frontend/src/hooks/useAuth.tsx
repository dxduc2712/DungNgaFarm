import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import i18n from '../i18n'
import { clearToken, isAuthenticated as checkAuth, setToken } from '../api/client'
import {
  endpoints,
  type ProfileUpdatePayload,
  type RegisterPayload,
  type User,
} from '../api/endpoints'

export function getDisplayName(user: User | null | undefined): string {
  if (!user) return ''
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
  if (fullName) return fullName
  if (user.username) return user.username
  if (user.email) return user.email.split('@')[0]
  return ''
}

export function getUserInitials(user: User | null | undefined): string {
  if (!user) return '?'
  const first = user.first_name?.trim()?.[0]
  const last = user.last_name?.trim()?.[0]
  if (first && last) return `${first}${last}`.toUpperCase()
  if (first) return first.toUpperCase()
  const fallback = getDisplayName(user)
  return (fallback[0] || '?').toUpperCase()
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return fallback
  }
  const data = (error as { response?: { data?: unknown } }).response?.data
  if (!data || typeof data !== 'object') return fallback

  const record = data as Record<string, unknown>
  if (typeof record.detail === 'string') return record.detail

  for (const value of Object.values(record)) {
    if (typeof value === 'string') return value
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  }
  return fallback
}

interface AuthContextValue {
  authenticated: boolean
  user: User | null
  displayName: string
  initials: string
  isAdmin: boolean
  loading: boolean
  sessionReady: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  register: (data: RegisterPayload) => Promise<boolean>
  refreshUser: () => Promise<User | null>
  updateProfile: (data: ProfileUpdatePayload) => Promise<User>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function loadUserProfile(): Promise<User | null> {
  try {
    const response = await endpoints.me()
    return response.data
  } catch {
    clearToken()
    return null
  }
}

async function ensureDjangoSession(isStaff: boolean): Promise<boolean> {
  if (!isStaff) {
    return true
  }
  try {
    await endpoints.createDjangoSession()
    return true
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(checkAuth())
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(checkAuth())
  const [sessionReady, setSessionReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bootstrap = useCallback(async () => {
    if (!checkAuth()) {
      setAuthenticated(false)
      setUser(null)
      setSessionReady(false)
      setLoading(false)
      return
    }

    setLoading(true)
    const profile = await loadUserProfile()
    if (!profile) {
      setAuthenticated(false)
      setUser(null)
      setSessionReady(false)
      setLoading(false)
      return
    }

    setUser(profile)
    setAuthenticated(true)
    const ready = await ensureDjangoSession(profile.is_staff)
    setSessionReady(ready)
    setLoading(false)
  }, [])

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  const applyAuthenticatedUser = useCallback(async (profile: User) => {
    setUser(profile)
    setAuthenticated(true)
    const ready = await ensureDjangoSession(profile.is_staff)
    setSessionReady(ready)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await endpoints.login(username, password)
      setToken(response.data.access)

      const profile = await loadUserProfile()
      if (!profile) {
        clearToken()
        setAuthenticated(false)
        setUser(null)
        setSessionReady(false)
        setError(i18n.t('login.invalidCredentials'))
        return false
      }

      await applyAuthenticatedUser(profile)
      return true
    } catch (err) {
      setError(extractErrorMessage(err, i18n.t('login.invalidCredentials')))
      setAuthenticated(false)
      setUser(null)
      setSessionReady(false)
      return false
    } finally {
      setLoading(false)
    }
  }, [applyAuthenticatedUser])

  const register = useCallback(
    async (data: RegisterPayload) => {
      setLoading(true)
      setError(null)
      try {
        const response = await endpoints.register(data)
        setToken(response.data.access)
        await applyAuthenticatedUser(response.data.user)
        return true
      } catch (err) {
        setError(extractErrorMessage(err, i18n.t('register.failed')))
        setAuthenticated(false)
        setUser(null)
        setSessionReady(false)
        return false
      } finally {
        setLoading(false)
      }
    },
    [applyAuthenticatedUser],
  )

  const refreshUser = useCallback(async () => {
    const profile = await loadUserProfile()
    if (!profile) {
      setAuthenticated(false)
      setUser(null)
      setSessionReady(false)
      return null
    }
    setUser(profile)
    setAuthenticated(true)
    return profile
  }, [])

  const updateProfile = useCallback(async (data: ProfileUpdatePayload) => {
    const response = await endpoints.updateProfile(data)
    setUser(response.data)
    return response.data
  }, [])

  const logout = useCallback(async () => {
    try {
      await endpoints.logout()
    } catch {
      // JWT clear below is enough for non-staff users
    }
    clearToken()
    setAuthenticated(false)
    setUser(null)
    setSessionReady(false)
    setError(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo(
    () => ({
      authenticated,
      user,
      displayName: getDisplayName(user),
      initials: getUserInitials(user),
      isAdmin: Boolean(user?.is_staff),
      loading,
      sessionReady,
      error,
      login,
      register,
      refreshUser,
      updateProfile,
      logout,
      clearError,
    }),
    [
      authenticated,
      user,
      loading,
      sessionReady,
      error,
      login,
      register,
      refreshUser,
      updateProfile,
      logout,
      clearError,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
