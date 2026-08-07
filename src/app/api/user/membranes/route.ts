import { NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { membranesToRow } from '@/lib/user-db'
import type { MembraneInventory } from '@/types'

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
    const membranes = body.membranes as MembraneInventory | undefined
    if (!membranes || typeof membranes.remaining !== 'number') {
      return NextResponse.json({ error: 'Invalid membranes' }, { status: 400 })
    }
    const { error } = await supabase.from('membranes').upsert(membranesToRow(user.id, membranes))
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[api/user/membranes]', err)
    return NextResponse.json({ error: 'Failed to sync membranes' }, { status: 500 })
  }
}
