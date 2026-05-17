'use client'

import { useEffect } from 'react'
import { useStore, RANKINGS, CATEGORIES } from '@/lib/store'

export default function FilterModal({ isOpen, onClose }) {
  const {
    currentMode,
    rankingDisplay,
    currentCategoryId,
    selectRanking,
    selectCategory,
  } = useStore()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isRankingActive = (value) => {
    if (value === 'Home')      return currentMode === 'home'
    if (value === 'Favorites') return currentMode === 'favorites'
    return currentMode === 'ranking' && rankingDisplay === value
  }

  const btnBase   = 'px-4 py-3 rounded-xl text-sm font-medium transition text-center'
  const btnActive = 'bg-blue-600 text-white'
  const btnIdle   = 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-2xl px-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Market Filters</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Rankings */}
          <section className="mb-6">
            <p className="text-sm text-gray-400 mb-3">Rankings</p>
            <div className="grid grid-cols-3 gap-2">
              {RANKINGS.map(r => (
                <button
                  key={r.value}
                  onClick={() => {
                    selectRanking(r.value)
                    const url = new URL(window.location.href)
                    if (r.value === 'Home' || r.value === 'Favorites') {
                      url.searchParams.delete('rank')
                      url.searchParams.delete('category')
                    } else {
                      url.searchParams.set('rank', r.value)
                      url.searchParams.delete('category')
                    }
                    window.history.pushState({}, '', url.toString())
                    onClose()
                  }}
                  className={`${btnBase} ${isRankingActive(r.value) ? btnActive : btnIdle}`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </section>

          {/* Categories */}
          <section>
            <p className="text-sm text-gray-400 mb-3">Categories</p>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    selectCategory(cat.id)
                    const url = new URL(window.location.href)
                    url.searchParams.set('category', cat.id)
                    url.searchParams.delete('rank')
                    window.history.pushState({}, '', url.toString())
                    onClose()
                  }}
                  className={`${btnBase} ${
                    currentMode === 'category' && currentCategoryId === cat.id
                      ? btnActive
                      : btnIdle
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
