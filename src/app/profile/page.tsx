'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getMembranes, getProfile, getSources, saveProfile } from '@/lib/storage'
import DisclaimerBox from '@/components/DisclaimerBox'
import { Info } from 'lucide-react'

export default function ProfilePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saved, setSaved] = useState(false)
  const [stats, setStats] = useState({ sources: 0, membranes: 0 })

  useEffect(() => {
    const p = getProfile()
    setName(p.name)
    setEmail(p.email)
    setStats({ sources: getSources().length, membranes: getMembranes().remaining })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 pb-8">
      <div className="max-w-lg mx-auto">
        <p className="text-sm font-semibold text-teal-600">Profile</p>
        <h1 className="text-3xl font-black text-gray-900">Household profile</h1>

        <div className="mt-4">
          <DisclaimerBox />
        </div>

        <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email (optional)</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              saveProfile({ name, email })
              setSaved(true)
            }}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-xl font-bold"
          >
            Save profile
          </button>
          {saved && <p className="text-sm text-teal-700">Saved on this device.</p>}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Source passports</p>
            <p className="text-2xl font-black text-gray-900">{stats.sources}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Membranes left</p>
            <p className="text-2xl font-black text-gray-900">{stats.membranes}</p>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4 space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-teal-500 mt-0.5" />
            <p>
              AquaTrace Risk Score is a <strong>screening</strong> indicator of visually detectable suspicious particles —
              not a water safety certificate.
            </p>
          </div>
          <p>Membrane: single-use, one membrane per test.</p>
          <p>Cartridge holder: reusable and should be cleaned after testing.</p>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Link href="/about" className="text-teal-700 font-semibold text-sm">
            How AquaTrace works →
          </Link>
          <Link href="/dashboard" className="text-teal-700 font-semibold text-sm">
            Classic monitoring dashboard →
          </Link>
        </div>
      </div>
    </div>
  )
}
