'use client'

import { FormEvent, Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Droplets } from 'lucide-react'
import { useAuth } from '@/lib/auth'

function LoginForm() {
  const { configured, signIn, signInWithGoogle } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(params.get('error') ? 'Sign-in failed. Try again.' : '')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const result = await signIn(email.trim(), password)
    setBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    router.push('/profile')
  }

  async function onGoogle() {
    setBusy(true)
    setError('')
    const result = await signInWithGoogle()
    if (result.error) {
      setBusy(false)
      setError(result.error)
    }
  }

  return (
    <>
      {!configured && (
        <p className="mt-4 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl p-3">
          Accounts are not configured yet. Add Supabase keys to enable sign-in.
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-6 bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
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
        <button
          type="submit"
          disabled={busy || !configured}
          className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <button
          type="button"
          onClick={onGoogle}
          disabled={busy || !configured}
          className="w-full border border-gray-200 bg-white text-gray-800 py-3 rounded-xl font-semibold disabled:opacity-60"
        >
          Continue with Google
        </button>
      </form>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-gray-50 px-4 pt-10 pb-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 text-teal-700 font-bold text-xl">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-white" />
          </div>
          AquaTrace
        </div>
        <h1 className="mt-4 text-3xl font-black text-gray-900">Sign in</h1>
        <p className="mt-1 text-sm text-gray-600">
          Your tests and sources stay synced across devices.
        </p>

        <Suspense fallback={<p className="mt-6 text-sm text-gray-500">Loading…</p>}>
          <LoginForm />
        </Suspense>

        <p className="mt-4 text-sm text-gray-600 text-center">
          No account yet?{' '}
          <Link href="/signup" className="text-teal-700 font-semibold">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
