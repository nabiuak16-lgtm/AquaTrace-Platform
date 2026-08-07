import { NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { sourceToRow } from '@/lib/user-db'
import type { WaterSource } from '@/types'

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
    const source = body.source as WaterSource | undefined
    if (!source?.id) return NextResponse.json({ error: 'Invalid source' }, { status: 400 })

    const { error } = await supabase.from('sources').upsert(sourceToRow(user.id, source))
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[api/user/sources]', err)
    return NextResponse.json({ error: 'Failed to sync source' }, { status: 500 })
  }
}
