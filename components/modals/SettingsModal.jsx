'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'

const OPTIONS = [
  { value: 'performance',   label: 'Performance',  desc: 'Size reflects % price change' },
  { value: 'market_cap',    label: 'Market Cap',   desc: 'Size reflects market capitalisation' },
  { value: 'total_volume',  label: '24h Volume',   desc: 'Size reflects 24h trading volume' },
]

export default function SettingsModal({ isOpen, onClose }) {
  const { bubbleSizeMetric, setBubbleSizeMetric } = useStore()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-white">Settings</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-gray-400 mb-3">Bubble Size Metric</p>
          <div className="space-y-2">
            {OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setBubbleSizeMetric(opt.value); onClose() }}
                className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                  bubbleSizeMetric === opt.value
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
              >
                <div className="font-medium">{opt.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
