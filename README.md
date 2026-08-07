# AquaTrace

**Know What’s Really in Your Water**

Portable water particle screening: filter a sample, scan the membrane with your phone, and get an **AquaScore (1–100)** with clear screening recommendations.

Live demo: [https://aquatrace-ten.vercel.app](https://aquatrace-ten.vercel.app)

---

## Features

- Beautiful landing (EN / RU): explain → how it works → Start Water Test
- AquaScore risk screening (Low / Medium / High)
- Water source passports & test history
- Before & After filter comparison
- AI photo quality check
- **AI analysis (Gemini)** — AI interpretation of each result with personalised recommendations (EN / RU)
- Membrane shop & pack activation
- **AquaTrace Pro ($20/mo)** — multi-location dashboard, team access, PDF reports, alerts, analytics
- Replacement Prefilters — **$5**

> AquaTrace provides preliminary screening and does not replace professional laboratory analysis.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## AI (Gemini) integration

The results page calls `POST /api/insights`, which sends the test data to Google Gemini (`gemini-flash-latest` by default, free tier) and returns a summary, trend and recommendations. The API key stays on the server.

1. Copy `.env.local.example` to `.env.local` and set `GEMINI_API_KEY` (free key: https://aistudio.google.com/apikey).
2. On Vercel: Project Settings → Environment Variables → add `GEMINI_API_KEY`.

Without a key the endpoint gracefully falls back to rule-based analysis, so the site keeps working.

To keep AI usage low, responses are cached: per sample in the browser (`localStorage`) and per payload on the server (in-memory, 1 h TTL).

## Stack

- Next.js 14 · React · TypeScript · Tailwind CSS

## Deploy

Configured for Vercel (`npm run build`).
