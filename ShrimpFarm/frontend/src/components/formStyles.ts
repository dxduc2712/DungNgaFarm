/** Shared form control classes for auth + account surfaces. */

export const labelClass = 'block text-sm font-medium text-ink'

export const inputClass =
  'mt-1.5 w-full min-w-0 max-w-full rounded-xl border border-border-soft bg-white px-3.5 py-2.5 text-base text-ink shadow-sm outline-none transition placeholder:text-ink-faint focus:border-aqua focus:ring-2 focus:ring-aqua/20 disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-muted'

export const inputReadonlyClass =
  'mt-1.5 w-full min-w-0 max-w-full cursor-default rounded-xl border border-border-soft bg-surface px-3.5 py-2.5 text-base text-ink-muted outline-none'

export const primaryButtonClass =
  'inline-flex items-center justify-center rounded-xl bg-forest px-4 py-2.5 text-base font-semibold text-white no-underline shadow-sm transition hover:bg-forest-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-60'

export const primaryButtonBlockClass = `${primaryButtonClass} w-full`

export const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-xl border border-border-soft bg-white px-4 py-2.5 text-base font-medium text-ink shadow-sm transition hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua'

export const linkClass =
  'font-medium text-aqua-dark transition hover:text-forest hover:underline'

export const hintClass = 'mt-1.5 block text-xs text-ink-muted'

export const formErrorClass =
  'rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700'

export const formSuccessClass =
  'rounded-xl border border-aqua/20 bg-aqua-soft px-3.5 py-2.5 text-sm text-forest'

export const sectionCardClass =
  'rounded-2xl border border-border-soft bg-card p-5 shadow-[var(--shadow-card)] sm:p-6'
