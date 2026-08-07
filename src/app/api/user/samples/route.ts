import { NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { sampleToRow } from '@/lib/user-db'
import type { Sample } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
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
    const sample = body.sample as Sample | undefined
    if (!sample?.id) return NextResponse.json({ error: 'Invalid sample' }, { status: 400 })

    const { error } = await supabase.from('samples').upsert(sampleToRow(user.id, sample))
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[api/user/samples]', err)
    return NextResponse.json({ error: 'Failed to sync sample' }, { status: 500 })
  }
}
