import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

interface InsightsRequest {
  lang: 'en' | 'ru'
  sample: {
    id: string
    locationName: string
    waterSource: string
    date: string
    riskScore: number
    screeningCategory: string
    suspectedParticles: number
    fiberCount: number
    fragmentCount: number
    contaminationDensity: number
    changeSincePrevious: number | null
  }
  history: { date: string; score: number }[]
}

export interface AiInsights {
  summary: string
  recommendations: string[]
  trend: 'improving' | 'stable' | 'worsening' | 'unknown'
  fallback: boolean
}

/**
 * In-memory cache: identical payloads on a warm serverless instance are
 * answered without hitting the OpenAI API (saves latency and tokens).
 */
const cache = new Map<string, { data: AiInsights; expires: number }>()
const CACHE_TTL_MS = 60 * 60 * 1000
const CACHE_MAX = 200

function cacheKey(body: InsightsRequest): string {
  const s = body.sample
  return [
    body.lang,
    s.id,
    s.riskScore,
    s.suspectedParticles,
    s.fiberCount,
    s.fragmentCount,
    body.history.map((h) => h.score).join(','),
  ].join('|')
}

function getCached(key: string): AiInsights | null {
  const hit = cache.get(key)
  if (!hit) return null
  if (Date.now() > hit.expires) {
    cache.delete(key)
    return null
  }
  return hit.data
}

function setCached(key: string, data: AiInsights): void {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value
    if (oldest) cache.delete(oldest)
  }
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS })
}

function detectTrend(history: { score: number }[]): AiInsights['trend'] {
  if (history.length < 2) return 'unknown'
  const last = history[history.length - 1].score
  const prev = history[history.length - 2].score
  if (last - prev >= 8) return 'worsening'
  if (prev - last >= 8) return 'improving'
  return 'stable'
}

/** Rule-based analysis used when OPENAI_API_KEY is not configured or GPT fails. */
function fallbackInsights(body: InsightsRequest): AiInsights {
  const { sample, history, lang } = body
  const trend = detectTrend(history)
  const ru = lang === 'ru'
  const cat = sample.riskScore <= 30 ? 'low' : sample.riskScore <= 65 ? 'medium' : 'high'

  const summary = ru
    ? `AquaScore ${sample.riskScore}/100 — ${cat === 'low' ? 'низкий' : cat === 'medium' ? 'средний' : 'высокий'} скрининг-риск для источника «${sample.locationName}». Обнаружено подозрительных объектов: ${sample.suspectedParticles} (волокна: ${sample.fiberCount}, фрагменты: ${sample.fragmentCount}).`
    : `AquaScore ${sample.riskScore}/100 — ${cat} screening risk for "${sample.locationName}". Suspicious objects detected: ${sample.suspectedParticles} (fibers: ${sample.fiberCount}, fragments: ${sample.fragmentCount}).`

  const recommendations = ru
    ? cat === 'high'
      ? ['Повторите тест с новой мембраной для подтверждения результата.', 'Если результат останется высоким — обратитесь в аккредитованную лабораторию.', 'Временно используйте фильтрованную или бутилированную воду для питья.']
      : cat === 'medium'
      ? ['Проводите тест этого источника регулярно (раз в 2–4 недели).', 'Проверьте состояние фильтра, если он установлен.', 'При росте показателей повторите тест и рассмотрите лабораторную проверку.']
      : ['Продолжайте периодический скрининг для контроля динамики.', 'Сохраняйте историю тестов, чтобы вовремя заметить изменения.']
    : cat === 'high'
    ? ['Repeat the test with a new membrane to confirm the result.', 'If the score stays high, consider accredited laboratory testing.', 'Temporarily prefer filtered or bottled water for drinking.']
    : cat === 'medium'
    ? ['Test this source regularly (every 2–4 weeks).', 'Check your filter condition if one is installed.', 'If scores keep rising, retest and consider lab confirmation.']
    : ['Continue periodic screening to track the trend.', 'Keep your test history to spot changes early.']

  return { summary, recommendations, trend, fallback: true }
}

function buildPrompt(body: InsightsRequest): { system: string; user: string } {
  const ru = body.lang === 'ru'
  const system = [
    'You are the AquaTrace water-screening analyst. AquaTrace is a portable kit: users filter water through a membrane, photograph it, and get an AquaScore (1-100, higher = more visually suspicious particles).',
    'This is preliminary visual screening, NOT certified laboratory analysis — never claim the water is safe or unsafe, only screening risk.',
    'Be practical, calm and specific. No medical claims.',
    ru ? 'Answer in Russian.' : 'Answer in English.',
    'Return ONLY valid JSON: {"summary": string (2-3 sentences interpreting the result and history), "recommendations": string[] (3-4 short actionable items), "trend": "improving"|"stable"|"worsening"|"unknown"}',
  ].join(' ')

  const s = body.sample
  const user = JSON.stringify({
    current_test: {
      source: s.locationName,
      source_type: s.waterSource,
      date: s.date,
      aqua_score: s.riskScore,
      category: s.screeningCategory,
      suspicious_objects: s.suspectedParticles,
      fibers: s.fiberCount,
      fragments: s.fragmentCount,
      density_index: s.contaminationDensity,
      change_since_previous: s.changeSincePrevious,
    },
    score_history: body.history.slice(-10),
  })
  return { system, user }
}

async function askGpt(body: InsightsRequest, apiKey: string): Promise<AiInsights> {
  const { system, user } = buildPrompt(body)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
        max_tokens: 500,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`OpenAI API ${res.status}: ${text.slice(0, 300)}`)
    }

    const json = await res.json()
    const content = json.choices?.[0]?.message?.content
    if (!content) throw new Error('Empty GPT response')

    const parsed = JSON.parse(content)
    const trends = ['improving', 'stable', 'worsening', 'unknown']
    return {
      summary: String(parsed.summary || ''),
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.slice(0, 4).map(String)
        : [],
      trend: trends.includes(parsed.trend) ? parsed.trend : detectTrend(body.history),
      fallback: false,
    }
  } finally {
    clearTimeout(timer)
  }
}

export async function POST(req: Request) {
  let body: InsightsRequest
  try {
    body = await req.json()
    if (!body?.sample || typeof body.sample.riskScore !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    body.lang = body.lang === 'ru' ? 'ru' : 'en'
    body.history = Array.isArray(body.history) ? body.history : []
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const key = cacheKey(body)
  const cached = getCached(key)
  if (cached) return NextResponse.json(cached)

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    // No key configured: degrade gracefully to rule-based analysis.
    return NextResponse.json(fallbackInsights(body))
  }

  try {
    const insights = await askGpt(body, apiKey)
    if (!insights.summary) throw new Error('GPT returned no summary')
    setCached(key, insights)
    return NextResponse.json(insights)
  } catch (err) {
    console.error('[api/insights] GPT call failed:', err)
    return NextResponse.json(fallbackInsights(body))
  }
}
