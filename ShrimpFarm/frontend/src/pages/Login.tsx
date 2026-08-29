import { type FormEvent, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import PasswordInput from '../components/PasswordInput'
import {
  formErrorClass,
  formSuccessClass,
  inputClass,
  labelClass,
  linkClass,
  primaryButtonBlockClass,
} from '../components/formStyles'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { t } = useTranslation()
  const { authenticated, login, loading, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const passwordUpdated = Boolean(
    (location.state as { passwordUpdated?: boolean } | null)?.passwordUpdated,
  )

  if (authenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const ok = await login(username, password)
    if (ok) navigate('/')
  }

  return (
    <AuthLayout
      subtitle={t('login.subtitle')}
      footer={
        <p>
          {t('login.noAccount')}{' '}
          <Link to="/register" className={linkClass}>
            {t('login.createAccount')}
          </Link>
        </p>
      }
    >
      {passwordUpdated && (
        <p role="status" className={`mb-5 ${formSuccessClass}`}>
          {t('login.passwordUpdated')}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className={labelClass}>
          {t('login.usernameOrEmail')}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className={inputClass}
            required
          />
        </label>
        <label className={labelClass}>
          <span className="flex min-w-0 items-center justify-between gap-3">
            <span className="min-w-0">{t('login.password')}</span>
            <Link to="/forgot-password" className={`min-w-0 text-xs font-medium ${linkClass}`}>
              {t('login.forgotPassword')}
            </Link>
          </span>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && (
          <p role="alert" className={formErrorClass}>
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className={primaryButtonBlockClass}>
          {loading ? t('login.submitting') : t('login.submit')}
        </button>
      </form>
    </AuthLayout>
  )
}
