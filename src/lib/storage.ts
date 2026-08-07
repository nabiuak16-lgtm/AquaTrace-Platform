import type { CompareSession, MembraneInventory, Sample, WaterSource } from '@/types'
import { MOCK_SAMPLES } from './data'
import { ensureRiskScore } from './risk'

const SAMPLES_KEY = 'aquatrace_samples_v2'
const SOURCES_KEY = 'aquatrace_sources_v2'
const MEMBRANE_KEY = 'aquatrace_membranes_v2'
const ACTIVE_SOURCE_KEY = 'aquatrace_active_source'
const COMPARE_KEY = 'aquatrace_compare_session'
const PROFILE_KEY = 'aquatrace_profile'
const SIGNED_IN_KEY = 'aquatrace_signed_in'
const MAX_STORED_SAMPLES = 50

function queueCloudSync(run: (mod: typeof import('@/lib/sync')) => Promise<void>): void {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(SIGNED_IN_KEY) !== '1') return
  void import('@/lib/sync')
    .then((mod) => run(mod))
    .catch(() => {})
}

export function setAccountSignedIn(signedIn: boolean): void {
  if (typeof window === 'undefined') return
  if (signedIn) localStorage.setItem(SIGNED_IN_KEY, '1')
  else localStorage.removeItem(SIGNED_IN_KEY)
}

export function isAccountSignedIn(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(SIGNED_IN_KEY) === '1'
}

const DEFAULT_SOURCES: WaterSource[] = [
  {
    id: 'src-home-well',
    name: 'Home Well',
    type: 'Well',
    location: 'Backyard',
    createdAt: '2026-06-01',
    nextTestDate: '2026-07-22',
  },
  {
    id: 'src-kitchen-tap',
    name: 'Kitchen Tap',
    type: 'Tap',
    location: 'Kitchen',
    createdAt: '2026-06-01',
    nextTestDate: '2026-07-20',
  },
  {
    id: 'src-after-filter',
    name: 'Water after filter',
    type: 'After filter',
    location: 'Kitchen filter outlet',
    createdAt: '2026-06-01',
    nextTestDate: '2026-07-21',
  },
  {
    id: 'src-grandparents',
    name: "Grandparents' house",
    type: 'Well',
    location: 'Optional — countryside',
    createdAt: '2026-06-15',
    nextTestDate: '2026-07-28',
  },
]

function defaultMembranes(): MembraneInventory {
  const until = new Date()
  until.setDate(until.getDate() + 14)
  return {
    remaining: 2,
    packSize: 10,
    estimatedUntil: until.toISOString().slice(0, 10),
    activations: [],
  }
}

function normalizeSample(s: Sample): Sample {
  return { ...s, analysis: ensureRiskScore(s.analysis) }
}

export function replaceLocalAccountData(data: {
  profile: { name: string; email: string }
  samples: Sample[]
  sources: WaterSource[]
  membranes: MembraneInventory
}): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile))
  localStorage.setItem(
    SAMPLES_KEY,
    JSON.stringify(data.samples.map(normalizeSample).slice(0, MAX_STORED_SAMPLES)),
  )
  localStorage.setItem(SOURCES_KEY, JSON.stringify(data.sources))
  localStorage.setItem(MEMBRANE_KEY, JSON.stringify(data.membranes))
}

export function getUserSamples(): Sample[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SAMPLES_KEY)
    const list: Sample[] = raw ? JSON.parse(raw) : []
    return list.map(normalizeSample)
  } catch {
    return []
  }
}

export function saveUserSample(sample: Sample): void {
  if (typeof window === 'undefined') return
  const existing = getUserSamples()
  const normalized = normalizeSample(sample)
  const list = [normalized, ...existing].slice(0, MAX_STORED_SAMPLES)
  try {
    localStorage.setItem(SAMPLES_KEY, JSON.stringify(list))
  } catch {
    // Storage full (usually old full-size images). Keep the newest test only,
    // dropping older images so screening never gets stuck on a write.
    const trimmed = list.slice(0, 10).map((s, i) => (i === 0 ? s : { ...s, imageDataUrl: '' }))
    try {
      localStorage.setItem(SAMPLES_KEY, JSON.stringify(trimmed))
    } catch {
      localStorage.setItem(SAMPLES_KEY, JSON.stringify([list[0]]))
    }
  }
  consumeMembrane()
  queueCloudSync(async (mod) => {
    await mod.syncSample(normalized)
    await mod.syncMembranes(getMembranes())
  })
}

export function updateSample(id: string, updates: Partial<Sample>): void {
  if (typeof window === 'undefined') return
  const existing = getUserSamples()
  const updated = existing.map((s) => (s.id === id ? normalizeSample({ ...s, ...updates }) : s))
  localStorage.setItem(SAMPLES_KEY, JSON.stringify(updated))
  const next = updated.find((s) => s.id === id)
  if (next) {
    queueCloudSync(async (mod) => {
      await mod.syncSample(next)
    })
  }
}

export function getAllSamples(): Sample[] {
  const user = getUserSamples()
  // Demo history only for guests — signed-in accounts see their own data only.
  if (isAccountSignedIn()) return user
  const mocks = MOCK_SAMPLES.map((s) => normalizeSample(s as Sample))
  return [...user, ...mocks]
}

export function getSamplesForSource(sourceId: string): Sample[] {
  return getAllSamples()
    .filter((s) => s.sourceId === sourceId || (!s.sourceId && s.locationName))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function getLatestForSource(sourceId: string): Sample | null {
  const list = getSamplesForSource(sourceId)
  return list.length ? list[list.length - 1] : null
}

export function getPendingResult(): Sample | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem('aquatrace_pending')
    return raw ? normalizeSample(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function setPendingResult(sample: Sample): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('aquatrace_pending', JSON.stringify(normalizeSample(sample)))
}

export function clearPendingResult(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('aquatrace_pending')
}

export function getSources(): WaterSource[] {
  if (typeof window === 'undefined') return DEFAULT_SOURCES
  try {
    const raw = localStorage.getItem(SOURCES_KEY)
    if (!raw) {
      localStorage.setItem(SOURCES_KEY, JSON.stringify(DEFAULT_SOURCES))
      return DEFAULT_SOURCES
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_SOURCES
  }
}

export function saveSource(source: WaterSource): void {
  if (typeof window === 'undefined') return
  const list = getSources()
  const idx = list.findIndex((s) => s.id === source.id)
  if (idx >= 0) list[idx] = source
  else list.push(source)
  localStorage.setItem(SOURCES_KEY, JSON.stringify(list))
  queueCloudSync(async (mod) => {
    await mod.syncSource(source)
  })
}

export function getActiveSourceId(): string {
  if (typeof window === 'undefined') return 'src-home-well'
  return localStorage.getItem(ACTIVE_SOURCE_KEY) || 'src-home-well'
}

export function setActiveSourceId(id: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACTIVE_SOURCE_KEY, id)
}

export function getMembranes(): MembraneInventory {
  if (typeof window === 'undefined') return defaultMembranes()
  try {
    const raw = localStorage.getItem(MEMBRANE_KEY)
    if (!raw) {
      const d = defaultMembranes()
      localStorage.setItem(MEMBRANE_KEY, JSON.stringify(d))
      return d
    }
    return JSON.parse(raw)
  } catch {
    return defaultMembranes()
  }
}

export function setMembranes(inv: MembraneInventory): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(MEMBRANE_KEY, JSON.stringify(inv))
  queueCloudSync(async (mod) => {
    await mod.syncMembranes(inv)
  })
}

export function consumeMembrane(): boolean {
  const inv = getMembranes()
  if (inv.remaining <= 0) return false
  inv.remaining -= 1
  setMembranes(inv)
  return true
}

export function activatePack(code: string, tests: number): { ok: boolean; message: string; remaining: number } {
  const normalized = code.trim().toUpperCase()
  const valid =
    normalized.startsWith('AT-') ||
    normalized.includes('MEMBRANE') ||
    normalized.includes('AQUATRACE') ||
    /^\d{6,}$/.test(normalized) ||
    normalized.length >= 4

  if (!valid) {
    return { ok: false, message: 'QR / code not recognized as a compatible AquaTrace refill.', remaining: getMembranes().remaining }
  }

  const inv = getMembranes()
  inv.remaining += tests
  inv.packSize = Math.max(inv.packSize, tests)
  inv.lastActivatedAt = new Date().toISOString().slice(0, 10)
  const until = new Date()
  until.setDate(until.getDate() + Math.max(7, inv.remaining * 3))
  inv.estimatedUntil = until.toISOString().slice(0, 10)
  inv.activations = [
    { code: normalized, testsAdded: tests, date: inv.lastActivatedAt },
    ...inv.activations,
  ].slice(0, 20)
  setMembranes(inv)
  return { ok: true, message: `New pack activated. +${tests} tests added.`, remaining: inv.remaining }
}

export function getCompareSession(): CompareSession {
  if (typeof window === 'undefined') return {}
  try {
    const raw = sessionStorage.getItem(COMPARE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function setCompareSession(session: CompareSession): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(COMPARE_KEY, JSON.stringify(session))
}

export function clearCompareSession(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(COMPARE_KEY)
}

export function getProfile(): { name: string; email: string } {
  if (typeof window === 'undefined') return { name: '', email: '' }
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) : { name: 'Household User', email: '' }
  } catch {
    return { name: 'Household User', email: '' }
  }
}

export function saveProfile(p: { name: string; email: string }): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
  queueCloudSync(async (mod) => {
    await mod.syncProfile(p)
  })
}

export function significantRise(current: number, previous: number | null, baselineAvg?: number): boolean {
  if (previous != null && current - previous >= 15) return true
  if (baselineAvg != null && current - baselineAvg >= 20) return true
  return false
}
