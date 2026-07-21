'use client'
import { useEffect, useState } from 'react'
import { SHOP_PRODUCTS } from '@/lib/shop'
import { activatePack, getMembranes } from '@/lib/storage'
import type { MembraneInventory, ShopProduct } from '@/types'
import { CheckCircle2, QrCode, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import ProSection from '@/components/ProSection'
import LanguageSwitch from '@/components/LanguageSwitch'

export default function ShopPage() {
  const [membranes, setMembranes] = useState<MembraneInventory | null>(null)
  const [cart, setCart] = useState<string[]>([])
  const [showQr, setShowQr] = useState(false)
  const [code, setCode] = useState('AT-MEMBRANE-10')
  const [testsToAdd, setTestsToAdd] = useState(10)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMembranes(getMembranes())
  }, [])

  const addToCart = (p: ShopProduct) => {
    if (p.category === 'subscription') {
      localStorage.setItem('aquatrace_pro_active', '1')
      setMessage('AquaTrace Pro activated on this device · $20/month demo subscription.')
      setCart((c) => [...c, p.id])
      return
    }
    setCart((c) => [...c, p.id])
    if (p.tests) {
      setTestsToAdd(p.tests)
      setCode(`AT-MEMBRANE-${p.tests}`)
    }
  }

  const activate = () => {
    const result = activatePack(code, testsToAdd)
    setMessage(result.message + (result.ok ? ` Current balance: ${result.remaining} tests remaining.` : ''))
    setMembranes(getMembranes())
    if (result.ok) setShowQr(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 pb-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <p className="text-sm font-semibold text-teal-600">Shop</p>
            <h1 className="text-3xl font-black text-gray-900">Catalog</h1>
          </div>
          <LanguageSwitch />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Membrane: single-use, one membrane per test. Cartridge holder: reusable — clean after testing.
        </p>

        <div className="mt-4">
          <ProSection
            compact
            onSubscribe={() => {
              localStorage.setItem('aquatrace_pro_active', '1')
              setMessage('AquaTrace Pro activated · $20/month.')
            }}
          />
          <Link href="/pro" className="mt-2 inline-block text-sm font-semibold text-teal-700">
            Open Pro dashboard preview →
          </Link>
        </div>

        {membranes && (
          <div className="mt-4 bg-white rounded-2xl border border-teal-100 p-4">
            <p className="text-xs font-semibold uppercase text-gray-400">Current inventory</p>
            <p className="text-xl font-black text-gray-900 mt-1">
              {membranes.remaining} tests remaining
            </p>
            <button
              type="button"
              onClick={() => setShowQr(true)}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-teal-50 border border-teal-200 text-teal-800 py-3 rounded-xl font-bold"
            >
              <QrCode className="w-4 h-4" />
              Scan / enter pack QR
            </button>
          </div>
        )}

        {message && (
          <div className="mt-3 flex gap-2 rounded-xl bg-teal-50 border border-teal-200 p-3 text-sm text-teal-900">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            {message}
          </div>
        )}

        {showQr && (
          <div className="mt-4 bg-white rounded-2xl border border-blue-100 p-4 space-y-3">
            <h3 className="font-bold text-gray-900">Activate membrane pack</h3>
            <p className="text-xs text-gray-500">
              Demo: enter a code starting with AT- or containing MEMBRANE / AQUATRACE to verify compatibility.
            </p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono"
              placeholder="Scan QR payload / pack code"
            />
            <div>
              <label className="text-xs text-gray-500">Tests in pack</label>
              <select
                value={testsToAdd}
                onChange={(e) => setTestsToAdd(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1"
              >
                {[5, 10, 20].map((n) => (
                  <option key={n} value={n}>
                    +{n} tests
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={activate}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-xl font-bold"
            >
              Activate pack
            </button>
          </div>
        )}

        <div className="mt-5 space-y-3">
          <h2 className="font-bold text-gray-900">Hardware & refills</h2>
          {SHOP_PRODUCTS.filter((p) => p.category !== 'subscription').map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center text-3xl shrink-0">
                  {p.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{p.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5 leading-snug">{p.description}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                  Tests: <strong>{p.tests ?? '—'}</strong>
                </div>
                <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                  Price: <strong>${p.price.toFixed(2)}</strong>
                </div>
                <div className="bg-gray-50 rounded-lg px-2 py-1.5 col-span-2">
                  Compatibility: {p.compatibility}
                </div>
                <div className="bg-gray-50 rounded-lg px-2 py-1.5 col-span-2">
                  Estimated delivery: {p.delivery}
                </div>
              </div>
              <button
                type="button"
                onClick={() => addToCart(p)}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white py-2.5 rounded-xl font-bold text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                {cart.includes(p.id) ? 'Added' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="mt-4 bg-white rounded-2xl border border-teal-100 p-4">
            <p className="font-bold text-gray-900">Cart ({cart.length})</p>
            <p className="text-sm text-gray-500 mt-1">Demo checkout complete. Activate your pack with QR when it arrives.</p>
            <button
              type="button"
              onClick={() => setShowQr(true)}
              className="mt-3 w-full bg-teal-50 border border-teal-200 text-teal-800 py-3 rounded-xl font-bold"
            >
              I opened a new pack — activate QR
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
