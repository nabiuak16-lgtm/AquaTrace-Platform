'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { getAllSamples } from '@/lib/storage'
import type { Sample } from '@/types'
import RiskBadge from '@/components/RiskBadge'
import { MapPin, Droplets, FlaskConical, Calendar, Filter } from 'lucide-react'
import type { RiskLevel } from '@/types'

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), { ssr: false })

export default function MapPage() {
  const [samples, setSamples] = useState<Sample[]>([])
  const [selected, setSelected] = useState<Sample | null>(null)
  const [filter, setFilter] = useState<RiskLevel | 'All'>('All')

  useEffect(() => {
    setSamples(getAllSamples())
  }, [])

  const filtered = filter === 'All' ? samples : samples.filter((s) => s.analysis.riskLevel === filter)

  const counts = {
    Low: samples.filter((s) => s.analysis.riskLevel === 'Low').length,
    Medium: samples.filter((s) => s.analysis.riskLevel === 'Medium').length,
    High: samples.filter((s) => s.analysis.riskLevel === 'High').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-600 text-sm font-semibold mb-1">
              <MapPin className="w-4 h-4" />
              POLLUTION MAP
            </div>
            <h1 className="text-3xl font-black text-gray-900">Crowdsourced Contamination Map</h1>
            <p className="text-gray-500 mt-1">Real-time microplastic risk levels from community samples.</p>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3 text-sm">
            {([['Low', '#22c55e'], ['Medium', '#f59e0b'], ['High', '#ef4444']] as const).map(([risk, color]) => (
              <div key={risk} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-gray-600">{risk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-4">
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '520px' }}>
              {filtered.length > 0 && (
                <LeafletMap samples={filtered} onSelect={setSelected} />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-3">Overview</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { label: 'Low', count: counts.Low, color: 'text-green-600 bg-green-50' },
                  { label: 'Medium', count: counts.Medium, color: 'text-yellow-600 bg-yellow-50' },
                  { label: 'High', count: counts.High, color: 'text-red-600 bg-red-50' },
                ] as const).map(({ label, count, color }) => (
                  <div key={label} className={`rounded-xl p-2 text-center ${color}`}>
                    <p className="text-lg font-black">{count}</p>
                    <p className="text-xs font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected */}
            {selected && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-gray-900 text-sm">{selected.locationName}</p>
                  <RiskBadge risk={selected.analysis.riskLevel} size="sm" />
                </div>
                <div className="space-y-2">
                  {[
                    { icon: Droplets, label: `${selected.analysis.suspectedParticles} particles` },
                    { icon: FlaskConical, label: selected.possibleSource },
                    { icon: MapPin, label: `${selected.latitude.toFixed(3)}, ${selected.longitude.toFixed(3)}` },
                    { icon: Calendar, label: selected.date },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-xs text-gray-600">
                      <Icon className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                {selected.notes && (
                  <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">{selected.notes}</p>
                )}
              </div>
            )}

            {/* Sample list */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                All Samples ({filtered.length})
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
                      <p className="text-xs text-gray-400">{s.analysis.suspectedParticles} particles · {s.date}</p>
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
