import { type FormEvent, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import {
  formErrorClass,
  formSuccessClass,
  inputClass,
  labelClass,
  linkClass,
  primaryButtonBlockClass,
} from '../components/formStyles'
import { endpoints } from '../api/endpoints'
import { useAuth } from '../hooks/useAuth'

export default function ForgotPassword() {
  const { t } = useTranslation()
  const { authenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (authenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await endpoints.passwordReset(email.trim())
      setSubmitted(true)
    } catch {
      // Still show success to avoid enumeration if the request reaches the server
      // with a network-level failure we show a generic error.
      setError(t('forgotPassword.requestFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      subtitle={t('forgotPassword.subtitle')}
      footer={
        !submitted ? (
          <Link to="/login" className={linkClass}>
            {t('forgotPassword.backToLogin')}
          </Link>
        ) : null
      }
    >
      {submitted ? (
        <div className="space-y-5">
          <p role="status" className={formSuccessClass}>
            {t('forgotPassword.success')}
          </p>
          <Link to="/login" className={primaryButtonBlockClass}>
            {t('forgotPassword.backToLogin')}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className={labelClass}>
            {t('forgotPassword.email')}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={inputClass}
              required
            />
          </label>
          {error && (
            <p role="alert" className={formErrorClass}>
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} className={primaryButtonBlockClass}>
            {loading ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
