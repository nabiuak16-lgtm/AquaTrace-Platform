'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'ru'

const dict = {
  en: {
    brand: 'AquaTrace',
    tagline: 'Know What’s Really in Your Water',
    heroDesc:
      'AquaTrace is a portable screening kit that helps households check water for visually detectable suspicious particles. Filter a sample, scan the membrane with your phone, and get an AquaScore with clear next steps — preliminary screening, not a laboratory certificate.',
    startTest: 'Start Water Test',
    viewAnalysis: 'View Analysis',
    openApp: 'Open overview',
    howTitle: 'How AquaTrace Works',
    howSub: 'Four simple steps from tap to result.',
    collect: 'Collect',
    collectDesc: 'Take a clean sample from your well, tap, or filter outlet.',
    filter: 'Filter',
    filterDesc: 'Pass the water through a single-use AquaTrace membrane.',
    scan: 'Scan',
    scanDesc: 'Photograph the membrane. AI checks photo quality, then analyses particles.',
    result: 'Get Result',
    resultDesc: 'Receive your AquaScore, screening risk level, and recommendations.',
    getTitle: 'What You Get',
    getSub: 'Clear screening insights designed for everyday households.',
    aquaScore: 'AquaScore 1–100',
    aquaScoreDesc: 'A precise Particle Screening Score. Higher means more suspicious particles detected.',
    riskLevels: 'Low / Medium / High risk',
    riskLevelsDesc: 'Screening risk categories that are easy to understand at a glance.',
    recommendations: 'Personal recommendations',
    recommendationsDesc: 'What to do next — retest, check your filter, or consider lab confirmation.',
    history: 'Test history',
    historyDesc: 'Track every water source over time with charts and change alerts.',
    lastTitle: 'Your Latest Result',
    lastSub: 'Most recent AquaScore and kit status.',
    lastScore: 'Latest AquaScore',
    waterStatus: 'Water status',
    cartridge: 'Cartridge / membranes',
    noResult: 'No screening yet',
    noResultHint: 'Run your first water test to see AquaScore here.',
    membranesLeft: 'tests remaining',
    disclaimer:
      'AquaTrace provides preliminary screening and does not replace professional laboratory analysis. AquaScore is not a water-safety guarantee.',
    lang: 'Language',
    navHome: 'Home',
    navSources: 'Sources',
    navTest: 'Test',
    navShop: 'Shop',
    navProfile: 'Profile',
    navPro: 'Pro',
    proBadge: 'For organizations',
    proTitle: 'AquaTrace Pro',
    proPrice: '$20 / month',
    proValue:
      'AquaTrace Pro helps organizations monitor multiple water sources, manage testing teams and identify risks before they become serious problems.',
    proCta: 'Get AquaTrace Pro',
    proLearn: 'See Pro features',
    proFeatureLabel: '5 core capabilities',
    proSubscribe: 'Subscribe · $20',
    proActive: 'Pro active on this device',
  },
  ru: {
    brand: 'AquaTrace',
    tagline: 'Узнайте, что на самом деле в вашей воде',
    heroDesc:
      'AquaTrace — портативный набор для скрининга: проверьте воду на визуально заметные подозрительные частицы. Отфильтруйте пробу, отсканируйте мембрану телефоном и получите AquaScore с понятными рекомендациями — это предварительный скрининг, а не лабораторный сертификат.',
    startTest: 'Начать тест воды',
    viewAnalysis: 'Смотреть анализ',
    openApp: 'Открыть обзор',
    howTitle: 'Как работает AquaTrace',
    howSub: 'Четыре простых шага от пробы до результата.',
    collect: 'Сбор',
    collectDesc: 'Возьмите чистую пробу из колодца, крана или после фильтра.',
    filter: 'Фильтрация',
    filterDesc: 'Пропустите воду через одноразовую мембрану AquaTrace.',
    scan: 'Сканирование',
    scanDesc: 'Сфотографируйте мембрану. ИИ проверит качество фото и проанализирует частицы.',
    result: 'Результат',
    resultDesc: 'Получите AquaScore, уровень скрининг-риска и рекомендации.',
    getTitle: 'Что получает пользователь',
    getSub: 'Понятные результаты скрининга для домашнего использования.',
    aquaScore: 'AquaScore 1–100',
    aquaScoreDesc: 'Точный Particle Screening Score. Чем выше — тем больше подозрительных частиц.',
    riskLevels: 'Низкий / Средний / Высокий риск',
    riskLevelsDesc: 'Категории скрининг-риска, которые легко понять с первого взгляда.',
    recommendations: 'Персональные рекомендации',
    recommendationsDesc: 'Что делать дальше — повторить тест, проверить фильтр или обратиться в лабораторию.',
    history: 'История тестов',
    historyDesc: 'Отслеживайте каждый источник воды: графики и предупреждения об изменениях.',
    lastTitle: 'Последний результат',
    lastSub: 'Актуальный AquaScore и состояние набора.',
    lastScore: 'Последний AquaScore',
    waterStatus: 'Статус воды',
    cartridge: 'Картридж / мембраны',
    noResult: 'Тестов пока нет',
    noResultHint: 'Пройдите первый тест воды, чтобы увидеть AquaScore.',
    membranesLeft: 'тестов осталось',
    disclaimer:
      'AquaTrace даёт предварительный скрининг и не заменяет профессиональный лабораторный анализ. AquaScore не гарантирует безопасность воды.',
    lang: 'Язык',
    navHome: 'Главная',
    navSources: 'Источники',
    navTest: 'Тест',
    navShop: 'Магазин',
    navProfile: 'Профиль',
    navPro: 'Pro',
    proBadge: 'Для организаций',
    proTitle: 'AquaTrace Pro',
    proPrice: '$20 / месяц',
    proValue:
      'AquaTrace Pro помогает организациям контролировать несколько источников воды, управлять командами тестирования и выявлять риски до того, как они станут серьёзной проблемой.',
    proCta: 'Подключить AquaTrace Pro',
    proLearn: 'Смотреть функции Pro',
    proFeatureLabel: '5 главных функций',
    proSubscribe: 'Подписка · $20',
    proActive: 'Pro активен на этом устройстве',
  },
} as const

export type Dict = {
  [K in keyof (typeof dict)['en']]: string
}

const LangContext = createContext<{
  lang: Lang
  t: Dict
  setLang: (l: Lang) => void
  toggle: () => void
} | null>(null)

const KEY = 'aquatrace_lang'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem(KEY) as Lang | null
    if (saved === 'en' || saved === 'ru') setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem(KEY, l)
  }

  const toggle = () => setLang(lang === 'en' ? 'ru' : 'en')

  return (
    <LangContext.Provider value={{ lang, t: dict[lang], setLang, toggle }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
