import type { ShopProduct } from '@/types'

export const AQUATRACE_PRO_PRICE = 20

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'pack-5',
    name: 'AquaTrace Membrane Pack ×5',
    description: 'Five single-use screening membranes. One membrane = one completed test.',
    tests: 5,
    price: 14.9,
    compatibility: 'AquaTrace cartridge holder (all generations)',
    delivery: '2–4 business days',
    category: 'membrane',
    emoji: '🧪',
  },
  {
    id: 'pack-10',
    name: 'AquaTrace Membrane Pack ×10',
    description: 'Best household refill. Scan QR after opening to add tests to your counter.',
    tests: 10,
    price: 24.9,
    compatibility: 'AquaTrace cartridge holder (all generations)',
    delivery: '2–4 business days',
    category: 'membrane',
    emoji: '📦',
  },
  {
    id: 'pack-20',
    name: 'AquaTrace Membrane Pack ×20',
    description: 'Value pack for frequent screening across multiple water sources.',
    tests: 20,
    price: 44.9,
    compatibility: 'AquaTrace cartridge holder (all generations)',
    delivery: '2–5 business days',
    category: 'membrane',
    emoji: '🗃️',
  },
  {
    id: 'prefilter',
    name: 'Replacement Prefilters',
    description: 'Protects the membrane from large debris before particle screening.',
    price: 5,
    compatibility: 'AquaTrace field kit inlet',
    delivery: '3–5 business days',
    category: 'prefilter',
    emoji: '🧴',
  },
  {
    id: 'accessories',
    name: 'Compatible accessories',
    description: 'Cleaning brush, calibration card sleeve, and sample vials.',
    price: 12.5,
    compatibility: 'AquaTrace starter & refill kits',
    delivery: '3–6 business days',
    category: 'accessory',
    emoji: '🧰',
  },
  {
    id: 'pro-sub',
    name: 'AquaTrace Pro',
    description:
      'Organization subscription: multi-location dashboard, team access, PDF reports, alerts, and analytics.',
    price: AQUATRACE_PRO_PRICE,
    compatibility: 'Organizations · schools · farms · offices · utilities',
    delivery: 'Instant activation',
    category: 'subscription',
    emoji: '🏢',
  },
]

export const PRO_FEATURES = [
  {
    id: 'multi-location',
    titleEn: 'Multi-Location Dashboard',
    titleRu: 'Дашборд по локациям',
    descEn:
      'One company sees results across all sites: schools, farms, offices, districts, and water intake points.',
    descRu:
      'Одна компания видит результаты по всем объектам: школы, фермы, офисы, районы, точки забора воды.',
  },
  {
    id: 'team',
    titleEn: 'Team Access',
    titleRu: 'Командный доступ',
    descEn:
      'Several employees can run tests, upload results, and work in one account with different roles.',
    descRu:
      'Несколько сотрудников могут проводить тесты, загружать результаты и работать в одном аккаунте с разными ролями.',
  },
  {
    id: 'pdf',
    titleEn: 'Automated PDF Reports',
    titleRu: 'Автоматические PDF-отчёты',
    descEn:
      'Automatic reports for leadership, partners, laboratories, and government agencies.',
    descRu:
      'Автоматические отчёты для руководства, партнёров, лабораторий и государственных органов.',
  },
  {
    id: 'alerts',
    titleEn: 'Alerts & Risk Monitoring',
    titleRu: 'Алерты и мониторинг риска',
    descEn:
      'Notifications if AquaScore drops sharply, high risk appears, or a site has not been tested for too long.',
    descRu:
      'Уведомления, если AquaScore резко ухудшился, появился высокий риск или объект давно не проходил проверку.',
  },
  {
    id: 'analytics',
    titleEn: 'Data Analytics',
    titleRu: 'Аналитика данных',
    descEn:
      'Compare sites, track water quality trends, spot problem zones, and export data.',
    descRu:
      'Сравнение объектов, динамика качества воды, выявление проблемных зон и экспорт данных.',
  },
] as const
