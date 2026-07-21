'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  getActiveSourceId,
  getAllSamples,
  getLatestForSource,
  getMembranes,
  getSamplesForSource,
  getSources,
  setActiveSourceId,
  significantRise,
} from '@/lib/storage'
import type { MembraneInventory, Sample, WaterSource } from '@/types'
import RiskScoreCard from '@/components/RiskScoreCard'
import ScoreHistoryChart from '@/components/ScoreHistoryChart'
import RiskBadge from '@/components/RiskBadge'
import DisclaimerBox from '@/components/DisclaimerBox'
import LanguageSwitch from '@/components/LanguageSwitch'
import {
  AlertTriangle,
  ArrowRightLeft,
  Camera,
  Droplets,
  FlaskConical,
  ShoppingBag,
  User,
  ChevronRight,
} from 'lucide-react'
import { scoreRingColor } from '@/lib/risk'

export default function OverviewPage() {
  const [sources, setSources] = useState<WaterSource[]>([])
  const [activeId, setActiveId] = useState('src-home-well')
  const [latest, setLatest] = useState<Sample | null>(null)
  const [history, setHistory] = useState<Sample[]>([])
  const [membranes, setMembranes] = useState<MembraneInventory | null>(null)
  const [allSamples, setAllSamples] = useState<Sample[]>([])

  useEffect(() => {
    const srcs = getSources()
    const id = getActiveSourceId()
    setSources(srcs)
    setActiveId(id)
    setLatest(getLatestForSource(id))
    setHistory(getSamplesForSource(id))
    setMembranes(getMembranes())
    setAllSamples(getAllSamples())
  }, [])

  const active = sources.find((s) => s.id === activeId) || sources[0]
  const points = useMemo(
    () => history.map((h) => ({ date: h.date, score: h.analysis.riskScore })),
    [history],
  )

  const prev = history.length >= 2 ? history[history.length - 2] : null
  const avg =
    history.length > 1
      ? history.slice(0, -1).reduce((a, s) => a + s.analysis.riskScore, 0) / Math.max(history.length - 1, 1)
      : null
  const warn =
    latest &&
    significantRise(latest.analysis.riskScore, prev?.analysis.riskScore ?? null, avg ?? undefined)

  const change =
    latest?.analysis.changeSincePrevious ??
    (prev && latest ? latest.analysis.riskScore - prev.analysis.riskScore : null)

  const selectSource = (id: string) => {
    setActiveSourceId(id)
    setActiveId(id)
    setLatest(getLatestForSource(id))
    setHistory(getSamplesForSource(id))
  }

  const sourceCards = sources.map((s) => ({ source: s, sample: getLatestForSource(s.id) }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-blue-50/40">
      <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-blue-700 text-white px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-teal-100 text-sm font-semibold tracking-wide">AquaTrace · Overview</p>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1">Your Water Today</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LanguageSwitch />
              <Link
                href="/test"
                className="inline-flex items-center gap-2 bg-white text-teal-800 px-4 py-2.5 rounded-xl font-bold text-sm shadow"
              >
                <FlaskConical className="w-4 h-4" />
                Start New Test
              </Link>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi label="Active source" value={active?.name || '—'} sub={active?.type} />
            <Kpi
              label="AquaScore"
              value={latest ? `${latest.analysis.riskScore}/100` : '—'}
              sub={latest?.analysis.screeningCategory}
            />
            <Kpi
              label="Membranes left"
              value={membranes ? String(membranes.remaining) : '—'}
              sub={membranes ? `of ${membranes.packSize} pack` : undefined}
            />
            <Kpi label="Total screenings" value={String(allSamples.length)} sub={`${sources.length} sources`} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-8">
        <div className="mb-4">
          <DisclaimerBox />
        </div>
        {warn && (
          <div className="mb-4 flex gap-2 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            Your current result is significantly higher than the normal range for this water source. We recommend
            repeating the test.
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-teal-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Main water source</p>
                  <h2 className="text-xl font-black text-gray-900 mt-1">{active?.name}</h2>
                  <p className="text-sm text-gray-500">{active?.type}</p>
                </div>
                <Droplets className="w-8 h-8 text-teal-500" />
              </div>
              {latest ? (
                <RiskScoreCard analysis={{ ...latest.analysis, changeSincePrevious: change }} showDetails />
              ) : (
                <p className="text-sm text-gray-500">No tests yet.</p>
              )}
            </div>
            {membranes && (
              <div className="bg-white rounded-3xl border border-teal-100 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase text-gray-400">Membrane Pack</p>
                <p className="text-lg font-black text-gray-900 mt-1">
                  {membranes.remaining} tests remaining out of {membranes.packSize}
                </p>
                <Link
                  href="/shop"
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-teal-50 text-teal-800 border border-teal-200 py-3 rounded-xl font-bold"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Buy Membranes
                </Link>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">All water sources</h3>
                <Link href="/sources" className="text-sm text-teal-700 font-semibold inline-flex items-center gap-1">
                  Passports <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {sourceCards.map(({ source, sample }) => (
                  <button
                    key={source.id}
                    type="button"
                    onClick={() => selectSource(source.id)}
                    className={`text-left rounded-2xl border p-4 ${
                      source.id === activeId ? 'border-teal-400 bg-teal-50/60' : 'border-gray-100 bg-gray-50/50'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{source.name}</p>
                        <p className="text-xs text-gray-500">{source.type}</p>
                      </div>
                      {sample && (
                        <span className="text-xl font-black" style={{ color: scoreRingColor(sample.analysis.riskScore) }}>
                          {sample.analysis.riskScore}
                        </span>
                      )}
                    </div>
                    {sample && (
                      <div className="mt-2">
                        <RiskBadge risk={sample.analysis.screeningCategory} size="sm" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Score history · {active?.name}</h3>
              <ScoreHistoryChart points={points} height={160} />
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Quick actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Action href="/test" icon={FlaskConical} title="New Test" desc="AquaScore screening" />
                <Action href="/compare" icon={ArrowRightLeft} title="Before & After" desc="Filter comparison" />
                <Action href="/test" icon={Camera} title="Photo Check" desc="AI quality gate" />
                <Action href="/sources" icon={Droplets} title="Sources" desc="Water passports" />
                <Action href="/shop" icon={ShoppingBag} title="Shop" desc="Membrane refills" />
                <Action href="/profile" icon={User} title="Profile" desc="Household settings" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-teal-100 font-semibold">{label}</p>
      <p className="text-lg font-black text-white mt-0.5 truncate">{value}</p>
      {sub && <p className="text-xs text-teal-100/90 truncate mt-0.5">{sub}</p>}
    </div>
  )
}

function Action({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string
  icon: typeof FlaskConical
  title: string
  desc: string
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-teal-50/40 p-4 hover:border-teal-300"
    >
      <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center mb-2">
        <Icon className="w-4 h-4 text-teal-700" />
      </div>
      <p className="font-bold text-gray-900 text-sm">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
    </Link>
  )
}
