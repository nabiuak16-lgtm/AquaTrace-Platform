import type { Sample } from '@/types'
import RiskBadge from './RiskBadge'
import { MapPin, Droplets, Calendar, FlaskConical } from 'lucide-react'

interface Props {
  sample: Sample
  compact?: boolean
}

export default function SampleCard({ sample, compact }: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{sample.locationName}</h3>
            <RiskBadge risk={sample.analysis.screeningCategory || sample.analysis.riskLevel} size="sm" />
          </div>
          {!compact && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>{sample.latitude.toFixed(4)}, {sample.longitude.toFixed(4)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Droplets className="w-3 h-3" />
                <span>{sample.waterSource} · {sample.volumeFiltered}ml</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{sample.date}</span>
              </div>
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-gray-900">{sample.analysis.riskScore ?? sample.analysis.suspectedParticles}</p>
          <p className="text-xs text-gray-400">{sample.analysis.riskScore != null ? '/100 score' : 'particles'}</p>
        </div>
      </div>
      {!compact && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <FlaskConical className="w-3 h-3 text-teal-500" />
            <span className="text-teal-700 font-medium">{sample.possibleSource}</span>
          </div>
        </div>
      )}
    </div>
  )
}
