'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  getLatestForSource,
  getSamplesForSource,
  getSources,
  setActiveSourceId,
  significantRise,
} from '@/lib/storage'
import type { Sample, WaterSource } from '@/types'
import ScoreHistoryChart from '@/components/ScoreHistoryChart'
import RiskBadge from '@/components/RiskBadge'
import { AlertTriangle, ArrowLeft, FlaskConical } from 'lucide-react'

export default function SourcePassportPage() {
  const params = useParams()
  const id = String(params.id || '')
  const [source, setSource] = useState<WaterSource | null>(null)
  const [history, setHistory] = useState<Sample[]>([])
  const [latest, setLatest] = useState<Sample | null>(null)

  useEffect(() => {
    const s = getSources().find((x) => x.id === id) || null
    setSource(s)
    setHistory(getSamplesForSource(id))
    setLatest(getLatestForSource(id))
    if (s) setActiveSourceId(s.id)
  }, [id])

  const points = useMemo(
    () => history.map((h) => ({ date: h.date, score: h.analysis.riskScore })),
    [history],
  )

  if (!source) {
    return (
      <div className="p-6">
        <p>Source not found.</p>
        <Link href="/sources">Back</Link>
      </div>
    )
  }

  const prev = history.length >= 2 ? history[history.length - 2] : null
  const avg =
    history.length > 1
      ? history.slice(0, -1).reduce((a, s) => a + s.analysis.riskScore, 0) / Math.max(history.length - 1, 1)
      : null
  const warn =
    latest && significantRise(latest.analysis.riskScore, prev?.analysis.riskScore ?? null, avg ?? undefined)
  const spanChange =
    points.length >= 2 ? points[points.length - 1].score - points[Math.max(0, points.length - 3)].score : null

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 pb-8">
      <div className="max-w-lg mx-auto">
        <Link href="/sources" className="inline-flex items-center gap-2 text-sm text-gray-500 mb-4">
          <ArrowLeft className="w-4 h-4" /> All sources
        </Link>
        <h1 className="text-3xl font-black text-gray-900">{source.name}</h1>
        <p className="text-gray-500 mt-1">
          {source.type}
          {source.location ? ` · ${source.location}` : ''}
        </p>

        <div className="mt-5 bg-white rounded-2xl border border-teal-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-teal-600">Latest AquaTrace Risk Score</p>
          {latest ? (
            <>
              <p className="text-4xl font-black text-gray-900 mt-2">
                {latest.analysis.riskScore}
                <span className="text-lg text-gray-400 font-bold">/100</span>
              </p>
              <div className="mt-2">
                <RiskBadge risk={latest.analysis.screeningCategory} />
              </div>
              <p className="text-sm text-gray-500 mt-3">Latest test: {latest.date}</p>
            </>
          ) : (
            <p className="mt-2 text-gray-500">No tests yet.</p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Completed tests</p>
            <p className="text-2xl font-black text-gray-900">{history.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Next recommended</p>
            <p className="text-lg font-bold text-gray-900">{source.nextTestDate || '—'}</p>
          </div>
        </div>

        {warn && (
          <div className="mt-4 flex gap-2 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            Your current result is significantly higher than the normal range for this water source. We recommend
            repeating the test.
          </div>
        )}

        <div className="mt-5">
          <h3 className="font-bold text-gray-900 mb-2">Historical score chart</h3>
          <ScoreHistoryChart points={points} />
          {spanChange != null && points.length >= 2 && (
            <p className="mt-2 text-sm text-gray-600">
              Risk {spanChange >= 0 ? 'increased' : 'decreased'} by{' '}
              <strong>
                {spanChange > 0 ? '+' : ''}
                {spanChange}
              </strong>{' '}
              points over the last tracked tests.
            </p>
          )}
        </div>

        <div className="mt-5 space-y-2">
          <h3 className="font-bold text-gray-900">Test log</h3>
          {[...history].reverse().map((h) => (
            <div key={h.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex justify-between">
              <span className="text-sm text-gray-600">{h.date}</span>
              <span className="font-bold text-gray-900">{h.analysis.riskScore}/100</span>
            </div>
          ))}
        </div>

        <Link
          href="/test"
          className="mt-6 flex items-center justify-center gap-2 w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3.5 rounded-xl font-bold"
        >
          <FlaskConical className="w-5 h-5" />
          Test this source
        </Link>
      </div>
    </div>
  )
}
