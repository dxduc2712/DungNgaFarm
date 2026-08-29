import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import PasswordInput from '../components/PasswordInput'
import {
  formErrorClass,
  inputClass,
  labelClass,
  linkClass,
  primaryButtonBlockClass,
} from '../components/formStyles'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const { t } = useTranslation()
  const { authenticated, register, loading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  if (authenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    clearError()
    setLocalError(null)

    if (password !== passwordConfirm) {
      setLocalError(t('register.passwordMismatch'))
      return
    }

    const ok = await register({
      email,
      password,
      password_confirm: passwordConfirm,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    })
    if (ok) navigate('/')
  }

  const displayError = localError || error

  return (
    <AuthLayout
      subtitle={t('register.subtitle')}
      footer={
        <p>
          {t('register.hasAccount')}{' '}
          <Link to="/login" className={linkClass}>
            {t('register.signIn')}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className={labelClass}>
          {t('register.email')}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={inputClass}
            required
          />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            {t('register.firstName')}
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            {t('register.lastName')}
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              className={inputClass}
            />
          </label>
        </div>
        <label className={labelClass}>
          {t('register.password')}
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        <label className={labelClass}>
          {t('register.passwordConfirm')}
          <PasswordInput
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        {displayError && (
          <p role="alert" className={formErrorClass}>
            {displayError}
          </p>
        )}
        <button type="submit" disabled={loading} className={primaryButtonBlockClass}>
          {loading ? t('register.submitting') : t('register.submit')}
        </button>
      </form>
    </AuthLayout>
  )
}
