'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import HeroVisual from '@/components/HeroVisual'
import LanguageSwitch from '@/components/LanguageSwitch'
import { useLang } from '@/lib/i18n'
import { getActiveSourceId, getLatestForSource, getMembranes } from '@/lib/storage'
import type { MembraneInventory, Sample } from '@/types'
import { scoreRingColor } from '@/lib/risk'
import {
  Beaker,
  ChevronRight,
  ClipboardList,
  Droplets,
  Filter,
  Gauge,
  History,
  ScanLine,
  ShieldCheck,
} from 'lucide-react'
import ProSection from '@/components/ProSection'

export default function LandingPage() {
  const { t } = useLang()
  const [latest, setLatest] = useState<Sample | null>(null)
  const [membranes, setMembranes] = useState<MembraneInventory | null>(null)
  const [sourceName, setSourceName] = useState('')

  useEffect(() => {
    const id = getActiveSourceId()
    const sample = getLatestForSource(id)
    setLatest(sample)
    setSourceName(sample?.locationName || 'Home Well')
    setMembranes(getMembranes())
  }, [])

  const steps = [
    { icon: Droplets, title: t.collect, desc: t.collectDesc, num: '01' },
    { icon: Filter, title: t.filter, desc: t.filterDesc, num: '02' },
    { icon: ScanLine, title: t.scan, desc: t.scanDesc, num: '03' },
    { icon: Gauge, title: t.result, desc: t.resultDesc, num: '04' },
  ]

  const benefits = [
    { icon: Gauge, title: t.aquaScore, desc: t.aquaScoreDesc },
    { icon: ShieldCheck, title: t.riskLevels, desc: t.riskLevelsDesc },
    { icon: ClipboardList, title: t.recommendations, desc: t.recommendationsDesc },
    { icon: History, title: t.history, desc: t.historyDesc },
  ]

  const scoreColor = latest ? scoreRingColor(latest.analysis.riskScore) : '#14b8a8'

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar — mobile; desktop uses site Navbar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-teal-50 md:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-teal-800">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <span className="tracking-tight text-lg">{t.brand}</span>
          </Link>
          <LanguageSwitch />
        </div>
      </div>

      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50 via-white to-white">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute top-40 -left-20 w-72 h-72 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16 lg:pt-14 lg:pb-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white border border-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 shadow-sm mb-5">
                <Beaker className="w-3.5 h-3.5" />
                Particle screening · AquaScore
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-black text-gray-900 leading-[1.1] tracking-tight">
                {t.tagline}
              </h1>
              <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">{t.heroDesc}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/test"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white px-7 py-3.5 rounded-2xl font-bold shadow-lg shadow-teal-500/25 hover:opacity-95 transition-all"
                >
                  {t.startTest}
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/overview"
                  className="inline-flex items-center gap-2 bg-white border border-teal-200 text-teal-800 px-6 py-3.5 rounded-2xl font-semibold hover:bg-teal-50 transition-all"
                >
                  {t.openApp}
                </Link>
              </div>
              <p className="mt-5 text-xs text-gray-500 max-w-md leading-relaxed">{t.disclaimer}</p>
            </div>
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* 2. How it works */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-teal-50/80 to-blue-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">{t.howTitle}</h2>
            <p className="mt-3 text-gray-500">{t.howSub}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map(({ icon: Icon, title, desc, num }) => (
              <div
                key={num}
                className="relative bg-white rounded-3xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="absolute top-4 right-5 text-3xl font-black text-teal-100">{num}</span>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-teal-700" />
                </div>
                <h3 className="text-lg font-black text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. What user gets */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">{t.getTitle}</h2>
            <p className="mt-3 text-gray-500">{t.getSub}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex gap-4 bg-gradient-to-br from-gray-50 to-teal-50/40 rounded-3xl border border-teal-100 p-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-teal-100 flex items-center justify-center shrink-0 shadow-sm">
                  <Icon className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                  <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AquaTrace Pro */}
      <ProSection />

      {/* 4. Last result */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">{t.lastTitle}</h2>
            <p className="mt-3 text-gray-500">{t.lastSub}</p>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-[2rem] border border-teal-100 shadow-lg shadow-teal-900/5 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-blue-700 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-xs font-semibold uppercase tracking-wide">{sourceName}</p>
                    <p className="font-bold">AquaScore</p>
              </div>
              <Droplets className="w-6 h-6 text-teal-200" />
            </div>

            {latest ? (
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div
                    className="mx-auto sm:mx-0 relative w-28 h-28 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: `conic-gradient(${scoreColor} ${latest.analysis.riskScore * 3.6}deg, #e5e7eb 0deg)`,
                    }}
                  >
                    <div className="absolute inset-2.5 bg-white rounded-full flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-gray-900 leading-none">
                        {latest.analysis.riskScore}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">/100</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3">
                      <span className="text-sm text-gray-500">{t.waterStatus}</span>
                      <span className="text-sm font-bold text-gray-900 text-right">
                        {latest.analysis.screeningCategory}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3">
                      <span className="text-sm text-gray-500">{t.cartridge}</span>
                      <span className="text-sm font-bold text-gray-900 text-right">
                        {membranes
                          ? `${membranes.remaining} ${t.membranesLeft}`
                          : '—'}
                      </span>
                    </div>
                    {latest.analysis.changeSincePrevious != null && (
                      <p className="text-sm text-gray-500">
                        Δ {latest.analysis.changeSincePrevious > 0 ? '+' : ''}
                        {latest.analysis.changeSincePrevious} · {latest.date}
                      </p>
                    )}
                  </div>
                </div>
                <Link
                  href="/results"
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3.5 rounded-2xl font-bold shadow-md"
                >
                  {t.viewAnalysis}
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="font-bold text-gray-900">{t.noResult}</p>
                <p className="text-sm text-gray-500 mt-2">{t.noResultHint}</p>
                <Link
                  href="/test"
                  className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-bold"
                >
                  {t.startTest}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8 px-4 text-center">
        <p className="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">{t.disclaimer}</p>
      </footer>
    </div>
  )
}
