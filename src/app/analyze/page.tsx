'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Legacy route — redirects to the new Test flow */
export default function AnalyzeRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/test')
  }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
      Opening AquaTrace Test…
    </div>
  )
}
