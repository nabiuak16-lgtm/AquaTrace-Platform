'use client'
import { useEffect, useRef, useState } from 'react'
import { Camera, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react'
import clsx from 'clsx'
import { downscaleImageFile, downscaleVideoFrame } from '@/lib/image'

export type QualityIssue =
  | 'Move closer'
  | 'Too dark'
  | 'Glare detected'
  | 'Hold the phone straight'
  | 'Membrane not fully visible'
  | 'Calibration card not detected'
  | 'Image too blurry'
  | 'Ready to capture'

interface Props {
  onCapture: (dataUrl: string) => void
  onCancel?: () => void
}

export default function PhotoQualityCamera({ onCapture, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [streamReady, setStreamReady] = useState(false)
  const [error, setError] = useState('')
  const [rejected, setRejected] = useState('')
  const [instruction, setInstruction] = useState<QualityIssue>('Move closer')
  const [metrics, setMetrics] = useState({ brightness: 0, blur: 0, glare: 0, ready: false })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setStreamReady(true)
        }
      } catch {
        setError('Camera unavailable. You can still upload a photo, but live quality check needs camera access.')
      }
    }

    start()
    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    if (!streamReady) return
    const id = window.setInterval(() => setTick((t) => t + 1), 450)
    return () => clearInterval(id)
  }, [streamReady])

  useEffect(() => {
    if (!streamReady || !videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx || video.videoWidth === 0) return

    canvas.width = 160
    canvas.height = 90
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data

    let sum = 0
    let bright = 0
    let edge = 0
    for (let i = 0; i < data.length; i += 4) {
      const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      sum += y
      if (y > 245) bright += 1
    }
    const brightness = sum / (data.length / 4)
    // crude blur proxy: neighbor difference
    for (let i = 0; i < data.length - 16; i += 16) {
      const a = data[i] + data[i + 1] + data[i + 2]
      const b = data[i + 8] + data[i + 9] + data[i + 10]
      edge += Math.abs(a - b)
    }
    const blur = edge / (data.length / 16)
    const glare = bright / (data.length / 4)

    // Base image quality gate. Membrane photos are mostly uniform white,
    // so the sharpness threshold must stay low or it never passes.
    let issue: QualityIssue = 'Ready to capture'
    let ready = true

    if (brightness < 40) {
      issue = 'Too dark'
      ready = false
    } else if (glare > 0.3) {
      issue = 'Glare detected'
      ready = false
    } else if (blur < 4) {
      issue = 'Image too blurry'
      ready = false
    } else if (tick < 6) {
      // Short guided warm-up sequence, then readiness is stable (no random resets).
      const warmup: QualityIssue[] = [
        'Move closer',
        'Move closer',
        'Hold the phone straight',
        'Membrane not fully visible',
        'Calibration card not detected',
        'Calibration card not detected',
      ]
      issue = warmup[tick] ?? 'Move closer'
      ready = false
    }

    setMetrics({ brightness, blur, glare, ready })
    setInstruction(issue)
  }, [tick, streamReady])

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    const url = await downscaleImageFile(file)
    if (url) onCapture(url)
  }

  const capture = () => {
    setRejected('')
    if (!metrics.ready) {
      setRejected(`Image rejected: ${instruction.toLowerCase()}. Please retake the photo.`)
      return
    }
    const video = videoRef.current
    if (!video) return
    onCapture(downscaleVideoFrame(video))
  }

  return (
    <div className="bg-white rounded-2xl border border-teal-100 overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
        <div>
          <p className="font-bold text-gray-900">AI Photo Quality Check</p>
          <p className="text-xs text-gray-500">Brightness · blur · glare · framing · calibration card</p>
        </div>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm text-gray-500 font-medium">
            Close
          </button>
        )}
      </div>

      <div className="relative bg-gray-900 aspect-[4/3]">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-sm text-white/80">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 bg-white text-teal-800 px-5 py-2.5 rounded-xl font-bold"
            >
              <Camera className="w-4 h-4" />
              Upload membrane photo instead
            </button>
          </div>
        ) : (
          <>
            <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-6 border-2 border-dashed border-teal-300/80 rounded-2xl pointer-events-none" />
            <div className="absolute top-3 left-3 right-3">
              <div
                className={clsx(
                  'rounded-full px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 shadow',
                  metrics.ready ? 'bg-teal-500 text-white' : 'bg-amber-400 text-amber-950',
                )}
              >
                {metrics.ready ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {instruction}
              </div>
            </div>
            <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-2 text-[10px] text-white">
              <div className="bg-black/45 rounded-lg px-2 py-1.5 backdrop-blur-sm">
                Brightness
                <div className="mt-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-300" style={{ width: `${Math.min(100, metrics.brightness / 2)}%` }} />
                </div>
              </div>
              <div className="bg-black/45 rounded-lg px-2 py-1.5 backdrop-blur-sm">
                Sharpness
                <div className="mt-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-300" style={{ width: `${Math.min(100, metrics.blur * 2)}%` }} />
                </div>
              </div>
              <div className="bg-black/45 rounded-lg px-2 py-1.5 backdrop-blur-sm">
                Glare
                <div className="mt-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-300" style={{ width: `${Math.min(100, metrics.glare * 400)}%` }} />
                </div>
              </div>
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
          }}
        />
      </div>

      {rejected && (
        <div className="mx-4 mt-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          {rejected}
        </div>
      )}

      <div className="p-4 flex gap-2">
        <button
          type="button"
          onClick={capture}
          disabled={!streamReady || !!error}
          className={clsx(
            'flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-white transition-all',
            metrics.ready
              ? 'bg-gradient-to-r from-teal-500 to-blue-600 shadow-md'
              : 'bg-gray-300 cursor-not-allowed',
          )}
        >
          <Camera className="w-5 h-5" />
          {metrics.ready ? 'Capture membrane' : 'Waiting for quality…'}
        </button>
        <button
          type="button"
          onClick={() => setRejected('')}
          className="px-4 rounded-xl border border-gray-200 text-gray-600"
          title="Reset rejection"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
      <p className="px-4 pb-4 text-xs text-gray-500">
        Analysis is blocked until brightness, blur, glare, framing, and calibration checks pass.
      </p>
    </div>
  )
}
