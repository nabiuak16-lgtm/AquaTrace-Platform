import type { MembraneInventory, Sample, WaterSource } from '@/types'
import type { SupabaseClient } from '@supabase/supabase-js'

type DbSample = {
  id: string
  source_id: string
  location_name: string
  water_source: string
  volume_filtered: number
  latitude: number
  longitude: number
  notes: string
  image_data_url: string | null
  date: string
  analysis: Sample['analysis']
  possible_source: string
  submitted_to_map: boolean
  compare_pair_id: string | null
  compare_role: string | null
}

export function sampleToRow(userId: string, sample: Sample) {
  return {
    id: sample.id,
    user_id: userId,
    source_id: sample.sourceId || '',
    location_name: sample.locationName || '',
    water_source: sample.waterSource || 'Other',
    volume_filtered: sample.volumeFiltered ?? 0,
    latitude: sample.latitude ?? 0,
    longitude: sample.longitude ?? 0,
    notes: sample.notes || '',
    image_data_url: sample.imageDataUrl || null,
    date: sample.date,
    analysis: sample.analysis,
    possible_source: sample.possibleSource || '',
    submitted_to_map: Boolean(sample.submittedToMap),
    compare_pair_id: sample.comparePairId || null,
    compare_role: sample.compareRole || null,
    updated_at: new Date().toISOString(),
  }
}

export function rowToSample(row: DbSample): Sample {
  return {
    id: row.id,
    sourceId: row.source_id,
    locationName: row.location_name,
    waterSource: row.water_source as Sample['waterSource'],
    volumeFiltered: Number(row.volume_filtered) || 0,
    latitude: Number(row.latitude) || 0,
    longitude: Number(row.longitude) || 0,
    notes: row.notes || '',
    imageDataUrl: row.image_data_url || undefined,
    date: row.date,
    analysis: row.analysis,
    possibleSource: row.possible_source || '',
    submittedToMap: Boolean(row.submitted_to_map),
    comparePairId: row.compare_pair_id || undefined,
    compareRole: (row.compare_role as Sample['compareRole']) || undefined,
  }
}

export function sourceToRow(userId: string, source: WaterSource) {
  return {
    id: source.id,
    user_id: userId,
    name: source.name,
    type: source.type,
    location: source.location || null,
    created_at: source.createdAt,
    next_test_date: source.nextTestDate || null,
  }
}

export function rowToSource(row: {
  id: string
  name: string
  type: string
  location: string | null
  created_at: string
  next_test_date: string | null
}): WaterSource {
  return {
    id: row.id,
    name: row.name,
    type: row.type as WaterSource['type'],
    location: row.location || undefined,
    createdAt: row.created_at,
    nextTestDate: row.next_test_date || undefined,
  }
}

export function membranesToRow(userId: string, membranes: MembraneInventory) {
  return {
    user_id: userId,
    remaining: membranes.remaining,
    pack_size: membranes.packSize,
    estimated_until: membranes.estimatedUntil,
    last_activated_at: membranes.lastActivatedAt || null,
    activations: membranes.activations || [],
    updated_at: new Date().toISOString(),
  }
}

export function rowToMembranes(row: {
  remaining: number
  pack_size: number
  estimated_until: string
  last_activated_at: string | null
  activations: MembraneInventory['activations']
}): MembraneInventory {
  return {
    remaining: row.remaining,
    packSize: row.pack_size,
    estimatedUntil: row.estimated_until,
    lastActivatedAt: row.last_activated_at || undefined,
    activations: Array.isArray(row.activations) ? row.activations : [],
  }
}

export async function loadUserBundle(supabase: SupabaseClient, userId: string) {
  const [profileRes, samplesRes, sourcesRes, membranesRes] = await Promise.all([
    supabase.from('profiles').select('name, email').eq('id', userId).maybeSingle(),
    supabase.from('samples').select('*').eq('user_id', userId).order('date', { ascending: false }),
    supabase.from('sources').select('*').eq('user_id', userId),
    supabase.from('membranes').select('*').eq('user_id', userId).maybeSingle(),
  ])

  if (profileRes.error) throw profileRes.error
  if (samplesRes.error) throw samplesRes.error
  if (sourcesRes.error) throw sourcesRes.error
  if (membranesRes.error) throw membranesRes.error

  const samples = (samplesRes.data || []).map((row) => rowToSample(row as DbSample))
  const sources = (sourcesRes.data || []).map((row) => rowToSource(row as never))
  const membranes = membranesRes.data
    ? rowToMembranes(membranesRes.data as never)
    : {
        remaining: 2,
        packSize: 10,
        estimatedUntil: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        activations: [],
      }

  return {
    profile: {
      name: profileRes.data?.name || '',
      email: profileRes.data?.email || '',
    },
    samples,
    sources,
    membranes,
    empty:
      samples.length === 0 &&
      sources.length === 0 &&
      !(profileRes.data?.name || profileRes.data?.email),
  }
}
