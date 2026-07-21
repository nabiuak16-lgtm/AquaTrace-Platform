'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import PhotoQualityCamera from '@/components/PhotoQualityCamera'
import DisclaimerBox from '@/components/DisclaimerBox'
import { runMockAnalysis } from '@/lib/data'
import {
  clearCompareSession,
  getCompareSession,
  getMembranes,
  saveUserSample,
  setCompareSession,
  setPendingResult,
} from '@/lib/storage'
import type { Sample } from '@/types'
import { ArrowDown, ArrowRightLeft, CheckCircle2, Loader2 } from 'lucide-react'
import RiskBadge from '@/components/RiskBadge'

type Phase = 'intro' | 'before' | 'after' | 'result'

export default function ComparePage() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [before, setBefore] = useState<Sample | null>(null)
  const [after, setAfter] = useState<Sample | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const session = getCompareSession()
    if (session.before && session.after) {
      setBefore(session.before)
      setAfter(session.after)
      setPhase('result')
    } else if (session.before) {
      setBefore(session.before)
      setPhase('after')
    }
  }, [])

  const runStep = async (role: 'before' | 'after', imageDataUrl: string) => {
    const inv = getMembranes()
    if (inv.remaining <= 0) {
      alert('No membranes remaining. Buy a refill in Shop.')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 350))
    const bias = role === 'before' ? 'high' : 'low'
    const analysis = runMockAnalysis(500, null, bias)
    const sample: Sample = {
      id: `cmp-${role}-${Date.now()}`,
      sourceId: role === 'before' ? 'src-kitchen-tap' : 'src-after-filter',
      locationName: role === 'before' ? 'Before Filter' : 'After Filter',
      waterSource: role === 'before' ? 'Tap' : 'After filter',
      volumeFiltered: 500,
      latitude: 51.18,
      longitude: 71.44,
      notes: `Compare mode · ${role}`,
      imageDataUrl,
      date: new Date().toISOString().slice(0, 10),
      analysis,
      possibleSource: 'Filter comparison screening',
      submittedToMap: false,
      comparePairId: before?.comparePairId || `pair-${Date.now()}`,
      compareRole: role,
    }
    saveUserSample(sample)
    if (role === 'before') {
      setBefore(sample)
      setCompareSession({ before: sample })
      setPhase('after')
    } else {
      const pair = { before: before!, after: sample }
      setAfter(sample)
      setCompareSession(pair)
      setPendingResult(sample)
      setPhase('result')
    }
    setLoading(false)
  }

  const reduction =
    before && after
      ? Math.max(0, Math.round(((before.analysis.riskScore - after.analysis.riskScore) / Math.max(before.analysis.riskScore, 1)) * 100))
      : 0

  const improved = before && after ? before.analysis.riskScore - after.analysis.riskScore >= 10 : false

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 pb-8">
      <div className="max-w-lg mx-auto">
        <p className="text-sm font-semibold text-teal-600">Compare mode</p>
        <h1 className="text-3xl font-black text-gray-900">Before & After Filter</h1>
        <p className="text-sm text-gray-500 mt-1">
          Two membrane tests. Compare AquaTrace Risk Scores and visually detected particle levels.
        </p>

        <div className="mt-4">
          <DisclaimerBox />
        </div>

        {phase === 'intro' && (
          <div className="mt-5 bg-white rounded-2xl border border-teal-100 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center font-black text-teal-700">
                1
              </div>
              <p className="font-semibold text-gray-900">Test water before filtration</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-black text-blue-700">
                2
              </div>
              <p className="font-semibold text-gray-900">Test water after filtration</p>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Uses two single-use membranes. Percentage change reflects visually detected suspicious particles — not a
              certified filtration-efficiency measurement.
            </p>
            <button
              type="button"
              onClick={() => {
                clearCompareSession()
                setBefore(null)
                setAfter(null)
                setPhase('before')
              }}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3.5 rounded-xl font-bold inline-flex items-center justify-center gap-2"
            >
              <ArrowRightLeft className="w-5 h-5" />
              Start comparison
            </button>
          </div>
        )}

        {(phase === 'before' || phase === 'after') && (
          <div className="mt-5 space-y-4">
            <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 text-sm font-semibold text-teal-900">
              Step {phase === 'before' ? '1' : '2'}: Test water {phase === 'before' ? 'before' : 'after'} filtration
            </div>
            {loading ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto" />
                <p className="mt-3 font-bold text-gray-900">Calculating Risk Score…</p>
              </div>
            ) : (
              <PhotoQualityCamera onCapture={(url) => runStep(phase, url)} />
            )}
            {before && phase === 'after' && (
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-sm text-gray-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500" />
                Before Filter saved: {before.analysis.riskScore}/100
              </div>
            )}
          </div>
        )}

        {phase === 'result' && before && after && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="bg-white rounded-2xl border border-red-100 p-4 text-center">
                <p className="text-xs font-semibold text-gray-500">Before Filter</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{before.analysis.riskScore}</p>
                <div className="mt-2 flex justify-center">
                  <RiskBadge risk={before.analysis.screeningCategory} size="sm" />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-teal-100 p-4 text-center">
                <p className="text-xs font-semibold text-gray-500">After Filter</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{after.analysis.riskScore}</p>
                <div className="mt-2 flex justify-center">
                  <RiskBadge risk={after.analysis.screeningCategory} size="sm" />
                </div>
              </div>
            </div>

            <div className="flex justify-center text-teal-600">
              <ArrowDown className="w-6 h-6" />
            </div>

            <div className="bg-gradient-to-br from-teal-500 to-blue-600 text-white rounded-2xl p-5 text-center shadow-md">
              <p className="text-sm font-semibold text-teal-100">Estimated reduction in detected particles</p>
              <p className="text-5xl font-black mt-1">{reduction}%</p>
              <p className="text-xs text-teal-100 mt-2 leading-relaxed">
                Change in visually detected suspicious particles — not certified filter efficiency.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">Before-and-after chart</p>
              <div className="flex items-end gap-6 h-36 justify-center">
                <div className="flex flex-col items-center gap-2 justify-end h-full">
                  <div
                    className="w-16 rounded-t-xl bg-red-400"
                    style={{ height: `${Math.max(16, before.analysis.riskScore * 1.1)}px` }}
                  />
                  <span className="text-xs text-gray-500">Before</span>
                </div>
                <div className="flex flex-col items-center gap-2 justify-end h-full">
                  <div
                    className="w-16 rounded-t-xl bg-teal-500"
                    style={{ height: `${Math.max(16, after.analysis.riskScore * 1.1)}px` }}
                  />
                  <span className="text-xs text-gray-500">After</span>
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl p-4 text-sm border ${
                improved ? 'bg-teal-50 border-teal-200 text-teal-900' : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              {improved
                ? 'The detected particle level decreased significantly after filtration.'
                : 'No significant improvement was detected. Check the cartridge installation or consider replacing the filter.'}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  clearCompareSession()
                  setBefore(null)
                  setAfter(null)
                  setPhase('intro')
                }}
                className="flex-1 bg-white border border-gray-200 py-3 rounded-xl font-semibold"
              >
                New comparison
              </button>
              <Link
                href="/"
                className="flex-1 text-center bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-xl font-bold"
              >
                Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
