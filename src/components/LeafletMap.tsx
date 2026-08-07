'use client'
import { useEffect, useRef, useState } from 'react'
import type { Sample } from '@/types'
import { getRiskColor } from '@/lib/data'

interface Props {
  samples: Sample[]
  onSelect?: (sample: Sample) => void
  selectedId?: string | null
}

export default function LeafletMap({ samples, onSelect, selectedId }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const layerRef = useRef<any>(null)
  const onSelectRef = useRef(onSelect)
  const [ready, setReady] = useState(false)
  onSelectRef.current = onSelect

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    let cancelled = false

    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current || mapInstanceRef.current) return

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current).setView([51.16, 71.45], 11)
      mapInstanceRef.current = map
      layerRef.current = L.layerGroup().addTo(map)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      setReady(true)
    })

    return () => {
      cancelled = true
      setReady(false)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        layerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    const map = mapInstanceRef.current
    const layer = layerRef.current
    if (!map || !layer) return

    let cancelled = false

    import('leaflet').then((L) => {
      if (cancelled || !mapInstanceRef.current || !layerRef.current) return

      layer.clearLayers()
      const markers: any[] = []

      samples.forEach((sample) => {
        const color = getRiskColor(sample.analysis.riskLevel)
        const isSelected = selectedId === sample.id
        const marker = L.circleMarker([sample.latitude, sample.longitude], {
          radius: isSelected ? 14 : 10,
          fillColor: color,
          color: isSelected ? '#0f766e' : '#fff',
          weight: isSelected ? 3 : 2,
          opacity: 1,
          fillOpacity: 0.9,
        })

        marker.bindPopup(`
          <div style="font-family:system-ui;min-width:190px;">
            <strong style="font-size:14px;">${sample.locationName}</strong>
            <br/>
            <span style="display:inline-block;margin-top:6px;padding:2px 8px;border-radius:999px;background:${color}22;color:${color};font-size:12px;font-weight:600;border:1px solid ${color}44;">
              ${sample.analysis.riskLevel} · AquaScore ${sample.analysis.riskScore}
            </span>
            <div style="margin-top:8px;font-size:12px;color:#555;line-height:1.45;">
              <div>${sample.analysis.suspectedParticles} suspicious particles</div>
              <div>${sample.waterSource}</div>
              <div>${sample.possibleSource}</div>
              <div>${sample.date}</div>
            </div>
          </div>
        `)

        marker.on('click', () => onSelectRef.current?.(sample))
        marker.addTo(layer)
        markers.push(marker)
      })

      if (markers.length === 1) {
        map.setView([samples[0].latitude, samples[0].longitude], 12)
      } else if (markers.length > 1) {
        map.fitBounds(L.featureGroup(markers).getBounds().pad(0.2))
      }
    })

    return () => {
      cancelled = true
    }
  }, [ready, samples, selectedId])

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
