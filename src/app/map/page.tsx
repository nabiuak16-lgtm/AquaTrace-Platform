'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { getMapSamples } from '@/lib/storage'
import type { Sample } from '@/types'
import RiskBadge from '@/components/RiskBadge'
import { MapPin, Droplets, FlaskConical, Calendar, Filter, Gauge } from 'lucide-react'
import type { RiskLevel } from '@/types'

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-teal-50/40 text-sm text-gray-500">
      Loading map…
    </div>
  ),
})

export default function MapPage() {
  const [samples, setSamples] = useState<Sample[]>([])
  const [selected, setSelected] = useState<Sample | null>(null)
  const [filter, setFilter] = useState<RiskLevel | 'All'>('All')

  useEffect(() => {
    setSamples(getMapSamples())
  }, [])

  const filtered = filter === 'All' ? samples : samples.filter((s) => s.analysis.riskLevel === filter)

  const counts = {
    Low: samples.filter((s) => s.analysis.riskLevel === 'Low').length,
    Medium: samples.filter((s) => s.analysis.riskLevel === 'Medium').length,
    High: samples.filter((s) => s.analysis.riskLevel === 'High').length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/60 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-3 md:mb-6">
          <div className="flex items-center gap-2 text-teal-600 text-sm font-semibold mb-1">
            <MapPin className="w-4 h-4" />
            POLLUTION MAP
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900">Contamination map</h1>
              <p className="text-gray-500 mt-1 text-sm max-w-xl hidden sm:block">
                See screened locations and their AquaScore risk level. Example points are included;
                your own tests appear when you run them.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              {([['Low', '#14b8a8'], ['Medium', '#f59e0b'], ['High', '#ef4444']] as const).map(
                ([risk, color]) => (
                  <div key={risk} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-gray-600">{risk}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3 md:mb-4 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          {(['All', 'Low', 'Medium', 'High'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-teal-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300'
              }`}
            >
              {f} {f !== 'All' && `(${counts[f]})`}
            </button>
          ))}
        </div>

        {/* Map first on mobile so it is above the fold */}
        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 order-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative h-[55vh] min-h-[280px] max-h-[520px] md:h-[520px] md:max-h-none">
              <LeafletMap
                samples={filtered}
                onSelect={setSelected}
                selectedId={selected?.id}
              />
              {filtered.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 pointer-events-none">
                  <p className="text-sm text-gray-600 font-medium">No points for this filter</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 order-2">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-3">Overview</p>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { label: 'Low', count: counts.Low, color: 'text-teal-700 bg-teal-50' },
                    { label: 'Medium', count: counts.Medium, color: 'text-amber-700 bg-amber-50' },
                    { label: 'High', count: counts.High, color: 'text-red-700 bg-red-50' },
                  ] as const
                ).map(({ label, count, color }) => (
                  <div key={label} className={`rounded-xl p-2 text-center ${color}`}>
                    <p className="text-lg font-black">{count}</p>
                    <p className="text-xs font-medium">{label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-500">{samples.length} locations on the map</p>
            </div>

            {selected && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <p className="font-bold text-gray-900 text-sm">{selected.locationName}</p>
                  <RiskBadge risk={selected.analysis.riskLevel} size="sm" />
                </div>
                <div className="space-y-2">
                  {[
                    { icon: Gauge, label: `AquaScore ${selected.analysis.riskScore}` },
                    {
                      icon: Droplets,
                      label: `${selected.analysis.suspectedParticles} particles`,
                    },
                    { icon: FlaskConical, label: selected.possibleSource },
                    {
                      icon: MapPin,
                      label: `${selected.latitude.toFixed(3)}, ${selected.longitude.toFixed(3)}`,
                    },
                    { icon: Calendar, label: selected.date },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-xs text-gray-600">
                      <Icon className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                {selected.notes && (
                  <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                    {selected.notes}
                  </p>
                )}
              </div>
            )}

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Locations ({filtered.length})
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {filtered.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl hover:bg-teal-50 transition-colors flex items-center justify-between gap-2 ${
                      selected?.id === s.id ? 'bg-teal-50 ring-1 ring-teal-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{s.locationName}</p>
                      <p className="text-xs text-gray-400">
                        AquaScore {s.analysis.riskScore} · {s.date}
                      </p>
                    </div>
                    <RiskBadge risk={s.analysis.riskLevel} size="sm" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
