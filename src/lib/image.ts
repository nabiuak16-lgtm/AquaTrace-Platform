const MAX_DIM = 900
const JPEG_QUALITY = 0.72

function drawScaled(source: CanvasImageSource, w: number, h: number): string {
  const scale = Math.min(1, MAX_DIM / Math.max(w, h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}

export function downscaleVideoFrame(video: HTMLVideoElement): string {
  const w = video.videoWidth || 1280
  const h = video.videoHeight || 720
  return drawScaled(video, w, h)
}

export function downscaleImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const out = drawScaled(img, img.naturalWidth, img.naturalHeight)
        resolve(out || (reader.result as string))
      }
      img.onerror = () => resolve(reader.result as string)
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
