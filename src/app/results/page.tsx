'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { clearPendingResult, getActiveSourceId, getLatestForSource, getPendingResult, getSamplesForSource, significantRise } from '@/lib/storage'
import type { Sample } from '@/types'
import RiskScoreCard from '@/components/RiskScoreCard'
import ScoreHistoryChart from '@/components/ScoreHistoryChart'
import DisclaimerBox from '@/components/DisclaimerBox'
import { AlertTriangle, ArrowLeft, FlaskConical } from 'lucide-react'

export default function ResultsPage() {
  const router = useRouter()
  const [sample, setSample] = useState<Sample | null>(null)
  const [history, setHistory] = useState<Sample[]>([])

  useEffect(() => {
    const pending = getPendingResult()
    if (pending) {
      setSample(pending)
      setHistory(getSamplesForSource(pending.sourceId))
      return
    }
    const latest = getLatestForSource(getActiveSourceId())
    if (!latest) {
      router.replace('/test')
      return
    }
    setSample(latest)
    setHistory(getSamplesForSource(latest.sourceId))
  }, [router])

  const points = useMemo(
    () => history.map((h) => ({ date: h.date, score: h.analysis.riskScore })),
    [history],
  )

  if (!sample) return null

  const prev = history.length >= 2 ? history[history.length - 2] : null
  const avg =
    history.length > 1
      ? history.slice(0, -1).reduce((a, s) => a + s.analysis.riskScore, 0) / Math.max(history.length - 1, 1)
      : null
  const warn = significantRise(sample.analysis.riskScore, prev?.analysis.riskScore ?? null, avg ?? undefined)

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 pb-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/"
            onClick={clearPendingResult}
            className="p-2 rounded-xl bg-white border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Screening result</h1>
            <p className="text-sm text-gray-500">
              {sample.locationName} · {sample.date}
            </p>
          </div>
        </div>

        <DisclaimerBox />

        {sample.imageDataUrl && (
          <div className="mt-4 rounded-2xl overflow-hidden border border-gray-100">
            <img src={sample.imageDataUrl} alt="Membrane" className="w-full h-44 object-cover" />
          </div>
        )}

        <div className="mt-4">
          <RiskScoreCard analysis={sample.analysis} />
        </div>

        {warn && (
          <div className="mt-4 flex gap-2 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            Your current result is significantly higher than the normal range for this water source. We recommend
            repeating the test.
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            { label: 'Suspicious objects', value: sample.analysis.suspectedParticles },
            { label: 'Fibers (visual)', value: sample.analysis.fiberCount },
            { label: 'Fragments (visual)', value: sample.analysis.fragmentCount },
            { label: 'Density index', value: sample.analysis.contaminationDensity },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <h3 className="font-bold text-gray-900 mb-2">Compare with previous tests</h3>
          <ScoreHistoryChart points={points} />
          {prev && (
            <p className="mt-2 text-sm text-gray-600">
              Previous score for this source: <strong>{prev.analysis.riskScore}/100</strong> (
              {prev.analysis.screeningCategory}) on {prev.date}.
            </p>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-500 leading-relaxed">
          Counts refer to visually distinguishable suspicious particles on the membrane image. They are not a certified
          microplastic speciation result.
        </p>

        <div className="mt-4 space-y-3">
          <Link
            href={`/sources/${sample.sourceId}`}
            className="flex items-center justify-center gap-2 w-full bg-white border border-teal-200 text-teal-800 py-3.5 rounded-xl font-semibold"
          >
            Open Water Source Passport
          </Link>
          <Link
            href="/test"
            onClick={clearPendingResult}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3.5 rounded-xl font-bold"
          >
            <FlaskConical className="w-5 h-5" />
            New test
          </Link>
        </div>
      </div>
    </div>
  )
}
