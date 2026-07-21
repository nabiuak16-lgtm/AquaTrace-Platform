import { Info } from 'lucide-react'

export default function DisclaimerBox() {
  return (
    <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
      <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
      <p className="text-sm text-blue-800 leading-relaxed">
        <strong>AquaTrace provides preliminary screening and does not replace professional laboratory analysis.</strong>{' '}
        The AquaTrace Risk Score reflects visually distinguishable suspicious particles — not a medical result, and not a
        guarantee that water is safe. Not every detected object is microplastic.
      </p>
    </div>
  )
}
