'use client'
import Link from 'next/link'
import { useLang } from '@/lib/i18n'
import clsx from 'clsx'

/** Compact language toggle for headers and landing */
export default function LanguageSwitch({ className }: { className?: string }) {
  const { lang, setLang, t } = useLang()

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border border-teal-200 bg-white/90 p-1 shadow-sm',
        className,
      )}
      role="group"
      aria-label={t.lang}
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={clsx(
          'px-3 py-1.5 rounded-full text-xs font-bold transition-all',
          lang === 'en' ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow' : 'text-gray-500 hover:text-teal-700',
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('ru')}
        className={clsx(
          'px-3 py-1.5 rounded-full text-xs font-bold transition-all',
          lang === 'ru' ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow' : 'text-gray-500 hover:text-teal-700',
        )}
      >
        RU
      </button>
    </div>
  )
}

export function LanguageSwitchLink() {
  return (
    <div className="fixed top-3 right-3 z-[60] md:top-20">
      <LanguageSwitch />
    </div>
  )
}
