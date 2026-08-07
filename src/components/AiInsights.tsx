'use client'
import { useCallback, useEffect, useState } from 'react'
import { Sparkles, TrendingDown, TrendingUp, Minus, HelpCircle, RefreshCw } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import type { Sample } from '@/types'

interface Insights {
  summary: string
  recommendations: string[]
  trend: 'improving' | 'stable' | 'worsening' | 'unknown'
  fallback: boolean
}

const STRINGS = {
  en: {
    title: 'AI Analysis',
    subtitle: 'AI interpretation of your result (Gemini)',
    loading: 'Analysing your result…',
    error: 'AI analysis is unavailable right now.',
    retry: 'Try again',
    recommendations: 'Recommendations',
    fallbackNote: 'Basic analysis shown (AI service not configured).',
    trends: {
      improving: 'Improving',
      stable: 'Stable',
      worsening: 'Worsening',
      unknown: 'No trend yet',
    },
  },
  ru: {
    title: 'AI-анализ',
    subtitle: 'AI-интерпретация результата (Gemini)',
    loading: 'Анализируем ваш результат…',
    error: 'AI-анализ сейчас недоступен.',
    retry: 'Повторить',
    recommendations: 'Рекомендации',
    fallbackNote: 'Показан базовый анализ (AI-сервис не настроен).',
    trends: {
      improving: 'Улучшается',
      stable: 'Стабильно',
      worsening: 'Ухудшается',
      unknown: 'Тренда пока нет',
    },
  },
} as const

const CACHE_KEY = 'aquatrace_ai_insights_v1'

/**
 * Per-sample localStorage cache so revisiting a result never
 * re-sends the same request to GPT.
 */
function readCache(key: string): Insights | null {
  try {
    const all = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    return all[key] || null
  } catch {
    return null
  }
}

function writeCache(key: string, data: Insights): void {
  try {
    const all = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    const keys = Object.keys(all)
    if (keys.length >= 30) delete all[keys[0]]
    all[key] = data
    localStorage.setItem(CACHE_KEY, JSON.stringify(all))
  } catch {
    // storage full — skip caching
  }
}

const TREND_STYLE = {
  improving: { icon: TrendingDown, cls: 'bg-teal-50 text-teal-700 border-teal-200' },
  stable: { icon: Minus, cls: 'bg-gray-50 text-gray-600 border-gray-200' },
  worsening: { icon: TrendingUp, cls: 'bg-red-50 text-red-700 border-red-200' },
  unknown: { icon: HelpCircle, cls: 'bg-gray-50 text-gray-500 border-gray-200' },
} as const

export default function AiInsights({
  sample,
  history,
}: {
  sample: Sample
  history: { date: string; score: number }[]
}) {
  const { lang } = useLang()
  const t = STRINGS[lang]
  const [insights, setInsights] = useState<Insights | null>(null)
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')

  const load = useCallback(
    async (force = false) => {
      const cacheKey = `${sample.id}_${sample.analysis.riskScore}_${lang}`
      if (!force) {
        const cached = readCache(cacheKey)
        if (cached) {
          setInsights(cached)
          setStatus('done')
          return
        }
      }
      setStatus('loading')
      try {
        const res = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lang,
            sample: {
              id: sample.id,
              locationName: sample.locationName,
              waterSource: sample.waterSource,
              date: sample.date,
              riskScore: sample.analysis.riskScore,
              screeningCategory: sample.analysis.screeningCategory,
              suspectedParticles: sample.analysis.suspectedParticles,
              fiberCount: sample.analysis.fiberCount,
              fragmentCount: sample.analysis.fragmentCount,
              contaminationDensity: sample.analysis.contaminationDensity,
              changeSincePrevious: sample.analysis.changeSincePrevious,
            },
            history,
          }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: Insights = await res.json()
        setInsights(data)
        setStatus('done')
        // Don't cache fallback answers, so real AI kicks in once configured.
        if (!data.fallback) writeCache(cacheKey, data)
      } catch {
        setStatus('error')
      }
    },
    [sample, history, lang],
  )

  useEffect(() => {
    load()
  }, [load])

  const trend = insights ? TREND_STYLE[insights.trend] : null
  const TrendIcon = trend?.icon

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-teal-50/60 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">{t.title}</h3>
            <p className="text-xs text-gray-500">{t.subtitle}</p>
          </div>
        </div>
        {insights && trend && TrendIcon && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${trend.cls}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            {t.trends[insights.trend]}
          </span>
        )}
      </div>

      {status === 'loading' && (
        <div className="mt-3 space-y-2 animate-pulse" aria-label={t.loading}>
          <div className="h-3 bg-indigo-100/80 rounded w-full" />
          <div className="h-3 bg-indigo-100/80 rounded w-5/6" />
          <div className="h-3 bg-indigo-100/80 rounded w-2/3" />
        </div>
      )}

      {status === 'error' && (
        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-gray-600">
          <span>{t.error}</span>
          <button
            onClick={() => load(true)}
            className="flex items-center gap-1.5 text-indigo-700 font-semibold text-sm px-3 py-1.5 rounded-lg border border-indigo-200 bg-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t.retry}
          </button>
        </div>
      )}

      {status === 'done' && insights && (
        <div className="mt-3">
          <p className="text-sm text-gray-700 leading-relaxed">{insights.summary}</p>
          {insights.recommendations.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-700 mb-1.5">
                {t.recommendations}
              </p>
              <ul className="space-y-1.5">
                {insights.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700 leading-snug">
                    <span className="text-indigo-500 mt-0.5 shrink-0">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {insights.fallback && (
            <p className="mt-3 text-[11px] text-gray-400">{t.fallbackNote}</p>
          )}
        </div>
      )}
    </div>
  )
}
