'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Droplets, Menu, X } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import LanguageSwitch from '@/components/LanguageSwitch'
import { useLang } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { t } = useLang()
  const { user } = useAuth()

  const NAV_LINKS = [
    { href: '/', label: t.navHome },
    { href: '/overview', label: 'Overview' },
    { href: '/pro', label: t.navPro },
    { href: '/sources', label: t.navSources },
    { href: '/test', label: t.navTest },
    { href: '/map', label: t.navMap },
    { href: '/shop', label: t.navShop },
    { href: '/profile', label: t.navProfile },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-teal-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-teal-700">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <span className="tracking-tight">{t.brand}</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname === link.href
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:text-teal-700 hover:bg-teal-50',
                )}
              >
                {link.label}
              </Link>
            ))}
            <LanguageSwitch className="ml-2" />
            <Link
              href={user ? '/profile' : '/login'}
              className={clsx(
                'ml-2 px-3 py-2 rounded-lg text-sm font-medium',
                pathname === '/login' || pathname === '/signup'
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-600 hover:text-teal-700 hover:bg-teal-50',
              )}
            >
              {user ? 'Account' : 'Sign in'}
            </Link>
            <Link
              href="/test"
              className="ml-2 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
            >
              {t.startTest}
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitch />
            <button className="p-2 rounded-lg text-gray-600" onClick={() => setOpen(!open)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  'block px-4 py-2 rounded-lg text-sm font-medium',
                  pathname === link.href
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:text-teal-700 hover:bg-teal-50',
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={user ? '/profile' : '/login'}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-600"
            >
              {user ? 'Account' : 'Sign in'}
            </Link>
            <Link
              href="/test"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 text-white text-sm font-semibold text-center mt-2"
            >
              {t.startTest}
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
