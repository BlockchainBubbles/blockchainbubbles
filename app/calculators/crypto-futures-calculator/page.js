'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import RelatedTools from '@/components/RelatedTools'

export default function FuturesCalculatorPage() {
  // Coin search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCoin, setSelectedCoin] = useState(null)
  const searchTimeoutRef = useRef(null)

  // Calculator inputs
  const [positionType, setPositionType] = useState('long')
  const [leverage, setLeverage] = useState(1)
  const [entryPrice, setEntryPrice] = useState('')
  const [exitPrice, setExitPrice] = useState('')
  const [margin, setMargin] = useState('')
  const [fees, setFees] = useState('0')

  // Results
  const [results, setResults] = useState(null)

  // Animation
  const animationIdRef = useRef(null)
  const bubbleContainerRef = useRef(null)
  const bubbleRef = useRef(null)

  // Debounced coin search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(searchQuery)}`
        )
        const data = await res.json()
        setSearchResults(data.coins.slice(0, 8))
        setShowDropdown(true)
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeoutRef.current)
  }, [searchQuery])

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e) {
      if (!e.target.closest('.coin-search-wrapper')) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Escape key closes dropdown
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setShowDropdown(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  async function handleCoinSelect(coin) {
    setSelectedCoin(coin)
    setSearchQuery(coin.name)
    setShowDropdown(false)
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd`
      )
      const data = await res.json()
      const price = data[coin.id]?.usd
      if (price) setEntryPrice(price.toString())
    } catch (err) {
      console.error('Price fetch failed:', err)
    }
  }

  // Recalculate whenever any input changes
  useEffect(() => {
    const entry = parseFloat(entryPrice) || 0
    const exit = parseFloat(exitPrice) || 0
    const mgn = parseFloat(margin) || 0
    const fee = parseFloat(fees) || 0
    const lev = leverage || 1
    const isLong = positionType === 'long'

    if (mgn <= 0 || entry <= 0 || exit <= 0) {
      setResults(null)
      return
    }

    const positionSize = mgn * lev
    const quantity = positionSize / entry

    let profitLoss = isLong
      ? (exit - entry) * quantity
      : (entry - exit) * quantity

    profitLoss -= fee

    const roe = (profitLoss / mgn) * 100

    let liquidationPrice = isLong
      ? entry * (1 - 1 / lev)
      : entry * (1 + 1 / lev)
    if (liquidationPrice < 0) liquidationPrice = 0

    setResults({
      positionSize,
      liquidationPrice,
      profitLoss,
      roe,
      isProfit: profitLoss >= 0,
      coinImage: selectedCoin?.thumb || null,
    })
  }, [entryPrice, exitPrice, margin, fees, leverage, positionType, selectedCoin])

  // Animate bubble
  useEffect(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
      animationIdRef.current = null
    }
    if (!results || !bubbleContainerRef.current || !bubbleRef.current) return

    const container = bubbleContainerRef.current
    const size = 160
    let x = Math.random() * Math.max(0, container.clientWidth - size)
    let y = Math.random() * Math.max(0, container.clientHeight - size)
    let vx = (Math.random() - 0.5) * 0.5
    let vy = (Math.random() - 0.5) * 0.5
    if (Math.abs(vx) < 0.1) vx = 0.15
    if (Math.abs(vy) < 0.1) vy = 0.15

    function move() {
      x += vx
      y += vy
      if (x <= 0 || x + size >= container.clientWidth) {
        vx *= -1
        x = x <= 0 ? 0 : container.clientWidth - size
      }
      if (y <= 0 || y + size >= container.clientHeight) {
        vy *= -1
        y = y <= 0 ? 0 : container.clientHeight - size
      }
      if (bubbleRef.current) {
        bubbleRef.current.style.transform = `translate(${x}px, ${y}px)`
      }
      animationIdRef.current = requestAnimationFrame(move)
    }
    move()

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
    }
  }, [results])

  const currFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

  const PRESETS = [1, 25, 50, 75, 100, 125]

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Calculators', href: '/calculators' },
          { label: 'Crypto Futures Calculator', href: '/calculators/crypto-futures-calculator' }
        ]}
        lastUpdated="May 2026"
      />
      <style>{`
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        input[type=range] { -webkit-appearance: none; background: transparent; }
        input[type=range]:focus { outline: none; }
        .result-bubble-container {
          position: relative; height: 200px; overflow: hidden;
          border-radius: 0.5rem; background-color: #1f2937; margin-bottom: 1rem;
        }
        .result-bubble {
          position: absolute; width: 160px; height: 160px; border-radius: 50%;
          display: flex; flex-direction: column; justify-content: center;
          align-items: center; text-align: center; font-weight: 500; color: white;
          padding: 1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          border: 2px solid rgba(255,255,255,0.1); will-change: transform;
          backdrop-filter: blur(5px); background-color: rgba(31,41,55,0.8);
        }
        .result-bubble img { width: 32px; height: 32px; border-radius: 50%; margin-bottom: 0.5rem; }
        .result-bubble .pla { font-size: 1.125rem; font-weight: 700; line-height: 1.2; }
        .result-bubble .plp { font-size: 0.875rem; }
        .article-content h2 { font-size: 1.875rem; font-weight: 700; color: #fff; margin-top: 2.5rem; margin-bottom: 1rem; }
        .article-content h3 { font-size: 1.5rem; font-weight: 600; color: #e5e7eb; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        .article-content p { margin-bottom: 1rem; line-height: 1.75; color: #d1d5db; }
        .article-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; color: #d1d5db; }
        .article-content li { margin-bottom: 0.5rem; }
        .article-content strong { color: #f3f4f6; }
        .article-content a { color: #60a5fa; text-decoration: underline; text-underline-offset: 2px; font-weight: 500; transition: color 0.15s; }
        .article-content a:hover { color: #93c5fd; }
      `}</style>

      {/* Calculator Section */}
      <section className="bg-gray-900 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-white mb-3">Crypto Futures Calculator</h1>
          <p className="text-center text-gray-400 mb-12 text-lg">Simulate leverage, calculate ROE, and check liquidation prices.</p>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-purple-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">Futures Market (Perpetual)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

              {/* Inputs card */}
              <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6 border border-gray-700">

                {/* Coin Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Crypto Coin</label>
                  <div className="coin-search-wrapper relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search coin e.g. Bitcoin, Ethereum"
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 pl-10 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>

                    {isSearching && (
                      <div className="absolute right-3 top-3 text-gray-400 text-sm">Searching...</div>
                    )}

                    {showDropdown && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg mt-1 max-h-60 overflow-y-auto z-50 shadow-2xl">
                        {searchResults.map(coin => (
                          <div
                            key={coin.id}
                            onClick={() => handleCoinSelect(coin)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700/50 last:border-0"
                          >
                            <img src={coin.thumb} alt={coin.name} className="w-7 h-7 rounded-full flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-medium text-sm">{coin.name}</div>
                              <div className="text-gray-400 text-xs">{coin.symbol.toUpperCase()}</div>
                            </div>
                            {coin.market_cap_rank && (
                              <div className="text-gray-400 text-xs flex-shrink-0">#{coin.market_cap_rank}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Long / Short toggle + Leverage */}
                <div className="grid grid-cols-1 gap-4">

                  {/* Direction toggle */}
                  <div className="flex bg-gray-700 rounded-xl p-1">
                    <button
                      onClick={() => setPositionType('long')}
                      className={`flex-1 text-center py-2 rounded-lg font-semibold transition-all ${
                        positionType === 'long'
                          ? 'bg-green-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      Long
                    </button>
                    <button
                      onClick={() => setPositionType('short')}
                      className={`flex-1 text-center py-2 rounded-lg font-semibold transition-all ${
                        positionType === 'short'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      Short
                    </button>
                  </div>

                  {/* Leverage slider */}
                  <div>
                    <div className="flex justify-between text-sm font-semibold text-gray-300 mb-2">
                      <span>Leverage</span>
                      <span className="text-purple-400">{leverage}x</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="125"
                      value={leverage}
                      onChange={e => setLeverage(Number(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      {PRESETS.map(val => (
                        <button
                          key={val}
                          onClick={() => setLeverage(val)}
                          className="hover:text-purple-400 transition-colors"
                        >
                          {val}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Entry / Exit Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Entry Price ($)</label>
                    <input
                      type="number" placeholder="0.00" value={entryPrice}
                      onChange={e => setEntryPrice(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Exit Price ($)</label>
                    <input
                      type="number" placeholder="0.00" value={exitPrice}
                      onChange={e => setExitPrice(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                    />
                  </div>
                </div>

                {/* Margin & Fees */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Margin ($)</label>
                    <input
                      type="number" placeholder="100" value={margin}
                      onChange={e => setMargin(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Total Fees ($)</label>
                    <input
                      type="number" placeholder="0" value={fees}
                      onChange={e => setFees(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                    />
                  </div>
                </div>
              </div>

              {/* Results card */}
              <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-4">Futures Result</h3>

                  <div
                    ref={bubbleContainerRef}
                    className="border border-gray-700"
                    style={{ position: 'relative', height: '200px', overflow: 'hidden', borderRadius: '0.5rem', backgroundColor: '#1f2937', marginBottom: '1rem' }}
                  >
                    {!results ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <p className="text-gray-400 italic text-sm">Enter Futures details...</p>
                      </div>
                    ) : (
                      <div
                        ref={bubbleRef}
                        style={{
                          position: 'absolute',
                          width: '160px',
                          height: '160px',
                          borderRadius: '50%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          textAlign: 'center',
                          fontWeight: '500',
                          color: 'white',
                          padding: '1rem',
                          border: '2px solid rgba(255,255,255,0.1)',
                          willChange: 'transform',
                          backdropFilter: 'blur(5px)',
                          backgroundColor: results.isProfit ? 'rgba(16,185,129,0.8)' : 'rgba(239,68,68,0.8)',
                          boxShadow: `0 4px 20px ${results.isProfit ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`,
                        }}
                      >
                        <img
                          src={results.coinImage || 'https://placehold.co/32x32/1f2937/FFFFFF?text=$'}
                          alt="Coin"
                          onError={e => { e.target.src = 'https://placehold.co/32x32/1f2937/FFFFFF?text=$' }}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', marginBottom: '0.5rem' }}
                        />
                        <div style={{ fontSize: '1.125rem', fontWeight: '700', lineHeight: '1.2' }}>
                          {results.profitLoss >= 0 ? '+' : ''}{currFmt.format(Math.abs(results.profitLoss))}
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>
                          {results.roe >= 0 ? '+' : ''}{Math.abs(results.roe).toFixed(2)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-400">Position Size</p>
                    <p className="text-lg font-bold text-white">
                      {results ? currFmt.format(results.positionSize) : '--'}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-400">Liquidation Price (Est)</p>
                    <p className="text-lg font-bold text-orange-400">
                      {results ? currFmt.format(results.liquidationPrice) : '--'}
                    </p>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-2">
                    <p className="text-sm text-gray-400">ROE %</p>
                    <p className={`text-lg font-bold ${results ? (results.roe > 0 ? 'text-green-400' : results.roe < 0 ? 'text-red-400' : 'text-white') : 'text-white'}`}>
                      {results ? `${results.roe >= 0 ? '+' : ''}${results.roe.toFixed(2)}%` : '--'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Crypto Futures Calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "url": "https://blockchainbubbles.com/calculators/crypto-futures-calculator"
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is the calculator free, and is there a catch?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "It is free with no account required. The page does not save your inputs anywhere; once you close the tab the data is gone. There is no premium version with extra features behind a paywall."
                }
              },
              {
                "@type": "Question",
                "name": "How accurate is the liquidation price?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For sizing decisions, accurate enough to plan around. For the exact liquidation tick, less accurate. Real exchange liquidation engines factor in maintenance margin tiers, mark-price-versus-index-price gaps, and partial liquidation thresholds that this calculator does not. The number you see here will typically be within 0.5% of the actual exchange-side liquidation price. Use it for \"is this position safe with my stop?\" questions. Use the exchange's own panel for \"exactly when am I getting closed?\" questions."
                }
              },
              {
                "@type": "Question",
                "name": "Why is my ROE different from what Binance shows?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most likely fee handling. The calculator uses standard taker fees of 0.06% on entry and exit. If you are paying maker fees, holding a fee-discount token, or in a VIP tier, your real ROE will be slightly higher. Funding payments are also not included. On a position held more than a few hours, funding can shift the realized ROE by several percent in either direction."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use it for spot trading?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Not really. Spot trading does not have a liquidation price, ROE based on margin, or leverage in the same sense. The calculator is built around the structure of a leveraged perpetual or futures contract. For straightforward spot profit math, our crypto profit calculator handles that case."
                }
              },
              {
                "@type": "Question",
                "name": "Does it work for Bybit, OKX, KuCoin, and the other big exchanges?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The math is the same across all linear-USDT perpetual contracts, which is the dominant futures product on every major exchange. Inverse contracts (where BTC is the collateral and the contract is denominated in USD) follow slightly different math, and this calculator does not handle those. If you are trading inverse perps on Bybit or BitMEX, stick to the exchange's own calculator."
                }
              }
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://blockchainbubbles.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Calculators",
                "item": "https://blockchainbubbles.com/calculators"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Crypto Futures Calculator",
                "item": "https://blockchainbubbles.com/calculators/crypto-futures-calculator"
              }
            ]
          })
        }}
      />

      {/* Article Section */}
      <section className="bg-gray-900 pb-20 px-4 sm:px-6 lg:px-8">
        <article className="max-w-3xl mx-auto py-12 px-4 md:px-8">

          <h2 className="text-3xl font-bold text-white mt-0 mb-4 leading-tight">How the crypto futures calculator works (and where it falls short)</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">Most position size mistakes happen before the trade is open. Someone picks 20x because it sounds like a reasonable middle-ground number, drops in $500 of margin, and only checks the liquidation price after the position is already underwater. By then the only thing left to do is watch.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">That&apos;s the gap this crypto futures calculator closes. Plug in your entry price, leverage, position size, and direction. It returns the liquidation price, ROE, profit at any exit, and the margin you actually need to put up. No login, no exchange connection, nothing saved on a server. Open it, run the numbers, close the tab.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Before working out leverage on a single trade, it helps to know which way the broader market is leaning. Our <Link href="/" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50">live crypto bubble chart</Link> gives you that read in a few seconds, and it sometimes changes the leverage decision before you even open the calculator.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">What the calculator gives you back</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">Hit calculate and four numbers come out.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The <strong className="text-white font-semibold">liquidation price</strong> tells you where the position gets wiped out. Long position, the liquidation sits below your entry. Short position, above. The bigger the leverage, the closer that line creeps toward your entry price. At 20x on a long, a 5% drop is roughly the danger zone. At 50x, a 2% wick can do it.</p>
          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">ROE</strong> (return on equity) is what your margin earns or loses, expressed as a percentage of the margin you put in. This is the number people usually mean when they say &quot;I made 200% on this trade.&quot; It is not the same as the price movement of the underlying asset. A 10% move on 10x leverage is roughly a 100% ROE. The calculator shows both so you can see the difference.</p>
          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">Profit and loss at exit price</strong> is the dollar amount, with fees subtracted on both ends. The fee math here uses standard taker rates of around 0.06% per side. If you are using maker orders or have a discounted fee tier, your real number will be slightly better.</p>
          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">Required margin</strong> is straightforward: position size divided by leverage. Useful when you are sizing backwards from a maximum acceptable loss instead of forwards from an arbitrary leverage number.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Liquidation price is where most people get burned</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">This is the number to stare at before opening the position. Not after.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The math is straightforward in theory. On a long, your liquidation price equals your entry price minus (entry price ÷ leverage), give or take maintenance margin. On a short, you flip the sign. In practice, exchanges layer maintenance margin requirements that scale with position size, so the actual liquidation triggers slightly earlier than the textbook formula suggests. The calculator uses linear approximation, which is close enough for sizing decisions but not exact.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The pattern that catches people: leverage scales risk faster than it scales reward, especially at the high end. Going from 5x to 10x doubles your buying power and roughly doubles your ROE. Going from 25x to 50x doubles your buying power but moves your liquidation from a comfortable distance to roughly two percent away from entry. Two percent is normal Bitcoin noise. It is also where most blown accounts start.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">I used to think 50x was reasonable for tight scalps because of how compact the holding period was. I was wrong about that. Even a 30-second scalp can take a 1.5% spike against you if liquidity goes thin, and at 50x that is enough to close the trade for you at the worst possible price. Now I cap at 10x for anything held longer than a minute and 20x for genuine scalps.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">A small thing the calculator cannot do: account for funding rates over multi-day holds. If you are paying 0.05% funding three times a day on a long during a strong uptrend, that compounds. After a week the cumulative cost can hit one full percent of your position notional, which moves your real breakeven price up. The calculator&apos;s profit number assumes funding is zero. Hold a position overnight and you will need to subtract those costs separately.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">ROE versus ROI, and why traders mix them up</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">These two numbers look similar and are not.</p>
          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">ROI</strong> is your return on investment as a fraction of the underlying asset move. If Bitcoin moves from $98,000 to $107,800, that is a 10% ROI on a spot position. Leverage does not change it.</p>
          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">ROE</strong> is your return on equity, which means return on the margin you put up. That same 10% Bitcoin move, on a 10x long, is approximately 100% ROE. On 20x, approximately 200%. Leverage scales ROE; it does not touch ROI.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The mix-up matters because most exchange interfaces show ROE by default and call it &quot;PNL%&quot; or just &quot;%&quot;. Traders see &quot;+150%&quot; and think the asset moved 150%. It did not. The asset moved roughly 7.5% on 20x leverage. The crypto futures profit calculator on this page shows both numbers separately so you can see the raw asset move and the leveraged return side by side.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">When 10x is too much, and when it isn&apos;t enough</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">Leverage choice is mostly about timeframe and volatility, not about how confident you feel.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">For positions held under five minutes on a major pair like BTC or ETH, 10x to 20x is reasonable assuming a tight stop loss. The wider your stop, the lower the leverage should be, because the stop and the liquidation price together set your maximum loss, not the leverage number alone. People forget this and run 20x with a 4% stop, which is the same risk as 5x with the same stop, except now the liquidation sits at roughly 5% and the stop sits at 4%, leaving almost no buffer if the stop fails to fill in a fast move.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">For overnight or multi-day swings, 3x to 5x is the upper bound for most people. Funding eats more than they expect, daily candles wick further than they expect, and the psychological cost of watching a position bleed for forty hours is higher than they planned for.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">For altcoin positions, cut whatever the BTC/ETH leverage would be roughly in half. Alts wick further. The tier system on most exchanges drops the maximum allowable leverage for smaller-cap coins anyway, but even within the allowed range, 10x on a low-cap alt behaves more like 25x on Bitcoin in terms of liquidation risk. If you want to gut-check how an altcoin&apos;s volatility compares to Bitcoin or Ethereum before sizing a position, the <Link href="/compare-cryptocurrencies" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50">crypto comparison tool</Link> on this site puts them side by side.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The takeaway is simple. Leverage is the coarse knob, position size is the fine one. Most traders adjust the wrong one.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Where the calculator falls short</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">A few honest limitations.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The calculator does not connect to your exchange. It does not know your actual fee tier, your unrealized PNL on other positions, your cross-margin balance, or whether the maintenance margin on a particular contract is currently elevated. For finalizing a trade, the exchange&apos;s own order entry preview will always be more accurate than this tool. Use the exchange preview to pull the trigger; use this calculator earlier, when you are still working out whether the trade makes sense at all.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">It also does not handle isolated versus cross margin differently in any meaningful way. If you are running cross margin with multiple positions, the real liquidation behavior depends on the entire account state, not just the position you are calculating. The number this tool gives you is the isolated-margin equivalent, which is conservative for cross-margin setups but inaccurate.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The other thing it does not model is slippage. On a thin order book or during a fast move, your real entry price can be meaningfully worse than the price you typed in, which shifts every other number downstream. For low-liquidity coins or larger position sizes, run the numbers through our <Link href="/calculators/crypto-slippage-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50">slippage calculator</Link> before trusting the profit estimate from the futures calculator.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">For exchange-specific math, Binance and Bybit both have decent built-in calculators tied to your account that handle fee tiers and cross-margin edge cases. If you are doing serious multi-position management on one exchange, just use theirs. This tool is for the earlier step, the one where you are still working out on the back of an envelope whether the setup is even worth taking.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">If you are looking for advanced position-sizing math like Kelly criterion or risk parity across a portfolio, this is not that tool. Spreadsheets still beat web calculators for that work.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">A note for people specifically searching for a bitcoin leverage calculator</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">The math for Bitcoin futures is the same as for any other linear perpetual contract. Leverage, ROE, and liquidation price all calculate identically. The only thing slightly different about Bitcoin specifically is that maintenance margin tiers on the largest exchanges scale by position size more aggressively than they do for altcoins, because position sizes get larger.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Practically: if you are trading $50,000 of BTC notional, the maintenance margin tier is the same as $50,000 of ETH notional on most platforms. At $5 million in notional, BTC may have slightly different tier breaks. The calculator does not know which exchange you are using, so it cannot bake in those tier-specific rates. For position sizes under $100,000 notional, the difference is negligible and you can trust the output. Above that, sanity-check against the exchange&apos;s own tier table.</p>

          <hr className="border-gray-700/50 my-10" />

          {/* FAQ Section */}
          <div className="mt-12 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6 leading-tight">Frequently Asked Questions</h2>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Is the calculator free, and is there a catch?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">It is free with no account required. The page does not save your inputs anywhere; once you close the tab the data is gone. There is no premium version with extra features behind a paywall.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">How accurate is the liquidation price?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">For sizing decisions, accurate enough to plan around. For the exact liquidation tick, less accurate. Real exchange liquidation engines factor in maintenance margin tiers, mark-price-versus-index-price gaps, and partial liquidation thresholds that this calculator does not. The number you see here will typically be within 0.5% of the actual exchange-side liquidation price. Use it for &quot;is this position safe with my stop?&quot; questions. Use the exchange&apos;s own panel for &quot;exactly when am I getting closed?&quot; questions.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Why is my ROE different from what Binance shows?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Most likely fee handling. The calculator uses standard taker fees of 0.06% on entry and exit. If you are paying maker fees, holding a fee-discount token, or in a VIP tier, your real ROE will be slightly higher. Funding payments are also not included. On a position held more than a few hours, funding can shift the realized ROE by several percent in either direction.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Can I use it for spot trading?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Not really. Spot trading does not have a liquidation price, ROE based on margin, or leverage in the same sense. The calculator is built around the structure of a leveraged perpetual or futures contract. For straightforward spot profit math, our <Link href="/calculators/crypto-profit-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50">crypto profit calculator</Link> handles that case.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Does it work for Bybit, OKX, KuCoin, and the other big exchanges?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">The math is the same across all linear-USDT perpetual contracts, which is the dominant futures product on every major exchange. Inverse contracts (where BTC is the collateral and the contract is denominated in USD) follow slightly different math, and this calculator does not handle those. If you are trading inverse perps on Bybit or BitMEX, stick to the exchange&apos;s own calculator.</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">A worked example</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">Take a long BTC position with $1,000 of margin at 10x leverage, BTC at $98,400. Position size: $10,000 notional. The calculator returns a liquidation price around $88,800. Set a stop at $96,500.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">If BTC reaches $101,000 within the day, ROE is roughly 26%. Hit the stop at $96,500, ROE is roughly negative 19%.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The calculation took less than a minute. The decision of whether the trade is actually worth taking took a lot longer. The calculator does not help with that part. It just makes sure the numbers you are deciding between are the right numbers.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">To run the numbers on your own setup, scroll back up and use the calculator at the top of the page.</p>

          {/* Financial Disclaimer */}
          <div className="mt-12 border border-gray-700 rounded-xl p-6 bg-gray-800/50">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Disclaimer</p>
            <p className="text-gray-300 text-xs leading-6">The Crypto Futures Calculator on this page is provided for informational and educational purposes only. It does not constitute financial, investment, or trading advice. Futures and leveraged trading involves substantial risk of loss and is not suitable for all investors. Liquidation prices, ROE estimates, and profit calculations are approximations based on standard linear perpetual contract formulas and do not account for exchange-specific maintenance margin tiers, funding rates, mark price divergence, partial liquidation thresholds, or fee tier discounts. Actual results on your exchange may differ. Never trade with money you cannot afford to lose entirely. Always verify calculations against your exchange&apos;s own order entry panel before opening any position. Blockchain Bubbles is not responsible for any financial losses incurred from use of this calculator or any trading decisions made based on its output.</p>
          </div>

        </article>
      </section>
      <RelatedTools
        currentPath="/calculators/crypto-futures-calculator"
        showCount={3}
      />
    </>
  )
}
