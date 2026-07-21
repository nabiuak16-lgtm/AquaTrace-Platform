import type { AnalysisResult, RiskLevel } from '@/types'
import {
  categoryToLegacy,
  densityFromScore,
  ensureRiskScore,
  recommendationForScore,
  scoreToCategory,
} from './risk'

export { getRiskColor, getRiskBg } from './risk'

export const MOCK_SAMPLES = [
  {
    id: 'mock-1',
    sourceId: 'src-home-well',
    locationName: 'Home Well',
    waterSource: 'Well' as const,
    volumeFiltered: 500,
    latitude: 51.1801,
    longitude: 71.446,
    notes: 'Baseline rural well',
    date: '2026-06-10',
    submittedToMap: false,
    possibleSource: 'Source unknown — continue monitoring',
    analysis: ensureRiskScore({
      suspectedParticles: 22,
      fiberCount: 8,
      fragmentCount: 14,
      contaminationDensity: 44,
      riskLevel: 'Low' as RiskLevel,
      riskScore: 34,
      confidenceScore: 88,
      possibleParticleTypes: ['clear fragments', 'colored fibers'],
    }),
  },
  {
    id: 'mock-2',
    sourceId: 'src-home-well',
    locationName: 'Home Well',
    waterSource: 'Well' as const,
    volumeFiltered: 500,
    latitude: 51.1801,
    longitude: 71.446,
    notes: 'Follow-up screening',
    date: '2026-06-24',
    submittedToMap: false,
    possibleSource: 'Source unknown — continue monitoring',
    analysis: ensureRiskScore({
      suspectedParticles: 41,
      fiberCount: 16,
      fragmentCount: 25,
      contaminationDensity: 82,
      riskLevel: 'Medium' as RiskLevel,
      riskScore: 47,
      confidenceScore: 86,
      possibleParticleTypes: ['colored fibers', 'irregular fragments'],
      changeSincePrevious: 13,
    }),
  },
  {
    id: 'mock-3',
    sourceId: 'src-home-well',
    locationName: 'Home Well',
    waterSource: 'Well' as const,
    volumeFiltered: 500,
    latitude: 51.1801,
    longitude: 71.446,
    notes: 'Latest home well screening',
    date: '2026-07-08',
    submittedToMap: false,
    possibleSource: 'Possible agricultural film influence nearby',
    analysis: ensureRiskScore({
      suspectedParticles: 98,
      fiberCount: 40,
      fragmentCount: 58,
      contaminationDensity: 196,
      riskLevel: 'High' as RiskLevel,
      riskScore: 72,
      confidenceScore: 91,
      possibleParticleTypes: ['colored fibers', 'clear fragments', 'irregular fragments'],
      changeSincePrevious: 25,
    }),
  },
  {
    id: 'mock-4',
    sourceId: 'src-kitchen-tap',
    locationName: 'Kitchen Tap',
    waterSource: 'Tap' as const,
    volumeFiltered: 500,
    latitude: 51.181,
    longitude: 71.447,
    notes: 'Municipal tap',
    date: '2026-07-05',
    submittedToMap: false,
    possibleSource: 'Possible urban pipe / distribution influence',
    analysis: ensureRiskScore({
      suspectedParticles: 55,
      fiberCount: 20,
      fragmentCount: 35,
      contaminationDensity: 110,
      riskLevel: 'Medium' as RiskLevel,
      riskScore: 48,
      confidenceScore: 84,
      possibleParticleTypes: ['colored fibers', 'clear fragments'],
    }),
  },
  {
    id: 'mock-5',
    sourceId: 'src-after-filter',
    locationName: 'Water after filter',
    waterSource: 'After filter' as const,
    volumeFiltered: 500,
    latitude: 51.181,
    longitude: 71.447,
    notes: 'Post-filter kitchen sample',
    date: '2026-07-06',
    submittedToMap: false,
    possibleSource: 'Filtered household water',
    analysis: ensureRiskScore({
      suspectedParticles: 16,
      fiberCount: 5,
      fragmentCount: 11,
      contaminationDensity: 32,
      riskLevel: 'Low' as RiskLevel,
      riskScore: 24,
      confidenceScore: 90,
      possibleParticleTypes: ['clear fragments'],
    }),
  },
]

export function detectPossibleSource(locationName: string, notes: string): string {
  const combined = `${locationName} ${notes}`.toLowerCase()
  if (/landfill|waste|dump|свалк|отход|полигон/.test(combined)) return 'Possible landfill / waste influence'
  if (/farm|agricultur|field|crop|mulch|ферм|сельск|пол|плёнк|пленк/.test(combined))
    return 'Possible agricultural film influence'
  if (/factor|industrial|industry|plant|discharge|завод|промышл|фабрик/.test(combined))
    return 'Possible industrial discharge influence'
  if (/city|urban|sewage|wastewater|canal|город|канализац|сток|канал/.test(combined))
    return 'Possible urban / wastewater influence'
  return 'Source unknown — continue monitoring'
}

export function runMockAnalysis(
  volumeFiltered: number,
  previousScore: number | null = null,
  biasToward?: 'low' | 'high' | 'mid',
): AnalysisResult {
  let riskScore = Math.floor(Math.random() * 90) + 8
  if (biasToward === 'high') riskScore = Math.floor(Math.random() * 28) + 70
  if (biasToward === 'low') riskScore = Math.floor(Math.random() * 22) + 8
  if (biasToward === 'mid') riskScore = Math.floor(Math.random() * 30) + 32

  riskScore = Math.min(100, Math.max(1, riskScore))
  const screeningCategory = scoreToCategory(riskScore)
  const riskLevel = categoryToLegacy(screeningCategory)
  const particleDensity = densityFromScore(riskScore)

  const suspectedParticles = Math.round(riskScore * 1.4 + Math.random() * 12)
  const fiberCount = Math.floor(suspectedParticles * (0.3 + Math.random() * 0.25))
  const fragmentCount = Math.max(0, suspectedParticles - fiberCount)
  const contaminationDensity = Math.round((suspectedParticles / Math.max(volumeFiltered, 1)) * 1000)
  const confidenceScore = Math.floor(Math.random() * 14) + 82
  const changeSincePrevious = previousScore != null ? riskScore - previousScore : null

  const allTypes = ['colored fibers', 'clear fragments', 'irregular suspicious fragments']
  const count = riskLevel === 'Low' ? 1 : riskLevel === 'Medium' ? 2 : 3

  return {
    riskScore,
    screeningCategory,
    particleDensity,
    suspectedParticles,
    fiberCount,
    fragmentCount,
    contaminationDensity,
    riskLevel,
    confidenceScore,
    possibleParticleTypes: allTypes.slice(0, count),
    recommendation: recommendationForScore(riskScore, changeSincePrevious),
    changeSincePrevious,
  }
}
