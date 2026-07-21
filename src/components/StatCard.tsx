import { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: 'teal' | 'blue' | 'red' | 'amber' | 'green'
}

const colorMap = {
  teal: 'bg-teal-50 text-teal-600',
  blue: 'bg-blue-50 text-blue-600',
  red: 'bg-red-50 text-red-600',
  amber: 'bg-amber-50 text-amber-600',
  green: 'bg-green-50 text-green-600',
}

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'teal' }: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', colorMap[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
