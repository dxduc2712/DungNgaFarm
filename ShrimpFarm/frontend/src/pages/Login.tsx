import { type FormEvent, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { t } = useTranslation()
  const { authenticated, login, loading, error } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  if (authenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const ok = await login(username, password)
    if (ok) navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-teal-700">{t('common.appName')}</h1>
          <p className="mt-1 text-gray-500">{t('login.subtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm">
            <span className="text-gray-600">{t('login.username')}</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-3 text-base"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="text-gray-600">{t('login.password')}</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-3 text-base"
              required
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-600 px-4 py-3 text-base font-medium text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {loading ? t('login.submitting') : t('login.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
