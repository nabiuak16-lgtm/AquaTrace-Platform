'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Droplets, FlaskConical, MapPin, ShoppingBag, User } from 'lucide-react'
import clsx from 'clsx'
import { useLang } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'

export default function BottomNav() {
  const pathname = usePathname()
  const { t } = useLang()
  const { user } = useAuth()

  const ITEMS = [
    { href: '/', label: t.navHome, icon: Home },
    { href: '/sources', label: t.navSources, icon: Droplets },
    { href: '/test', label: t.navTest, icon: FlaskConical },
    { href: '/map', label: t.navMap, icon: MapPin },
    { href: '/shop', label: t.navShop, icon: ShoppingBag },
    { href: user ? '/profile' : '/login', label: user ? t.navProfile : 'Sign in', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-teal-100 safe-bottom md:hidden">
      <div className="max-w-lg mx-auto grid grid-cols-6 px-0.5 py-1.5">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/'
              ? pathname === '/'
              : pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[10px] font-semibold transition-colors',
                active ? 'text-teal-700' : 'text-gray-400 hover:text-teal-600',
              )}
            >
              <span
                className={clsx(
                  'w-9 h-7 rounded-full flex items-center justify-center',
                  active && 'bg-teal-50',
                )}
              >
                <Icon className={clsx('w-4.5 h-4.5 w-[18px] h-[18px]', active && 'text-teal-600')} />
              </span>
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
