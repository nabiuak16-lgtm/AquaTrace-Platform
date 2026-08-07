import { NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import {
  loadUserBundle,
  membranesToRow,
  sampleToRow,
  sourceToRow,
} from '@/lib/user-db'
import type { MembraneInventory, Sample, WaterSource } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Accounts not configured' }, { status: 503 })
  }
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const bundle = await loadUserBundle(supabase, user.id)
    return NextResponse.json(bundle)
  } catch (err) {
    console.error('[api/user/bootstrap GET]', err)
    return NextResponse.json({ error: 'Failed to load account data' }, { status: 500 })
  }
}

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
    const profile = body.profile as { name?: string; email?: string } | undefined
    const samples = (Array.isArray(body.samples) ? body.samples : []) as Sample[]
    const sources = (Array.isArray(body.sources) ? body.sources : []) as WaterSource[]
    const membranes = body.membranes as MembraneInventory | undefined

    if (profile) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name: profile.name || '',
        email: profile.email || user.email || '',
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
    }

    if (sources.length) {
      const { error } = await supabase
        .from('sources')
        .upsert(sources.map((s) => sourceToRow(user.id, s)))
      if (error) throw error
    }

    if (samples.length) {
      const { error } = await supabase
        .from('samples')
        .upsert(samples.slice(0, 50).map((s) => sampleToRow(user.id, s)))
      if (error) throw error
    }

    if (membranes) {
      const { error } = await supabase.from('membranes').upsert(membranesToRow(user.id, membranes))
      if (error) throw error
    }

    const bundle = await loadUserBundle(supabase, user.id)
    return NextResponse.json(bundle)
  } catch (err) {
    console.error('[api/user/bootstrap PUT]', err)
    return NextResponse.json({ error: 'Failed to upload account data' }, { status: 500 })
  }
}
