'use client'
import { useEffect, useState } from 'react'
import { getAllSamples } from '@/lib/storage'
import type { Sample } from '@/types'
import StatCard from '@/components/StatCard'
import SampleCard from '@/components/SampleCard'
import { RiskDistributionChart, SourceDistributionChart } from '@/components/DashboardChart'
import RiskBadge from '@/components/RiskBadge'
import { Activity, AlertTriangle, Microscope, TrendingUp, Calendar, FlaskConical } from 'lucide-react'

export default function DashboardPage() {
  const [samples, setSamples] = useState<Sample[]>([])

  useEffect(() => {
    setSamples(getAllSamples())
  }, [])

  const totalSamples = samples.length
  const highRisk = samples.filter((s) => s.analysis.riskLevel === 'High').length
  const avgParticles = totalSamples > 0
    ? Math.round(samples.reduce((sum, s) => sum + s.analysis.suspectedParticles, 0) / totalSamples)
    : 0

  const riskCounts = {
    Low: samples.filter((s) => s.analysis.riskLevel === 'Low').length,
    Medium: samples.filter((s) => s.analysis.riskLevel === 'Medium').length,
    High: highRisk,
  }

  const sourceCounts: Record<string, number> = {}
  samples.forEach((s) => {
    sourceCounts[s.possibleSource] = (sourceCounts[s.possibleSource] || 0) + 1
  })
  const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const thisWeek = samples.filter((s) => new Date(s.date) >= oneWeekAgo).length

  const recent = [...samples].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-teal-600 text-sm font-semibold mb-1">
            <Activity className="w-4 h-4" />
            DASHBOARD
          </div>
          <h1 className="text-3xl font-black text-gray-900">Monitoring Overview</h1>
          <p className="text-gray-500 mt-1">Aggregated statistics across all AquaTrace samples.</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard title="Total Samples" value={totalSamples} icon={Microscope} color="teal" subtitle="All submissions" />
          <StatCard title="High-Risk Zones" value={highRisk} icon={AlertTriangle} color="red" subtitle="Require action" />
          <StatCard title="Avg Particles" value={avgParticles} icon={TrendingUp} color="blue" subtitle="per sample" />
          <StatCard title="Samples This Week" value={thisWeek} icon={Calendar} color="green" />
          <StatCard
            title="Top Source"
            value={topSource.replace('Possible ', '').split(',')[0]}
            icon={FlaskConical}
            color="amber"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Risk distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-1">Risk Distribution</h2>
            <p className="text-xs text-gray-400 mb-5">Sample count by risk level</p>
            <RiskDistributionChart low={riskCounts.Low} medium={riskCounts.Medium} high={riskCounts.High} />
            <div className="mt-5 pt-4 border-t border-gray-50 grid grid-cols-3 text-center gap-2">
              {[
                { label: 'Low', val: riskCounts.Low, color: 'text-green-600' },
                { label: 'Medium', val: riskCounts.Medium, color: 'text-yellow-600' },
                { label: 'High', val: riskCounts.High, color: 'text-red-600' },
              ].map(({ label, val, color }) => (
                <div key={label}>
                  <p className={`text-xl font-black ${color}`}>{val}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Source distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-1">Contamination Sources</h2>
            <p className="text-xs text-gray-400 mb-5">Estimated source distribution</p>
            <SourceDistributionChart sources={sourceCounts} />
          </div>

          {/* Recent samples cards */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4">Recent Samples</h2>
            <div className="space-y-3">
              {recent.map((s) => (
                <SampleCard key={s.id} sample={s} compact />
              ))}
            </div>
          </div>
        </div>

        {/* Full table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">All Samples</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Location', 'Date', 'Source', 'Particles', 'Density (p/L)', 'Risk', 'Possible Source'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {samples.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.locationName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.waterSource}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">{s.analysis.suspectedParticles}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.analysis.contaminationDensity}</td>
                    <td className="px-4 py-3"><RiskBadge risk={s.analysis.riskLevel} size="sm" /></td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{s.possibleSource}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
