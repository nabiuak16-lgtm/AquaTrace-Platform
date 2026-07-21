interface BarProps {
  label: string
  value: number
  max: number
  color: string
}

function Bar({ label, value, max, color }: BarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-8 text-right">{value}</span>
    </div>
  )
}

interface RiskDistProps {
  low: number
  medium: number
  high: number
}

export function RiskDistributionChart({ low, medium, high }: RiskDistProps) {
  const max = Math.max(low, medium, high, 1)
  return (
    <div className="space-y-3">
      <Bar label="Low Screening" value={low} max={max} color="#14b8a8" />
      <Bar label="Medium Screening" value={medium} max={max} color="#f59e0b" />
      <Bar label="High Screening" value={high} max={max} color="#ef4444" />
    </div>
  )
}

interface SourceDistProps {
  sources: Record<string, number>
}

const sourceColors: Record<string, string> = {
  'Possible landfill leachate': '#8b5cf6',
  'Possible agricultural plastic films': '#10b981',
  'Possible industrial discharge': '#f97316',
  'Possible wastewater or urban runoff': '#3b82f6',
  'Source unknown, further monitoring needed': '#6b7280',
}

export function SourceDistributionChart({ sources }: SourceDistProps) {
  const entries = Object.entries(sources).sort((a, b) => b[1] - a[1])
  const max = Math.max(...entries.map(([, v]) => v), 1)
  const shortLabel = (s: string) => s.replace('Possible ', '').replace(', further monitoring needed', '')
  return (
    <div className="space-y-3">
      {entries.map(([label, value]) => (
        <Bar
          key={label}
          label={shortLabel(label)}
          value={value}
          max={max}
          color={sourceColors[label] || '#6b7280'}
        />
      ))}
    </div>
  )
}
