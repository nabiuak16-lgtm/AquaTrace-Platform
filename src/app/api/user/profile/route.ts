import { NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function PUT(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Accounts not configured' }, { status: 503 })
  }
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const name = String(body.name || '')
    const email = String(body.email || user.email || '')
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name,
      email,
      updated_at: new Date().toISOString(),
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[api/user/profile]', err)
    return NextResponse.json({ error: 'Failed to sync profile' }, { status: 500 })
  }
}
