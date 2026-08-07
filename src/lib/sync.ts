'use client'

import type { MembraneInventory, Sample, WaterSource } from '@/types'
import {
  getMembranes,
  getProfile,
  getSources,
  getUserSamples,
  replaceLocalAccountData,
  setAccountSignedIn,
} from '@/lib/storage'

const MAX_IMAGE_CHARS = 180_000

export type CloudBundle = {
  profile: { name: string; email: string }
  samples: Sample[]
  sources: WaterSource[]
  membranes: MembraneInventory
}

function trimSampleForSync(sample: Sample): Sample {
  const image = sample.imageDataUrl || ''
  if (image.length <= MAX_IMAGE_CHARS) return sample
  return { ...sample, imageDataUrl: '' }
}

export async function syncSample(sample: Sample): Promise<void> {
  try {
    await fetch('/api/user/samples', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sample: trimSampleForSync(sample) }),
    })
  } catch {
    // Best-effort background sync
  }
}

export async function syncSource(source: WaterSource): Promise<void> {
  try {
    await fetch('/api/user/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source }),
    })
  } catch {
    // ignore
  }
}

export async function syncProfile(profile: { name: string; email: string }): Promise<void> {
  try {
    await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
  } catch {
    // ignore
  }
}

export async function syncMembranes(membranes: MembraneInventory): Promise<void> {
  try {
    await fetch('/api/user/membranes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ membranes }),
    })
  } catch {
    // ignore
  }
}

/** After login: pull cloud data, or push local guest data if cloud is empty. */
export async function bootstrapAccount(): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch('/api/user/bootstrap', { method: 'GET' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { ok: false, message: err.error || 'Could not load account data' }
    }
    const cloud = (await res.json()) as CloudBundle & { empty?: boolean }
    setAccountSignedIn(true)

    const localSamples = getUserSamples()
    const localSources = getSources()
    const localProfile = getProfile()
    const localMembranes = getMembranes()
    const cloudEmpty =
      cloud.empty ||
      ((cloud.samples?.length || 0) === 0 &&
        (cloud.sources?.length || 0) === 0 &&
        !(cloud.profile?.name || cloud.profile?.email))

    if (cloudEmpty && (localSamples.length > 0 || localProfile.name || localProfile.email)) {
      const put = await fetch('/api/user/bootstrap', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: localProfile,
          samples: localSamples.map(trimSampleForSync),
          sources: localSources,
          membranes: localMembranes,
        }),
      })
      if (!put.ok) {
        return { ok: false, message: 'Signed in, but local data upload failed' }
      }
      return { ok: true, message: 'Synced local data to your account' }
    }

    replaceLocalAccountData({
      profile: cloud.profile || { name: '', email: '' },
      samples: cloud.samples || [],
      sources: cloud.sources?.length ? cloud.sources : localSources,
      membranes: cloud.membranes || localMembranes,
    })
    return { ok: true, message: 'Synced to your account' }
  } catch {
    return { ok: false, message: 'Network error while syncing account' }
  }
}

export function markSignedOutLocally(): void {
  setAccountSignedIn(false)
}
