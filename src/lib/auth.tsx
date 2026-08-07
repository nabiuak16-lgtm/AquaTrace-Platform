'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { bootstrapAccount, markSignedOutLocally } from '@/lib/sync'

type AuthContextValue = {
  configured: boolean
  loading: boolean
  session: Session | null
  user: User | null
  syncMessage: string | null
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  clearSyncMessage: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured()
  const [loading, setLoading] = useState(configured)
  const [session, setSession] = useState<Session | null>(null)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!configured) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    let active = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session) {
        const result = await bootstrapAccount()
        if (active && result.message) setSyncMessage(result.message)
      } else {
        markSignedOutLocally()
      }
      if (active) setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, next) => {
      setSession(next)
      if (event === 'SIGNED_IN' && next) {
        const result = await bootstrapAccount()
        setSyncMessage(result.message)
      }
      if (event === 'SIGNED_OUT') {
        markSignedOutLocally()
        setSyncMessage(null)
      }
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [configured])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!configured) return { error: 'Accounts are not configured yet' }
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? { error: error.message } : {}
  }, [configured])

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    if (!configured) return { error: 'Accounts are not configured yet' }
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name || '' } },
    })
    return error ? { error: error.message } : {}
  }, [configured])

  const signOut = useCallback(async () => {
    if (!configured) return
    const supabase = createClient()
    await supabase.auth.signOut()
    markSignedOutLocally()
  }, [configured])

  const value = useMemo<AuthContextValue>(
    () => ({
      configured,
      loading,
      session,
      user: session?.user ?? null,
      syncMessage,
      signIn,
      signUp,
      signOut,
      clearSyncMessage: () => setSyncMessage(null),
    }),
    [configured, loading, session, syncMessage, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
