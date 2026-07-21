import type { AnalysisResult, ParticleDensity, RiskLevel, ScreeningRiskCategory } from '@/types'

export function scoreToCategory(score: number): ScreeningRiskCategory {
  if (score <= 30) return 'Low Screening Risk'
  if (score <= 65) return 'Medium Screening Risk'
  return 'High Screening Risk'
}

export function categoryToLegacy(category: ScreeningRiskCategory): RiskLevel {
  if (category === 'Low Screening Risk') return 'Low'
  if (category === 'Medium Screening Risk') return 'Medium'
  return 'High'
}

export function densityFromScore(score: number): ParticleDensity {
  if (score <= 30) return 'Low'
  if (score <= 65) return 'Medium'
  return 'High'
}

export function recommendationForScore(score: number, change: number | null): string {
  if (score >= 66) {
    return 'Repeat the test using a new membrane. If the result remains high, consider professional laboratory testing.'
  }
  if (score >= 31) {
    return 'Monitor this source regularly. If scores keep rising, repeat the test and consider laboratory confirmation.'
  }
  if (change != null && change >= 15) {
    return 'Your score increased notably. Retest soon to confirm the change before drawing conclusions.'
  }
  return 'Continue periodic screening. AquaTrace detects visually distinguishable suspicious particles only.'
}

export function getRiskColor(risk: RiskLevel | ScreeningRiskCategory): string {
  const key = risk.includes('Low') ? 'Low' : risk.includes('Medium') ? 'Medium' : 'High'
  return key === 'Low' ? '#14b8a8' : key === 'Medium' ? '#f59e0b' : '#ef4444'
}

export function getRiskBg(risk: RiskLevel | ScreeningRiskCategory): string {
  const key = risk.includes('Low') ? 'Low' : risk.includes('Medium') ? 'Medium' : 'High'
  return key === 'Low'
    ? 'bg-teal-50 text-teal-800 border-teal-200'
    : key === 'Medium'
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : 'bg-red-50 text-red-800 border-red-200'
}

export function scoreRingColor(score: number): string {
  if (score <= 30) return '#14b8a8'
  if (score <= 65) return '#f59e0b'
  return '#ef4444'
}

/** Convert legacy mock samples that only have riskLevel into riskScore */
export function ensureRiskScore(analysis: Partial<AnalysisResult> & { riskLevel?: RiskLevel }): AnalysisResult {
  let riskScore = analysis.riskScore
  if (riskScore == null) {
    if (analysis.riskLevel === 'Low') riskScore = 18 + Math.floor((analysis.suspectedParticles || 10) % 12)
    else if (analysis.riskLevel === 'Medium') riskScore = 40 + Math.floor((analysis.suspectedParticles || 50) % 20)
    else riskScore = 72 + Math.floor((analysis.suspectedParticles || 100) % 20)
  }
  riskScore = Math.min(100, Math.max(1, Math.round(riskScore)))
  const screeningCategory = analysis.screeningCategory || scoreToCategory(riskScore)
  return {
    riskScore,
    screeningCategory,
    particleDensity: analysis.particleDensity || densityFromScore(riskScore),
    suspectedParticles: analysis.suspectedParticles ?? 0,
    fiberCount: analysis.fiberCount ?? 0,
    fragmentCount: analysis.fragmentCount ?? 0,
    contaminationDensity: analysis.contaminationDensity ?? 0,
    riskLevel: analysis.riskLevel || categoryToLegacy(screeningCategory),
    confidenceScore: analysis.confidenceScore ?? 85,
    possibleParticleTypes: analysis.possibleParticleTypes ?? ['suspicious fragments'],
    recommendation: analysis.recommendation || recommendationForScore(riskScore, analysis.changeSincePrevious ?? null),
    changeSincePrevious: analysis.changeSincePrevious ?? null,
  }
}
