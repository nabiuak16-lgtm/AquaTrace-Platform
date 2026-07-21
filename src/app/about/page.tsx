import {
  Droplets, Camera, Upload, BarChart3, MapPin, Users,
  Package, Syringe, Filter, Smartphone, Lightbulb, Info,
  FlaskConical, CheckCircle
} from 'lucide-react'

const steps = [
  { icon: Droplets, num: '01', title: 'Collect groundwater sample', desc: 'Collect 500ml–1L of water from a well, borehole, spring, or tap in a clean container.' },
  { icon: Filter, num: '02', title: 'Pass through membrane filter', desc: 'Use a portable hand pump or syringe to push water through a 0.45μm membrane filter.' },
  { icon: Camera, num: '03', title: 'Capture particles on membrane', desc: 'Particles too large for the filter pores are captured on the membrane surface.' },
  { icon: Upload, num: '04', title: 'Upload image to AquaTrace', desc: 'Photograph the membrane using your phone. Use a macro lens or UV light for better visibility.' },
  { icon: BarChart3, num: '05', title: 'AI estimates contamination risk', desc: 'Our model analyzes the image for particle density, fiber vs fragment ratio, and estimates risk level.' },
  { icon: MapPin, num: '06', title: 'Results added to pollution map', desc: 'With your consent, your sample is added to the crowdsourced contamination map.' },
  { icon: Users, num: '07', title: 'Communities identify hotspots', desc: 'Aggregated data reveals contamination patterns for communities, researchers, and policymakers.' },
]

const kitItems = [
  { icon: Package, label: 'Sample container', desc: '1L clean HDPE bottle' },
  { icon: Syringe, label: 'Syringe or hand pump', desc: '50–100ml capacity' },
  { icon: Filter, label: 'Membrane filter', desc: '0.45μm pore size, 47mm diameter' },
  { icon: Package, label: 'Filter holder', desc: 'Reusable polypropylene housing' },
  { icon: Smartphone, label: 'Phone macro lens', desc: 'Clip-on 10–15x magnification' },
  { icon: Lightbulb, label: 'Optional UV/LED light', desc: 'Enhances fiber fluorescence' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-800 to-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-700/50 rounded-full px-4 py-1.5 text-sm text-teal-200 mb-4 border border-teal-600/50">
            <Info className="w-3.5 h-3.5" />
            How It Works
          </div>
          <h1 className="text-4xl sm:text-5xl font-black">
            Field-ready microplastic monitoring<br />in 7 simple steps
          </h1>
          <p className="mt-4 text-teal-200 text-lg max-w-2xl mx-auto">
            AquaTrace combines low-cost membrane filtration with mobile image analysis to bring
            preliminary microplastic screening anywhere in the world.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-black text-gray-900 mb-10">Step-by-step process</h2>
        <div className="space-y-6">
          {steps.map(({ icon: Icon, num, title, desc }) => (
            <div key={num} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex flex-col items-center justify-center text-white shrink-0">
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-xs font-bold opacity-80">{num}</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                <p className="text-gray-500 mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Kit components */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-gray-900 mb-3">Portable Kit Components</h2>
          <p className="text-gray-500 mb-8">Everything you need fits in a small backpack. Total BOM cost: ~$15–30.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kitItems.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{label}</h3>
                <p className="text-sm text-gray-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why not RO */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Why not reverse osmosis?</h2>
          </div>
          <div className="space-y-3 text-gray-700">
            <p className="leading-relaxed">
              Reverse osmosis (RO) is primarily a <strong>water purification</strong> technology — it removes
              contaminants to produce clean drinking water. While effective at purification, RO does not help
              us <em>study</em> what's in the water.
            </p>
            <p className="leading-relaxed">
              AquaTrace focuses on <strong>monitoring</strong>, not purification. Our approach uses
              membrane filtration not to clean the water, but to <strong>capture and concentrate
              particles</strong> so they can be photographed and analyzed.
            </p>
            <p className="leading-relaxed">
              The retained particles on the membrane surface are the data. By imaging them, we estimate
              what types of microplastics are present and how many — which is information RO would
              simply discard.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="bg-white rounded-xl p-4 border border-blue-100">
                <p className="font-semibold text-gray-900 mb-2">Reverse Osmosis</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  {['Removes contaminants', 'Produces clean water', 'Cannot quantify particles', 'High cost, fixed installation'].map((i) => (
                    <li key={i} className="flex items-center gap-2"><span className="text-blue-400">→</span>{i}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl p-4 border border-teal-100">
                <p className="font-semibold text-gray-900 mb-2">AquaTrace Filtration</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  {['Captures particles for analysis', 'Enables visual inspection', 'Quantifies contamination', 'Portable, low-cost, fieldable'].map((i) => (
                    <li key={i} className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-teal-500" />{i}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Limitations */}
      <section className="py-8 max-w-4xl mx-auto px-4 sm:px-6 mb-12">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Important Limitations</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {[
                'AquaTrace provides preliminary screening only — not certified laboratory results.',
                'Image-based analysis cannot distinguish all plastic types or sizes below ~50μm.',
                'Risk scores are estimates based on visual particle density, not chemical composition.',
                'For health or policy decisions, always confirm with an accredited laboratory.',
                'Natural particles (sediment, organic matter) may be counted; samples should be pre-filtered.',
              ].map((l) => (
                <li key={l} className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span>{l}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
