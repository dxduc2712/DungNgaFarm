import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        {icon && <div className="text-teal-600">{icon}</div>}
      </div>
    </div>
  )
}
