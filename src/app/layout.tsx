import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import { LanguageProvider } from '@/lib/i18n'
import { AuthProvider } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'AquaTrace — Know What’s Really in Your Water',
  description:
    'Portable particle screening with AquaScore. Collect, filter, scan, and get clear screening recommendations.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <LanguageProvider>
          <AuthProvider>
            <div className="md:block hidden">
              <Navbar />
            </div>
            <main className="pt-0 md:pt-16 pb-24 md:pb-8 min-h-screen w-full">{children}</main>
            <BottomNav />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
