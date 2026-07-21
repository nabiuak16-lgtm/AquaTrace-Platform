'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getLatestForSource, getSources, saveSource, setActiveSourceId } from '@/lib/storage'
import type { WaterSource, WaterSourceType } from '@/types'
import { Droplets, Plus } from 'lucide-react'
import RiskBadge from '@/components/RiskBadge'

export default function SourcesPage() {
  const [sources, setSources] = useState<WaterSource[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<WaterSourceType>('Well')
  const [location, setLocation] = useState('')

  const refresh = () => setSources(getSources())

  useEffect(() => {
    refresh()
  }, [])

  const create = () => {
    if (!name.trim()) return
    const nextTest = new Date()
    nextTest.setDate(nextTest.getDate() + 14)
    const source: WaterSource = {
      id: `src-${Date.now()}`,
      name: name.trim(),
      type,
      location: location.trim() || undefined,
      createdAt: new Date().toISOString().slice(0, 10),
      nextTestDate: nextTest.toISOString().slice(0, 10),
    }
    saveSource(source)
    setName('')
    setLocation('')
    setShowForm(false)
    refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 pb-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-semibold text-teal-600">Sources</p>
            <h1 className="text-3xl font-black text-gray-900">Water Source Passports</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="w-11 h-11 rounded-full bg-teal-500 text-white flex items-center justify-center shadow"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-teal-100 p-4 mb-4 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Source name (e.g. Home well)"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as WaterSourceType)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
            >
              {['Well', 'Tap', 'After filter', 'Borehole', 'Spring', 'Other'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (optional)"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
            />
            <button
              type="button"
              onClick={create}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-xl font-bold"
            >
              Create passport
            </button>
          </div>
        )}

        <div className="space-y-3">
          {sources.map((s) => {
            const latest = getLatestForSource(s.id)
            return (
              <Link
                key={s.id}
                href={`/sources/${s.id}`}
                onClick={() => setActiveSourceId(s.id)}
                className="block bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:border-teal-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-teal-500" />
                      <h2 className="font-bold text-gray-900">{s.name}</h2>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {s.type}
                      {s.location ? ` · ${s.location}` : ''}
                    </p>
                  </div>
                  {latest ? (
                    <div className="text-right">
                      <p className="text-2xl font-black text-gray-900">{latest.analysis.riskScore}</p>
                      <p className="text-[10px] text-gray-400">/100</p>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No tests</span>
                  )}
                </div>
                {latest && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <RiskBadge risk={latest.analysis.screeningCategory} size="sm" />
                    <span className="text-xs text-gray-500">Latest: {latest.date}</span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
