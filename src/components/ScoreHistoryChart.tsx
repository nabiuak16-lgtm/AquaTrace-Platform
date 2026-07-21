'use client'

interface Point {
  date: string
  score: number
}

interface Props {
  points: Point[]
  height?: number
}

export default function ScoreHistoryChart({ points, height = 140 }: Props) {
  if (!points.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
        No score history yet. Complete a test to start tracking.
      </div>
    )
  }

  const w = 320
  const h = height
  const pad = 16
  const scores = points.map((p) => p.score)
  const min = Math.min(...scores, 0)
  const max = Math.max(...scores, 100)
  const range = Math.max(max - min, 1)

  const coords = points.map((p, i) => {
    const x = pad + (i / Math.max(points.length - 1, 1)) * (w - pad * 2)
    const y = h - pad - ((p.score - min) / range) * (h - pad * 2)
    return { x, y, ...p }
  })

  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <defs>
          <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14b8a8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#14b8a8" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[30, 65].map((threshold) => {
          const y = h - pad - ((threshold - min) / range) * (h - pad * 2)
          return (
            <line
              key={threshold}
              x1={pad}
              x2={w - pad}
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeDasharray="4 4"
            />
          )
        })}
        {coords.length > 1 && (
          <path
            d={`${path} L ${coords[coords.length - 1].x} ${h - pad} L ${coords[0].x} ${h - pad} Z`}
            fill="url(#scoreFill)"
          />
        )}
        <path d={path} fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c) => (
          <g key={`${c.date}-${c.score}`}>
            <circle cx={c.x} cy={c.y} r="5" fill="#fff" stroke="#0d9488" strokeWidth="2.5" />
            <text x={c.x} y={c.y - 10} textAnchor="middle" className="fill-gray-700" fontSize="10" fontWeight="700">
              {c.score}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex justify-between gap-2 overflow-x-auto text-[11px] text-gray-500">
        {points.map((p) => (
          <span key={p.date} className="whitespace-nowrap">
            {formatShort(p.date)}
          </span>
        ))}
      </div>
    </div>
  )
}

function formatShort(date: string) {
  try {
    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return date
  }
}
