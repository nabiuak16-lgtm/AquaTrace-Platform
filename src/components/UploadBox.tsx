'use client'
import { useRef, useState } from 'react'
import { Upload, Image as ImageIcon, X } from 'lucide-react'
import clsx from 'clsx'
import { downscaleImageFile } from '@/lib/image'

interface Props {
  onImageSelect: (dataUrl: string) => void
  imagePreview: string | null
}

export default function UploadBox({ onImageSelect, imagePreview }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    const url = await downscaleImageFile(file)
    onImageSelect(url)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      {imagePreview ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-teal-200">
          <img src={imagePreview} alt="Preview" className="w-full h-56 object-cover" />
          <button
            type="button"
            onClick={() => onImageSelect('')}
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
          <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg px-2 py-1 text-xs text-teal-700 font-medium flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            Membrane image loaded
          </div>
        </div>
      ) : (
        <div
          className={clsx(
            'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
            dragging
              ? 'border-teal-400 bg-teal-50'
              : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/50'
          )}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
              <Upload className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <p className="font-medium text-gray-700">Drop your membrane photo here</p>
              <p className="text-sm text-gray-400 mt-1">or click to browse · JPG, PNG, HEIC</p>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </div>
      )}
    </div>
  )
}
