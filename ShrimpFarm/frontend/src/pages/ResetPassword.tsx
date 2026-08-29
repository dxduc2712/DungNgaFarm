import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import PasswordInput from '../components/PasswordInput'
import {
  formErrorClass,
  labelClass,
  linkClass,
  primaryButtonBlockClass,
} from '../components/formStyles'
import { endpoints } from '../api/endpoints'
import { useAuth } from '../hooks/useAuth'

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

export default function ResetPassword() {
  const { t } = useTranslation()
  const { authenticated } = useAuth()
  const { uid = '', token = '' } = useParams<{ uid: string; token: string }>()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (authenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (password !== passwordConfirm) {
      setError(t('resetPassword.passwordMismatch'))
      return
    }

    setLoading(true)
    try {
      await endpoints.passwordResetConfirm({
        uid,
        token,
        new_password: password,
        new_password_confirm: passwordConfirm,
      })
      navigate('/login', { state: { passwordUpdated: true } })
    } catch (err) {
      setError(extractErrorMessage(err, t('resetPassword.failed')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      subtitle={t('resetPassword.subtitle')}
      footer={
        <Link to="/login" className={linkClass}>
          {t('resetPassword.backToLogin')}
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className={labelClass}>
          {t('resetPassword.newPassword')}
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        <label className={labelClass}>
          {t('resetPassword.passwordConfirm')}
          <PasswordInput
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        {error && (
          <p role="alert" className={formErrorClass}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !uid || !token}
          className={primaryButtonBlockClass}
        >
          {loading ? t('resetPassword.submitting') : t('resetPassword.submit')}
        </button>
      </form>
    </AuthLayout>
  )
}
