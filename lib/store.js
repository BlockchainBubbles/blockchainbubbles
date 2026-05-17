'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export const TIMEFRAMES = ['1h', '24h', '7d', '30d', '1y']

export const RANKINGS = [
  { name: 'Home',      value: 'Home' },
  { name: 'Favorites', value: 'Favorites' },
  ...Array.from({ length: 10 }, (_, i) => {
    const label = `${i * 100 + 1}-${(i + 1) * 100}`
    return { name: label, value: label }
  }),
]

export const CATEGORIES = [
  { id: 'layer-1',                    name: 'Layer 1' },
  { id: 'layer-2',                    name: 'Layer 2' },
  { id: 'real-world-assets-rwa',      name: 'RWA' },
  { id: 'proof-of-stake-pos',         name: 'PoS' },
  { id: 'decentralized-finance-defi', name: 'DeFi' },
  { id: 'decentralized-exchange',     name: 'DEX' },
  { id: 'gaming',                     name: 'GameFi' },
  { id: 'artificial-intelligence',    name: 'AI' },
  { id: 'oracle',                     name: 'Oracles' },
  { id: 'meme-token',                 name: 'Meme Coins' },
  { id: 'governance',                 name: 'Governance' },
]

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [currentMode, setCurrentMode]           = useState('ranking')
  const [rankingDisplay, setRankingDisplay]     = useState('1-100')
  const [currentCategoryId, setCurrentCategoryId] = useState(null)
  const [currentTimeframe, setCurrentTimeframe] = useState('1h')
  const [bubbleSizeMetric, setBubbleSizeMetric] = useState('performance')
  const [favorites, setFavorites]               = useState([])
  const [coingeckoPage, setCoingeckoPage]       = useState(1)
  const [selectedCoin, setSelectedCoin]         = useState(null)
  const [marketTrend,    setMarketTrend]        = useState('neutral')
  const [preloadedCoins, setPreloadedCoins]     = useState([])
  const [searchQuery,    setSearchQuery]        = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('cryptoFavorites')
    if (stored) {
      try { setFavorites(JSON.parse(stored)) } catch { /* ignore corrupt data */ }
    }
  }, [])

  const toggleFavorite = useCallback((coinId) => {
    setFavorites(prev => {
      const next = prev.includes(coinId)
        ? prev.filter(id => id !== coinId)
        : [...prev, coinId]
      localStorage.setItem('cryptoFavorites', JSON.stringify(next))
      return next
    })
  }, [])

  const selectRanking = useCallback((value) => {
    if (value === 'Home') {
      setCurrentMode('home')
    } else if (value === 'Favorites') {
      setCurrentMode('favorites')
    } else {
      setCurrentMode('ranking')
      const page = value.includes('-')
        ? Math.floor((parseInt(value.split('-')[0]) - 1) / 100) + 1
        : 1
      setCoingeckoPage(page)
    }
    setRankingDisplay(value)
    setCurrentCategoryId(null)
  }, [])

  const selectCategory = useCallback((id) => {
    setCurrentCategoryId(id)
    setCurrentMode('category')
    setRankingDisplay('Rankings')
    setCoingeckoPage(1)
  }, [])

  return (
    <StoreContext.Provider value={{
      currentMode,
      rankingDisplay,
      currentCategoryId,
      currentTimeframe, setCurrentTimeframe,
      bubbleSizeMetric, setBubbleSizeMetric,
      favorites, toggleFavorite,
      coingeckoPage,
      selectRanking,
      selectCategory,
      selectedCoin, setSelectedCoin,
      marketTrend, setMarketTrend,
      preloadedCoins, setPreloadedCoins,
      searchQuery, setSearchQuery,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
