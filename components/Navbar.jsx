'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useStore, TIMEFRAMES } from '@/lib/store'
import { searchCoins } from '@/lib/api'
import dynamic from 'next/dynamic'

const SettingsModal = dynamic(() => import('@/components/modals/SettingsModal'), { ssr: false })
const FilterModal   = dynamic(() => import('@/components/modals/FilterModal'),   { ssr: false })

export default function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()
  const {
    setSelectedCoin,
    marketTrend,
    preloadedCoins,
    setSearchQuery: setStoreSearchQuery,
    currentTimeframe,
    setCurrentTimeframe,
    currentMode,
    rankingDisplay,
    selectRanking,
  } = useStore()

  const isHome = pathname === '/'

  const handleHomeClick = useCallback(() => {
    selectRanking('1-100')
    setCurrentTimeframe('1h')
    if (pathname !== '/') router.push('/')
  }, [selectRanking, setCurrentTimeframe, pathname, router])

  const isFilterActive =
    currentMode === 'category' ||
    currentMode === 'favorites' ||
    currentMode === 'home' ||
    (currentMode === 'ranking' && rankingDisplay !== '1-100')

  const [mobileMenuOpen,   setMobileMenuOpen]   = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false)
  const [settingsOpen,     setSettingsOpen]     = useState(false)
  const [filterOpen,       setFilterOpen]       = useState(false)

  const [desktopQuery,  setDesktopQuery]  = useState('')
  const [mobileQuery,   setMobileQuery]   = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching,   setIsSearching]   = useState(false)

  const searchTimeoutRef = useRef(null)
  const desktopSearchRef = useRef(null)

  // Arrow class: animation class handles both color and float/rotate
  const arrowClass =
    marketTrend === 'bullish' ? 'text-green-400 arrow-animate-up' :
    marketTrend === 'bearish' ? 'text-red-400 arrow-animate-down' :
    'text-gray-400'

  const callSearchAPI = useCallback(async (query) => {
    setIsSearching(true)
    try {
      const results = await searchCoins(query)
      setSearchResults(results.slice(0, 10))
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleSearchInput = useCallback((value, isMobile) => {
    if (isMobile) setMobileQuery(value)
    else          setDesktopQuery(value)

    // Always update store so BubbleChart can react
    setStoreSearchQuery(value)

    clearTimeout(searchTimeoutRef.current)

    if (!value.trim()) {
      setSearchResults([])
      return
    }

    // Check if any current bubble matches — if so, BubbleChart handles highlighting
    // and we don't need a dropdown
    const q = value.trim().toLowerCase()
    const onScreenMatches = preloadedCoins.filter(c =>
      (c.symbol ?? '').toLowerCase().startsWith(q) ||
      (c.name   ?? '').toLowerCase().includes(q)
    )
    if (onScreenMatches.length > 0 && !isMobile) {
      setSearchResults([])
      return
    }

    // No on-screen match → call CoinGecko search API after debounce
    searchTimeoutRef.current = setTimeout(() => callSearchAPI(value), 300)
  }, [preloadedCoins, setStoreSearchQuery, callSearchAPI])

  const clearSearch = useCallback((isMobile) => {
    if (isMobile) setMobileQuery('')
    else          setDesktopQuery('')
    setSearchResults([])
    setStoreSearchQuery('')
  }, [setStoreSearchQuery])

  const handleSearchResultClick = useCallback(async (coin) => {
    clearSearch(false)
    clearSearch(true)
    setDesktopSearchOpen(false)
    setMobileSearchOpen(false)

    // Preloaded coins already have full market data
    if (coin.current_price != null) {
      setSelectedCoin(coin)
      return
    }

    // Search API coins only have id/name/symbol/thumb — fetch full market data
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coin.id}&price_change_percentage=1h,24h,7d,30d,1y`
      )
      const [fullCoin] = await res.json()
      if (fullCoin) setSelectedCoin(fullCoin)
    } catch {
      setSelectedCoin({ id: coin.id, name: coin.name, symbol: coin.symbol, image: coin.large || coin.thumb || '' })
    }
  }, [setSelectedCoin, clearSearch])

  // Close mobile menu on Escape
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Close desktop search when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target)) {
        setDesktopSearchOpen(false)
        clearSearch(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [clearSearch])

  // Shared search results dropdown
  const SearchResults = ({ isMobile }) => {
    const query   = isMobile ? mobileQuery : desktopQuery
    const isOpen  = isMobile ? mobileSearchOpen : desktopSearchOpen

    if (!isOpen && !isMobile) return null
    if (!mobileSearchOpen && isMobile) return null

    const dropdownCls = 'search-results absolute top-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-h-72 overflow-y-auto z-50 mt-2'
    const dropdownStyle = { scrollbarWidth: 'thin', scrollbarColor: '#4b5563 #1f2937' }

    const ResultItem = ({ coin, thumb }) => (
      <button
        onClick={() => handleSearchResultClick(coin)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700 transition text-left border-b border-gray-700/50 last:border-b-0"
      >
        <img
          src={thumb}
          alt={coin.name}
          className="w-8 h-8 rounded-full flex-shrink-0"
          onError={e => { e.target.style.display = 'none' }}
        />
        <div>
          <div className="text-sm font-semibold text-white">{coin.name}</div>
          <div className="text-xs text-gray-400 uppercase">{coin.symbol}</div>
        </div>
      </button>
    )

    // Empty input → show top 10 preloaded coins
    if (!query.trim()) {
      if (preloadedCoins.length === 0) return null
      return (
        <div className={dropdownCls} style={dropdownStyle}>
          {preloadedCoins.slice(0, 10).map(coin => (
            <ResultItem key={coin.id} coin={coin} thumb={coin.image} />
          ))}
        </div>
      )
    }

    // Query typed — check if bubbles on screen match (BubbleChart handles it)
    const q = query.trim().toLowerCase()
    const onScreen = preloadedCoins.filter(c =>
      (c.symbol ?? '').toLowerCase().startsWith(q) ||
      (c.name   ?? '').toLowerCase().includes(q)
    )
    if (onScreen.length > 0) return null

    // Show API results
    return (
      <div className={dropdownCls} style={dropdownStyle}>
        {isSearching ? (
          <div className="px-4 py-3 text-center text-gray-400 text-sm">Searching…</div>
        ) : searchResults.length === 0 ? (
          <div className="px-4 py-3 text-center text-gray-400 text-sm">No results found.</div>
        ) : (
          searchResults.map(coin => (
            <ResultItem key={coin.id} coin={coin} thumb={coin.thumb} />
          ))
        )}
      </div>
    )
  }

  const navLinkCls = (active) =>
    `px-3 py-2 rounded-md text-sm font-medium ${active ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white'}`

  const dropdownItemCls = (active) =>
    `block px-4 py-3 transition border-b border-gray-700/50 ${active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`

  const mobileSubLinkCls = (active) =>
    `block px-3 py-2 rounded-lg text-sm transition ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`

  return (
    <>
      <header className="sticky top-0 left-0 right-0 bg-gray-900 shadow-md px-2 py-3 z-40">

        {/* Main Header Row */}
        <div className={`flex justify-between items-center gap-4 ${mobileSearchOpen ? 'hidden' : ''}`}>
          {/* Logo */}
          <div id="navbar-logo" className="flex-shrink-0">
            <button onClick={handleHomeClick} className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-full bg-gray-800 border border-gray-700">
                <svg
                  className={`w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 ${arrowClass}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
                </svg>
              </div>
              <div
                elementtiming="lcp-logo"
                className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-white whitespace-nowrap leading-none"
              >
                Blockchain Bubbles
              </div>
            </button>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3">
            <nav className="flex items-center gap-3">
              <ul className="flex items-center gap-3 list-none p-0 m-0">
                <li>
                  <button onClick={handleHomeClick} className={navLinkCls(pathname === '/')}>Home</button>
                </li>
                <li>
                  <Link href="/compare-cryptocurrencies" className={navLinkCls(pathname === '/compare-cryptocurrencies')}>Compare</Link>
                </li>

                {/* Calculators Dropdown */}
                <li className="relative group">
                  <button className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ${pathname.startsWith('/calculators') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white'}`}>
                    Calculators
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  <div className="absolute right-0 top-full pt-2 w-64 hidden group-hover:block hover:block z-50">
                    <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
                      <ul className="text-sm">
                        {[
                          ['/calculators/crypto-profit-calculator',    'Crypto Profit Calculator'],
                          ['/calculators/crypto-futures-calculator',   'Crypto Future Calculator'],
                          ['/calculators/crypto-slippage-calculator',  'Crypto Slippage Calculator'],
                          ['/calculators/staking-rewards-calculator',  'Staking Rewards Calculator'],
                          ['/calculators/dca-calculator',              'Dollar Cost Averaging'],
                          ['/calculators/impermanent-loss-calculator', 'Impermanent Loss Calculator'],
                        ].map(([href, label], i, arr) => (
                          <li key={href}>
                            <Link href={href} className={dropdownItemCls(pathname === href) + (i === arr.length - 1 ? ' border-b-0' : '')}>
                              {label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              </ul>
            </nav>

            {/* Timeframe buttons — desktop, homepage only */}
            {isHome && (
              <div className="flex items-center gap-1">
                {TIMEFRAMES.map(tf => (
                  <button
                    key={tf}
                    onClick={() => setCurrentTimeframe(tf)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                      currentTimeframe === tf
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            )}

            {/* Filter Button */}
            <button
              aria-label="Open market filters"
              onClick={() => { setFilterOpen(true); setSettingsOpen(false) }}
              className={`relative p-2 rounded-lg transition-colors duration-200 ${
                isFilterActive
                  ? 'text-blue-400 bg-gray-700'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-2.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {isFilterActive && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>

            {/* Settings Button */}
            <button
              aria-label="Open settings"
              onClick={() => { setSettingsOpen(true); setFilterOpen(false) }}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.608 3.292 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Desktop Search */}
            <div ref={desktopSearchRef} className="relative">
              <button
                aria-label="Open search bar"
                onClick={() => { setDesktopSearchOpen(prev => !prev); clearSearch(false) }}
                className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <div
                style={{ transformOrigin: 'top right' }}
                className={`absolute right-0 top-full mt-2 w-96 z-50 transition-all duration-300 ease-out ${
                  desktopSearchOpen
                    ? 'opacity-100 scale-y-100 pointer-events-auto'
                    : 'opacity-0 scale-y-0 pointer-events-none'
                }`}
              >
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search coins…"
                    value={desktopQuery}
                    onChange={(e) => handleSearchInput(e.target.value, false)}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-9 p-2"
                    autoComplete="off"
                  />
                  <SearchResults isMobile={false} />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Icons */}
          <div className="flex items-center gap-1 md:hidden">
            {/* Filter */}
            <button
              aria-label="Open market filters"
              onClick={() => { setFilterOpen(true); setSettingsOpen(false) }}
              className={`relative p-2 rounded-lg transition-colors duration-200 ${
                isFilterActive
                  ? 'text-blue-400 bg-gray-700'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-2.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {isFilterActive && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>

            {/* Settings */}
            <button
              aria-label="Open settings"
              onClick={() => { setSettingsOpen(true); setFilterOpen(false) }}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.608 3.292 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Search */}
            <button
              aria-label="Open search"
              onClick={() => setMobileSearchOpen(true)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Hamburger */}
            <button
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Timeframe row — mobile, homepage only */}
        {isHome && !mobileSearchOpen && (
          <div className="flex items-center gap-1 mt-2 md:hidden">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => setCurrentTimeframe(tf)}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition ${
                  currentTimeframe === tf
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        )}

        {/* Mobile Search View */}
        <div className={`${mobileSearchOpen ? 'flex' : 'hidden'} items-center gap-2`}>
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for a coin…"
              value={mobileQuery}
              onChange={(e) => handleSearchInput(e.target.value, true)}
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-9 p-2"
              autoComplete="off"
            />
            <SearchResults isMobile={true} />
          </div>
          <button
            className="text-gray-300 hover:text-white p-2 text-sm"
            onClick={() => {
              setMobileSearchOpen(false)
              clearSearch(true)
            }}
          >
            Cancel
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden mt-4 p-4 bg-gray-800 rounded-lg space-y-4`}>
          <ul className="space-y-2 list-none p-0 m-0">
            <li>
              <button onClick={() => { handleHomeClick(); setMobileMenuOpen(false) }} className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${pathname === '/' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white'}`}>
                Home
              </button>
            </li>
            <li>
              <Link href="/compare-cryptocurrencies" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/compare-cryptocurrencies' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white'}`}>
                Compare
              </Link>
            </li>
            <li>
              <div className="text-blue-400 font-semibold px-3 pt-2 pb-1 text-sm uppercase tracking-wider">Calculators</div>
              <ul className="pl-2 space-y-1 mt-1 border-l-2 border-gray-700 ml-3">
                {[
                  ['/calculators/crypto-profit-calculator',    'Crypto Profit Calculator'],
                  ['/calculators/crypto-futures-calculator',   'Crypto Future Calculator'],
                  ['/calculators/crypto-slippage-calculator',  'Crypto Slippage Calculator'],
                  ['/calculators/staking-rewards-calculator',  'Staking Rewards Calculator'],
                  ['/calculators/dca-calculator',              'Dollar Cost Averaging'],
                  ['/calculators/impermanent-loss-calculator', 'Impermanent Loss Calculator'],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} onClick={() => setMobileMenuOpen(false)} className={mobileSubLinkCls(pathname === href)}>{label}</Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>

        </div>

      </header>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <FilterModal   isOpen={filterOpen}   onClose={() => setFilterOpen(false)} />
    </>
  )
}
