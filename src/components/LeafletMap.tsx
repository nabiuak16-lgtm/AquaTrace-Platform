'use client'
import { useEffect, useRef } from 'react'
import type { Sample } from '@/types'
import { getRiskColor } from '@/lib/data'

interface Props {
  samples: Sample[]
  onSelect?: (sample: Sample) => void
}

export default function LeafletMap({ samples, onSelect }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import('leaflet').then((L) => {
      // Fix default icon
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!).setView([51.18, 71.45], 10)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      samples.forEach((sample) => {
        const color = getRiskColor(sample.analysis.riskLevel)
        const marker = L.circleMarker([sample.latitude, sample.longitude], {
          radius: 10,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85,
        }).addTo(map)

        marker.bindPopup(`
          <div style="font-family:system-ui;min-width:180px;">
            <strong style="font-size:14px;">${sample.locationName}</strong>
            <br/>
            <span style="display:inline-block;margin-top:4px;padding:2px 8px;border-radius:999px;background:${color}22;color:${color};font-size:12px;font-weight:600;border:1px solid ${color}44;">
              ${sample.analysis.riskLevel} Risk
            </span>
            <div style="margin-top:8px;font-size:12px;color:#555;">
              <div>🔬 ${sample.analysis.suspectedParticles} particles</div>
              <div>💧 ${sample.waterSource}</div>
              <div>📍 ${sample.possibleSource}</div>
              <div>📅 ${sample.date}</div>
            </div>
          </div>
        `)

        if (onSelect) {
          marker.on('click', () => onSelect(sample))
        }
      })
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" />
    </>
  )
}
