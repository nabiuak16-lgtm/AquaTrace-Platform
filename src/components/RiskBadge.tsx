import type { RiskLevel, ScreeningRiskCategory } from '@/types'
import { getRiskBg } from '@/lib/risk'
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  risk: RiskLevel | ScreeningRiskCategory
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export default function RiskBadge({ risk, size = 'md', label }: Props) {
  const key = risk.includes('Low') ? 'Low' : risk.includes('Medium') ? 'Medium' : 'High'
  const Icon = key === 'Low' ? CheckCircle : key === 'Medium' ? AlertCircle : AlertTriangle
  const text = label || (risk.includes('Screening') ? risk : `${risk} Screening Risk`)

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        getRiskBg(risk),
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        size === 'lg' && 'px-5 py-2 text-base',
      )}
    >
      <Icon className={clsx(size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5')} />
      {text}
    </span>
  )
}
