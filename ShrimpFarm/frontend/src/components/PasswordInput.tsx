import { type InputHTMLAttributes, useLayoutEffect, useRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { passwordInputClass } from './formStyles'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

type SelectionSnapshot = {
  start: number
  end: number
  scrollLeft: number
}

export default function PasswordInput(props: PasswordInputProps) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const selectionRef = useRef<SelectionSnapshot | null>(null)
  const Icon = visible ? Eye : EyeOff

  useLayoutEffect(() => {
    const input = inputRef.current
    const selection = selectionRef.current
    if (!input || !selection) return

    selectionRef.current = null

    const restore = () => {
      input.focus()
      try {
        input.setSelectionRange(selection.start, selection.end)
      } catch {
        // Some browsers disallow selection APIs while type="password".
      }
      input.scrollLeft = selection.scrollLeft
    }

    restore()
    // Chrome can clobber selection again after the type change; restore once more.
    const frame = requestAnimationFrame(restore)
    return () => cancelAnimationFrame(frame)
  }, [visible])

  const toggleVisibility = () => {
    const input = inputRef.current
    if (input) {
      const start = input.selectionStart
      const end = input.selectionEnd
      selectionRef.current = {
        start: start ?? input.value.length,
        end: end ?? input.value.length,
        scrollLeft: input.scrollLeft,
      }
    }
    setVisible((current) => !current)
  }

  return (
    <div className="relative mt-1.5 min-w-0 w-full max-w-full overflow-x-clip">
      <input
        {...props}
        ref={inputRef}
        type={visible ? 'text' : 'password'}
        className={passwordInputClass}
      />
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          toggleVisibility()
        }}
        className="absolute inset-y-0 right-0 flex w-11 shrink-0 cursor-pointer items-center justify-center text-ink-muted transition hover:text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-aqua"
        aria-label={visible ? t('common.hidePassword') : t('common.showPassword')}
        aria-pressed={visible}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
      </button>
    </div>
  )
}
