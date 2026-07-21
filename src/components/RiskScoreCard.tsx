'use client'
import type { AnalysisResult } from '@/types'
import { scoreRingColor } from '@/lib/risk'
import clsx from 'clsx'

interface Props {
  analysis: AnalysisResult
  compact?: boolean
  showDetails?: boolean
}

export default function RiskScoreCard({ analysis, compact, showDetails = true }: Props) {
  const color = scoreRingColor(analysis.riskScore)
  const change = analysis.changeSincePrevious

  return (
    <div className={clsx('bg-white rounded-2xl border border-teal-100 shadow-sm', compact ? 'p-4' : 'p-5')}>
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">AquaTrace Risk Score</p>
      <div className="mt-3 flex items-center gap-4">
        <div
          className="relative w-24 h-24 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: `conic-gradient(${color} ${analysis.riskScore * 3.6}deg, #e5e7eb 0deg)`,
          }}
        >
          <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-gray-900 leading-none">{analysis.riskScore}</span>
            <span className="text-[10px] text-gray-400 font-medium">/100</span>
          </div>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 leading-snug">{analysis.screeningCategory}</p>
          <p className="text-xs text-gray-500 mt-1">Particle Screening Score</p>
          {change != null && (
            <p className={clsx('text-sm font-semibold mt-2', change > 0 ? 'text-red-600' : change < 0 ? 'text-teal-600' : 'text-gray-500')}>
              Change since previous test: {change > 0 ? '+' : ''}
              {change} points
            </p>
          )}
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-[11px] text-gray-500">Particle density</p>
            <p className="font-bold text-gray-900">{analysis.particleDensity}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-[11px] text-gray-500">Image confidence</p>
            <p className="font-bold text-gray-900">{analysis.confidenceScore}%</p>
          </div>
        </div>
      )}

      {showDetails && (
        <div className="mt-3 rounded-xl bg-teal-50 border border-teal-100 p-3">
          <p className="text-[11px] font-semibold text-teal-700 uppercase">Recommendation</p>
          <p className="text-sm text-teal-900 mt-1 leading-relaxed">{analysis.recommendation}</p>
        </div>
      )}
    </div>
  )
}
