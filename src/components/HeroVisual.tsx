'use client'
import Link from 'next/link'
import { Droplets, FlaskConical, ScanLine, Sparkles } from 'lucide-react'

/** Decorative hero: filtration device + water + phone — CSS/SVG, no photos of people */
export default function HeroVisual() {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
      {/* soft glow */}
      <div className="absolute inset-8 rounded-full bg-gradient-to-br from-teal-300/40 via-cyan-200/30 to-blue-300/40 blur-2xl" />

      {/* water ripples */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" fill="none" aria-hidden>
        <circle cx="200" cy="220" r="118" stroke="#99f6e4" strokeWidth="2" opacity="0.5" />
        <circle cx="200" cy="220" r="95" stroke="#5eead4" strokeWidth="2" opacity="0.45" />
        <circle cx="200" cy="220" r="72" stroke="#2dd4bf" strokeWidth="2.5" opacity="0.55" />
        <ellipse cx="200" cy="248" rx="70" ry="18" fill="url(#water)" opacity="0.85" />
        <defs>
          <linearGradient id="water" x1="130" y1="230" x2="270" y2="270">
            <stop stopColor="#67e8f9" />
            <stop offset="1" stopColor="#14b8a8" />
          </linearGradient>
          <linearGradient id="device" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#0f766e" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>

        {/* filtration cartridge / device */}
        <rect x="118" y="96" width="72" height="130" rx="16" fill="url(#device)" />
        <rect x="128" y="108" width="52" height="18" rx="6" fill="#5eead4" opacity="0.9" />
        <rect x="134" y="138" width="40" height="56" rx="8" fill="#ecfeff" opacity="0.95" />
        <circle cx="154" cy="166" r="14" stroke="#14b8a8" strokeWidth="3" fill="#ccfbf1" />
        <path d="M154 158 v16 M146 166 h16" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" />
        <rect x="140" y="208" width="28" height="10" rx="3" fill="#99f6e4" />

        {/* droplet from device */}
        <path
          d="M154 230 C154 230 142 248 142 258 C142 266 147 270 154 270 C161 270 166 266 166 258 C166 248 154 230 154 230Z"
          fill="#22d3ee"
          opacity="0.95"
        />

        {/* phone */}
        <rect x="220" y="140" width="88" height="150" rx="14" fill="#0f172a" />
        <rect x="228" y="152" width="72" height="110" rx="6" fill="#ecfeff" />
        <circle cx="264" cy="276" r="6" fill="#334155" />
        {/* membrane preview on phone */}
        <circle cx="264" cy="200" r="28" fill="#ccfbf1" stroke="#14b8a8" strokeWidth="2" />
        <circle cx="252" cy="192" r="3" fill="#0d9488" />
        <circle cx="270" cy="198" r="2.5" fill="#f59e0b" />
        <circle cx="258" cy="210" r="2" fill="#ef4444" />
        <circle cx="274" cy="208" r="2.5" fill="#0d9488" />
        <text x="264" y="248" textAnchor="middle" fill="#0f766e" fontSize="11" fontWeight="700" fontFamily="system-ui">
          72
        </text>
      </svg>

      {/* floating badges */}
      <div className="absolute top-6 right-2 sm:right-6 flex items-center gap-1.5 bg-white/95 border border-teal-100 rounded-full px-3 py-1.5 shadow-md text-xs font-bold text-teal-800">
        <ScanLine className="w-3.5 h-3.5 text-teal-600" />
        AI Scan
      </div>
      <div className="absolute bottom-10 left-0 sm:left-4 flex items-center gap-1.5 bg-white/95 border border-blue-100 rounded-full px-3 py-1.5 shadow-md text-xs font-bold text-blue-800">
        <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
        Membrane
      </div>
      <div className="absolute top-1/3 left-0 flex items-center gap-1.5 bg-white/95 border border-cyan-100 rounded-full px-3 py-1.5 shadow-md text-xs font-bold text-cyan-800">
        <Droplets className="w-3.5 h-3.5 text-cyan-600" />
        Sample
      </div>
      <div className="absolute bottom-24 right-0 flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-full px-3 py-1.5 shadow-md text-xs font-bold">
        <Sparkles className="w-3.5 h-3.5" />
        AquaScore
      </div>
    </div>
  )
}
