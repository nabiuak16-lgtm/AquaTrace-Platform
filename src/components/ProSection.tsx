'use client'
import Link from 'next/link'
import { useLang } from '@/lib/i18n'
import { AQUATRACE_PRO_PRICE, PRO_FEATURES } from '@/lib/shop'
import {
  BarChart3,
  Bell,
  Building2,
  Check,
  FileText,
  LayoutDashboard,
  Users,
} from 'lucide-react'

const ICONS = [LayoutDashboard, Users, FileText, Bell, BarChart3]

interface Props {
  compact?: boolean
  onSubscribe?: () => void
}

export default function ProSection({ compact, onSubscribe }: Props) {
  const { lang, t } = useLang()

  return (
    <section className={compact ? '' : 'py-16 sm:py-20 bg-gradient-to-br from-slate-900 via-teal-900 to-blue-900 text-white'}>
      <div className={compact ? '' : 'max-w-6xl mx-auto px-4 sm:px-6'}>
        <div className={compact ? 'bg-gradient-to-br from-slate-900 via-teal-900 to-blue-900 text-white rounded-3xl p-6 sm:p-8' : ''}>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold text-teal-100 mb-4">
                <Building2 className="w-3.5 h-3.5" />
                {t.proBadge}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{t.proTitle}</h2>
              <p className="mt-2 text-2xl font-bold text-teal-200">{t.proPrice}</p>
              <p className="mt-4 text-teal-50/90 leading-relaxed text-base sm:text-lg">{t.proValue}</p>
            </div>
            <div className="rounded-2xl bg-white text-teal-900 px-5 py-4 shadow-lg min-w-[140px] text-center">
              <p className="text-xs font-semibold uppercase text-teal-600">Plan</p>
              <p className="text-3xl font-black mt-1">${AQUATRACE_PRO_PRICE}</p>
              <p className="text-xs text-gray-500 mt-1">USD / month</p>
            </div>
          </div>

          <p className="text-sm font-semibold text-teal-200 mb-4">{t.proFeatureLabel}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {PRO_FEATURES.map((f, i) => {
              const Icon = ICONS[i]
              return (
                <div
                  key={f.id}
                  className="rounded-2xl bg-white/10 border border-white/10 p-4 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-400/20 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-teal-200" />
                  </div>
                  <h3 className="font-bold text-white">
                    {lang === 'ru' ? f.titleRu : f.titleEn}
                  </h3>
                  <p className="mt-1.5 text-sm text-teal-100/85 leading-relaxed">
                    {lang === 'ru' ? f.descRu : f.descEn}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            {onSubscribe ? (
              <button
                type="button"
                onClick={onSubscribe}
                className="inline-flex items-center gap-2 bg-white text-teal-900 px-6 py-3.5 rounded-2xl font-bold shadow-lg hover:bg-teal-50 transition-colors"
              >
                <Check className="w-5 h-5" />
                {t.proSubscribe}
              </button>
            ) : (
              <Link
                href="/pro"
                className="inline-flex items-center gap-2 bg-white text-teal-900 px-6 py-3.5 rounded-2xl font-bold shadow-lg hover:bg-teal-50 transition-colors"
              >
                {t.proCta}
              </Link>
            )}
            {!compact && (
              <Link
                href="/pro"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3.5 rounded-2xl font-semibold hover:bg-white/15"
              >
                {t.proLearn}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
