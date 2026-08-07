'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PhotoQualityCamera from '@/components/PhotoQualityCamera'
import UploadBox from '@/components/UploadBox'
import DisclaimerBox from '@/components/DisclaimerBox'
import { runMockAnalysis, detectPossibleSource } from '@/lib/data'
import {
  getActiveSourceId,
  getLatestForSource,
  getMembranes,
  getSources,
  saveUserSample,
  setActiveSourceId,
  setPendingResult,
} from '@/lib/storage'
import type { MembraneInventory, Sample, WaterSource } from '@/types'
import { AlertTriangle, Camera, CheckCircle2, Loader2, Microscope } from 'lucide-react'

const STEPS = [
  'Checking image quality gate',
  'Detecting suspicious particle-like objects',
  'Estimating particle density',
  'Calculating AquaTrace Risk Score',
]

export default function TestPage() {
  const router = useRouter()
  const [sources, setSources] = useState<WaterSource[]>([])
  const [sourceId, setSourceId] = useState('')
  const [membranes, setMembranesState] = useState<MembraneInventory | null>(null)
  const [mode, setMode] = useState<'camera' | 'upload'>('camera')
  const [imageDataUrl, setImageDataUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [volumeFiltered, setVolumeFiltered] = useState(500)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(-1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const list = getSources()
    const active = getActiveSourceId()
    setSources(list)
    setSourceId(list.some((s) => s.id === active) ? active : (list[0]?.id ?? ''))
    setMembranesState(getMembranes())
  }, [])

  const source = sources.find((s) => s.id === sourceId)

  const analyze = async () => {
    if (!imageDataUrl) {
      setError('Capture or upload a membrane photo that passes quality checks.')
      return
    }
    if (!source) {
      setError('Select a water source passport.')
      return
    }
    const inv = getMembranes()
    if (inv.remaining <= 0) {
      setError('No membranes remaining. Buy a refill pack in Shop.')
      return
    }

    setError('')
    setLoading(true)
    setCompletedSteps([])
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i)
      await new Promise((r) => setTimeout(r, 180))
      setCompletedSteps((prev) => [...prev, i])
    }

    const previous = getLatestForSource(source.id)
    const analysis = runMockAnalysis(volumeFiltered, previous?.analysis.riskScore ?? null)
    const sample: Sample = {
      id: `user-${Date.now()}`,
      sourceId: source.id,
      locationName: source.name,
      waterSource: source.type,
      volumeFiltered,
      latitude: 51.18,
      longitude: 71.44,
      notes,
      imageDataUrl,
      date: new Date().toISOString().slice(0, 10),
      analysis,
      possibleSource: detectPossibleSource(source.name, notes),
      submittedToMap: true,
    }

    setActiveSourceId(source.id)
    saveUserSample(sample)
    setPendingResult(sample)
    setMembranesState(getMembranes())
    router.push('/results')
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 pb-8">
      <div className="max-w-lg mx-auto">
        <p className="text-sm font-semibold text-teal-600">Test</p>
        <h1 className="text-3xl font-black text-gray-900">Start screening</h1>
        <p className="text-gray-500 mt-1 text-sm">
          One single-use membrane per test. AI photo quality check runs before analysis.
        </p>

        <div className="mt-4">
          <DisclaimerBox />
        </div>

        {membranes && membranes.remaining <= 2 && (
          <div className="mt-4 flex gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            {membranes.remaining} membranes left. Order a refill to avoid interruption.
          </div>
        )}

        <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <label className="block text-sm font-medium text-gray-700">Water source passport</label>
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.type}
              </option>
            ))}
          </select>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Volume filtered (ml)</label>
            <input
              type="number"
              value={volumeFiltered}
              onChange={(e) => setVolumeFiltered(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none"
              placeholder="Nearby farms, filters, recent changes…"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setMode('camera')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border ${
              mode === 'camera' ? 'bg-teal-50 border-teal-300 text-teal-800' : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            <span className="inline-flex items-center gap-1 justify-center w-full">
              <Camera className="w-4 h-4" /> Live quality check
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border ${
              mode === 'upload' ? 'bg-teal-50 border-teal-300 text-teal-800' : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            Upload photo
          </button>
        </div>

        <div className="mt-4">
          {mode === 'camera' ? (
            <PhotoQualityCamera onCapture={(url) => setImageDataUrl(url)} />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <UploadBox onImageSelect={setImageDataUrl} imagePreview={imageDataUrl || null} />
              <p className="text-xs text-gray-500 mt-2">
                Upload is a fallback. Prefer live quality check for demos and reliable framing.
              </p>
            </div>
          )}
        </div>

        {imageDataUrl && (
          <div className="mt-3 flex items-center gap-2 text-sm text-teal-700 font-semibold bg-teal-50 border border-teal-100 rounded-xl px-3 py-2">
            <CheckCircle2 className="w-4 h-4" />
            Membrane image ready for analysis
          </div>
        )}

        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
            {error.includes('membranes') && (
              <Link
                href="/shop"
                className="mt-2 block w-fit rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white"
              >
                Buy Membranes →
              </Link>
            )}
          </div>
        )}

        {loading && (
          <div className="mt-4 bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
              <h3 className="font-bold text-gray-900">Running AquaTrace screening…</h3>
            </div>
            <div className="space-y-3">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  {completedSteps.includes(i) ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  ) : i === step ? (
                    <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                  )}
                  <span className="text-sm text-gray-600">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={loading || !imageDataUrl}
          onClick={analyze}
          className="mt-4 w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3.5 rounded-xl font-bold shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Analyzing…
            </>
          ) : (
            <>
              <Microscope className="w-5 h-5" /> Calculate Risk Score
            </>
          )}
        </button>

        <Link href="/compare" className="mt-3 block text-center text-sm font-semibold text-teal-700">
          Or use Compare Before & After Filter →
        </Link>
      </div>
    </div>
  )
}
