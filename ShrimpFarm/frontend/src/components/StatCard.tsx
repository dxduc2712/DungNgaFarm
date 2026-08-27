import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="min-w-0 rounded-2xl border border-border-soft bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-muted">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-forest">{value}</p>
        </div>
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-aqua-soft text-aqua-dark [&_svg]:h-5 [&_svg]:w-5">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
