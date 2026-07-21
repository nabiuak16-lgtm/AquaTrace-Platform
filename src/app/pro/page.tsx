'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import LanguageSwitch from '@/components/LanguageSwitch'
import ProSection from '@/components/ProSection'
import { useLang } from '@/lib/i18n'
import { AQUATRACE_PRO_PRICE, PRO_FEATURES } from '@/lib/shop'
import { CheckCircle2, Droplets, LayoutDashboard } from 'lucide-react'

const PRO_KEY = 'aquatrace_pro_active'

export default function ProPage() {
  const { lang, t } = useLang()
  const [active, setActive] = useState(false)
  const [justSubscribed, setJustSubscribed] = useState(false)

  useEffect(() => {
    setActive(localStorage.getItem(PRO_KEY) === '1')
  }, [])

  const subscribe = () => {
    localStorage.setItem(PRO_KEY, '1')
    setActive(true)
    setJustSubscribed(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-teal-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between md:hidden">
          <Link href="/" className="flex items-center gap-2 font-bold text-teal-800">
            <Droplets className="w-5 h-5 text-teal-600" />
            {t.brand} Pro
          </Link>
          <LanguageSwitch />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="hidden md:flex justify-end mb-4">
          <LanguageSwitch />
        </div>

        <ProSection compact onSubscribe={subscribe} />

        {justSubscribed && (
          <div className="mt-4 flex gap-2 rounded-2xl bg-teal-50 border border-teal-200 p-4 text-sm text-teal-900">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-teal-600" />
            {t.proActive} — demo subscription (${AQUATRACE_PRO_PRICE}/mo) enabled on this device.
          </div>
        )}

        {active && (
          <div className="mt-6 bg-white rounded-3xl border border-teal-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-teal-700 font-bold mb-4">
              <LayoutDashboard className="w-5 h-5" />
              Multi-Location Dashboard · preview
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: lang === 'ru' ? 'Школа №12' : 'School #12', score: 28, risk: 'Low' },
                { name: lang === 'ru' ? 'Ферма Север' : 'North Farm', score: 61, risk: 'Medium' },
                { name: lang === 'ru' ? 'Офис HQ' : 'Office HQ', score: 22, risk: 'Low' },
                { name: lang === 'ru' ? 'Район Восток' : 'East District', score: 74, risk: 'High' },
                { name: lang === 'ru' ? 'Точка забора А' : 'Intake Point A', score: 45, risk: 'Medium' },
                { name: lang === 'ru' ? 'Складской кран' : 'Warehouse Tap', score: 33, risk: 'Medium' },
              ].map((site) => (
                <div key={site.name} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="font-bold text-gray-900">{site.name}</p>
                  <p className="text-2xl font-black text-teal-700 mt-1">{site.score}/100</p>
                  <p className="text-xs text-gray-500 mt-1">{site.risk} Screening Risk</p>
                </div>
              ))}
            </div>
            <ul className="mt-5 space-y-2 text-sm text-gray-600">
              {PRO_FEATURES.map((f) => (
                <li key={f.id} className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                  {lang === 'ru' ? f.titleRu : f.titleEn}
                </li>
              ))}
            </ul>
            <Link
              href="/overview"
              className="mt-5 inline-flex font-semibold text-teal-700 hover:underline"
            >
              {t.openApp} →
            </Link>
          </div>
        )}

        <p className="mt-8 text-xs text-gray-500 text-center max-w-2xl mx-auto leading-relaxed">
          {t.disclaimer}
        </p>
      </div>
    </div>
  )
}
