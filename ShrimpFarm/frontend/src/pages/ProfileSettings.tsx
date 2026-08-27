import { type FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  formErrorClass,
  formSuccessClass,
  hintClass,
  inputClass,
  inputReadonlyClass,
  labelClass,
  primaryButtonClass,
  sectionCardClass,
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

export default function ProfileSettings() {
  const { t } = useTranslation()
  const { user, updateProfile, initials, displayName } = useAuth()
  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName, setLastName] = useState(user?.last_name || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    setFirstName(user?.first_name || '')
    setLastName(user?.last_name || '')
  }, [user])

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setProfileSaving(true)
    setProfileMessage(null)
    setProfileError(null)
    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      })
      setProfileMessage(t('profile.saveSuccess'))
    } catch (err) {
      setProfileError(extractErrorMessage(err, t('profile.saveFailed')))
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setPasswordMessage(null)
    setPasswordError(null)

    if (newPassword !== newPasswordConfirm) {
      setPasswordError(t('profile.passwordMismatch'))
      return
    }

    setPasswordSaving(true)
    try {
      await endpoints.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      })
      setPasswordMessage(t('profile.passwordSuccess'))
      setCurrentPassword('')
      setNewPassword('')
      setNewPasswordConfirm('')
    } catch (err) {
      setPasswordError(extractErrorMessage(err, t('profile.passwordFailed')))
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-aqua-soft text-lg font-semibold text-forest"
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {t('profile.title')}
          </h1>
          <p className="mt-1 text-ink-muted">{t('profile.subtitle')}</p>
          {(displayName || user?.email) && (
            <p className="mt-1 truncate text-sm text-ink-faint">
              {displayName}
              {displayName && user?.email ? ' · ' : ''}
              {user?.email}
            </p>
          )}
        </div>
      </div>

      <section className={sectionCardClass}>
        <div className="border-b border-border-soft pb-4">
          <h2 className="text-lg font-semibold text-ink">{t('profile.accountSection')}</h2>
          <p className="mt-1 text-sm text-ink-muted">{t('profile.accountDescription')}</p>
        </div>
        <form onSubmit={handleProfileSubmit} className="mt-5 space-y-4">
          <label className={labelClass}>
            {t('profile.email')}
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className={inputReadonlyClass}
            />
            <span className={hintClass}>{t('profile.emailReadonly')}</span>
          </label>
          <label className={labelClass}>
            {t('profile.username')}
            <input
              type="text"
              value={user?.username || ''}
              readOnly
              className={inputReadonlyClass}
            />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              {t('profile.firstName')}
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              {t('profile.lastName')}
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                className={inputClass}
              />
            </label>
          </div>
          {profileMessage && (
            <p role="status" className={formSuccessClass}>
              {profileMessage}
            </p>
          )}
          {profileError && (
            <p role="alert" className={formErrorClass}>
              {profileError}
            </p>
          )}
          <div className="pt-1">
            <button type="submit" disabled={profileSaving} className={primaryButtonClass}>
              {profileSaving ? t('profile.saving') : t('profile.save')}
            </button>
          </div>
        </form>
      </section>

      <section className={sectionCardClass}>
        <div className="border-b border-border-soft pb-4">
          <h2 className="text-lg font-semibold text-ink">{t('profile.passwordSection')}</h2>
          <p className="mt-1 text-sm text-ink-muted">{t('profile.passwordDescription')}</p>
        </div>
        <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
          <label className={labelClass}>
            {t('profile.currentPassword')}
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className={inputClass}
              required
            />
          </label>
          <label className={labelClass}>
            {t('profile.newPassword')}
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className={inputClass}
              required
            />
          </label>
          <label className={labelClass}>
            {t('profile.newPasswordConfirm')}
            <input
              type="password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              autoComplete="new-password"
              className={inputClass}
              required
            />
          </label>
          {passwordMessage && (
            <p role="status" className={formSuccessClass}>
              {passwordMessage}
            </p>
          )}
          {passwordError && (
            <p role="alert" className={formErrorClass}>
              {passwordError}
            </p>
          )}
          <div className="pt-1">
            <button type="submit" disabled={passwordSaving} className={primaryButtonClass}>
              {passwordSaving ? t('profile.changingPassword') : t('profile.changePassword')}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
