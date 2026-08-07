'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Droplets } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function SignupPage() {
  const { configured, signUp } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setInfo('')
    const result = await signUp(email.trim(), password, name.trim())
    setBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setInfo('Account created. If email confirmation is enabled, check your inbox; otherwise you are signed in.')
    router.push('/profile')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-gray-50 px-4 pt-10 pb-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 text-teal-700 font-bold text-xl">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-white" />
          </div>
          AquaTrace
        </div>
        <h1 className="mt-4 text-3xl font-black text-gray-900">Create account</h1>
        <p className="mt-1 text-sm text-gray-600">
          Keep your screening history private to your account.
        </p>

        <form onSubmit={onSubmit} className="mt-6 bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-teal-700">{info}</p>}
          <button
            type="submit"
            disabled={busy || !configured}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-60"
          >
            {busy ? 'Creating…' : 'Sign up'}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-teal-700 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
