export type ScreeningRiskCategory = 'Low Screening Risk' | 'Medium Screening Risk' | 'High Screening Risk'
/** @deprecated use ScreeningRiskCategory — kept for mock data compat */
export type RiskLevel = 'Low' | 'Medium' | 'High'

export type ParticleDensity = 'Low' | 'Medium' | 'High'

export type WaterSourceType =
  | 'Well'
  | 'Tap'
  | 'After filter'
  | 'Borehole'
  | 'Spring'
  | 'Other'

export interface AnalysisResult {
  /** AquaTrace Risk Score 1–100 */
  riskScore: number
  screeningCategory: ScreeningRiskCategory
  particleDensity: ParticleDensity
  suspectedParticles: number
  fiberCount: number
  fragmentCount: number
  contaminationDensity: number
  /** Legacy Low/Medium/High for older UI pieces */
  riskLevel: RiskLevel
  confidenceScore: number
  possibleParticleTypes: string[]
  recommendation: string
  changeSincePrevious: number | null
}

export interface WaterSource {
  id: string
  name: string
  type: WaterSourceType
  location?: string
  createdAt: string
  nextTestDate?: string
}

export interface Sample {
  id: string
  sourceId: string
  locationName: string
  waterSource: WaterSourceType
  volumeFiltered: number
  latitude: number
  longitude: number
  notes: string
  imageDataUrl?: string
  date: string
  analysis: AnalysisResult
  possibleSource: string
  submittedToMap: boolean
  comparePairId?: string
  compareRole?: 'before' | 'after'
}

export interface MembraneInventory {
  remaining: number
  packSize: number
  estimatedUntil: string
  lastActivatedAt?: string
  activations: { code: string; testsAdded: number; date: string }[]
}

export interface ShopProduct {
  id: string
  name: string
  description: string
  tests?: number
  price: number
  compatibility: string
  delivery: string
  category: 'membrane' | 'prefilter' | 'accessory' | 'subscription'
  emoji: string
}

export interface CompareSession {
  before?: Sample
  after?: Sample
}
