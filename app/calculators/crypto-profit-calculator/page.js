'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import RelatedTools from '@/components/RelatedTools'


export default function CryptoProfitCalculatorPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCoin, setSelectedCoin] = useState(null)

  const [buyPrice, setBuyPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [investmentAmount, setInvestmentAmount] = useState('')
  const [feeBuy, setFeeBuy] = useState('0')
  const [feeSell, setFeeSell] = useState('0')

  const [results, setResults] = useState(null)

  const searchTimeoutRef = useRef(null)
  const animationIdRef = useRef(null)
  const bubbleContainerRef = useRef(null)
  const bubbleRef = useRef(null)

  // Debounced search
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

  // Escape → close dropdown
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
        `https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd&include_24hr_change=true`
      )
      const data = await res.json()
      const price = data[coin.id]?.usd
      if (price) setBuyPrice(price.toString())
    } catch (err) {
      console.error('Price fetch failed:', err)
    }
  }

  // Recalculate on any input change
  useEffect(() => {
    const bp = parseFloat(buyPrice) || 0
    const sp = parseFloat(sellPrice) || 0
    const inv = parseFloat(investmentAmount) || 0
    const fb = parseFloat(feeBuy) || 0
    const fs = parseFloat(feeSell) || 0

    if (inv <= 0 || bp <= 0 || sp <= 0) {
      setResults(null)
      return
    }

    const netInvestment = inv - fb
    if (netInvestment <= 0) {
      setResults({ error: 'Investment too low for fees' })
      return
    }

    const cryptoAmount = netInvestment / bp
    const grossExit = cryptoAmount * sp
    const totalExit = grossExit - fs
    const profitLoss = totalExit - inv
    const profitPercent = (profitLoss / inv) * 100

    setResults({
      netInvestment,
      totalExit,
      totalFees: fb + fs,
      profitLoss,
      profitPercent,
      isProfit: profitLoss >= 0,
      coinImage: selectedCoin?.thumb || null,
    })
  }, [buyPrice, sellPrice, investmentAmount, feeBuy, feeSell, selectedCoin])

  // Animate bubble
  useEffect(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
      animationIdRef.current = null
    }
    if (!results || results.error || !bubbleContainerRef.current || !bubbleRef.current) return

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

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Calculators', href: '/calculators' },
          { label: 'Crypto Profit Calculator', href: '/calculators/crypto-profit-calculator' }
        ]}
        lastUpdated="May 2026"
      />
      <style>{`
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
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
        .article-content a { color: #60a5fa; text-decoration: underline; transition: color 0.15s; }
        .article-content a:hover { color: #93c5fd; }
      `}</style>

      {/* Calculator Section */}
      <section className="bg-gray-900 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-white mb-3">Crypto Profit Calculator</h1>
          <p className="text-center text-gray-400 mb-12 text-lg">Calculate your potential profit, loss, and ROI on any cryptocurrency trade.</p>

          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">Crypto Profit Calculator</h2>
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
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 pl-10 border border-gray-600 focus:border-blue-500 focus:outline-none"
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
                            <img
                              src={coin.thumb}
                              alt={coin.name}
                              className="w-7 h-7 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-medium text-sm">{coin.name}</div>
                              <div className="text-gray-400 text-xs">{coin.symbol.toUpperCase()}</div>
                            </div>
                            {coin.market_cap_rank && (
                              <div className="text-gray-500 text-xs flex-shrink-0">#{coin.market_cap_rank}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Buy / Sell Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Buy Price ($)</label>
                    <input
                      type="number" placeholder="0.00" value={buyPrice}
                      onChange={e => setBuyPrice(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Sell Price ($)</label>
                    <input
                      type="number" placeholder="0.00" value={sellPrice}
                      onChange={e => setSellPrice(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    />
                  </div>
                </div>

                {/* Investment & Buy Fee */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Investment ($)</label>
                    <input
                      type="number" placeholder="100" value={investmentAmount}
                      onChange={e => setInvestmentAmount(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Buy Fee ($)</label>
                    <input
                      type="number" placeholder="0" value={feeBuy}
                      onChange={e => setFeeBuy(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    />
                  </div>
                </div>

                {/* Sell Fee */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Sell Fee ($)</label>
                  <input
                    type="number" placeholder="0" value={feeSell}
                    onChange={e => setFeeSell(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  />
                </div>
              </div>

              {/* Results card */}
              <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-4">Crypto Profit Result</h3>

                  <div className="result-bubble-container border border-gray-700 overflow-hidden" ref={bubbleContainerRef}>
                    {!results ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <p className="text-gray-400 italic text-sm">Enter trade details...</p>
                      </div>
                    ) : results.error ? (
                      <div className="p-4 text-center text-red-400 h-full flex items-center justify-center text-sm">
                        {results.error}
                      </div>
                    ) : (
                      <div
                        ref={bubbleRef}
                        className="result-bubble"
                        style={{
                          backgroundColor: results.isProfit ? 'rgba(16,185,129,0.8)' : 'rgba(239,68,68,0.8)',
                          boxShadow: `0 4px 20px ${results.isProfit ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`,
                        }}
                      >
                        <img
                          src={results.coinImage || 'https://placehold.co/32x32/1f2937/FFFFFF?text=$'}
                          alt="Coin"
                          onError={e => { e.target.src = 'https://placehold.co/32x32/1f2937/FFFFFF?text=$' }}
                        />
                        <div className="pla">
                          {results.profitLoss >= 0 ? '+' : ''}{currFmt.format(Math.abs(results.profitLoss))}
                        </div>
                        <div className="plp">
                          {results.profitPercent >= 0 ? '+' : ''}{Math.abs(results.profitPercent).toFixed(2)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-400">Net Investment</p>
                    <p className="text-lg font-bold text-white">
                      {results && !results.error ? currFmt.format(results.netInvestment) : '--'}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-400">Total Exit Value</p>
                    <p className="text-lg font-bold text-white">
                      {results && !results.error ? currFmt.format(results.totalExit) : '--'}
                    </p>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-2">
                    <p className="text-sm text-gray-400">Total Fees</p>
                    <p className="text-lg font-bold text-red-400">
                      {results && !results.error ? currFmt.format(results.totalFees) : '--'}
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
            "name": "Crypto Profit Calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "url": "https://blockchainbubbles.com/calculators/crypto-profit-calculator"
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
                "name": "How accurate is the price data?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "It's pulled from CoinGecko's aggregated feed, which combines data from 600+ exchanges. For top-100 coins the price is usually within 0.5% of major exchange prices. For obscure altcoins the aggregated price can drift more, especially on low-liquidity pairs. If you're trading something outside the top 200 by market cap, treat the autofill as a starting estimate and overwrite it."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use this for short selling?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sort of. Plug your short entry into the buy price field and your cover price into the sell price field. A negative result is your profit. It's a workaround, not what the tool's built for. If you trade shorts often, get a dedicated tool."
                }
              },
              {
                "@type": "Question",
                "name": "Does it factor in gas fees and withdrawal costs?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, but you have to add them yourself in the buy fee or sell fee fields. The calculator doesn't auto-pull gas prices because they vary too much by chain and time of day. Convert your estimated gas cost to USD and lump it in with whatever exchange commission you're paying. For Ethereum-based trades during congestion, gas can be the biggest cost component."
                }
              },
              {
                "@type": "Question",
                "name": "What's the best way to use this if I'm doing dollar-cost averaging?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Calculate your weighted average buy price across all your purchases, use that as the single buy price input, and put your total investment across all buys in the investment field. The DCA calculator linked above does the weighted-average math for you, then you bring that number here for the exit-side modeling."
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
                "name": "Crypto Profit Calculator",
                "item": "https://blockchainbubbles.com/calculators/crypto-profit-calculator"
              }
            ]
          })
        }}
      />

      {/* Article Section */}
      <section className="bg-gray-900 pb-20 px-4 sm:px-6 lg:px-8">
        <article className="max-w-3xl mx-auto py-12 px-4 md:px-8">

          <h2 className="text-3xl font-bold text-white mt-0 mb-4 leading-tight">Crypto Profit Calculator</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">Most crypto profit calculators show you the gross price difference between buy and sell and call that your profit. The figure you actually pocket can run 1–3% lower, sometimes more on small trades, after fees and slippage and any withdrawal costs. That gap is where traders quietly lose money over months without noticing.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">This calculator handles the unglamorous math. It runs spot-market profit and loss calculations with full fee accounting, so what you see on screen matches what hits your account. Built as part of <Link href="/" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50">the live bubble chart</Link> toolset for traders who want clean numbers without spreadsheet gymnastics.</p>

          {/* Key Takeaways Box */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 my-8">
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Key Takeaways
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1 text-lg leading-none">✓</span>
                <span className="text-gray-300 text-sm leading-relaxed">Real crypto profit is always lower than the gross price difference, fees reduce your return by 1–3% on most trades.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1 text-lg leading-none">✓</span>
                <span className="text-gray-300 text-sm leading-relaxed">Enter fees as flat dollar amounts, not percentages, for accurate results including gas and withdrawal costs.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1 text-lg leading-none">✓</span>
                <span className="text-gray-300 text-sm leading-relaxed">This is a spot-market calculator only. Use the futures calculator for leveraged positions with liquidation risk.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1 text-lg leading-none">✓</span>
                <span className="text-gray-300 text-sm leading-relaxed">The price feed lags real-time by 30–60 seconds. Use your exchange price for precise scalping calculations.</span>
              </li>
            </ul>
          </div>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Why a 10% gain on the chart isn&apos;t 10% in your wallet</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">On a $1,000 trade with 0.1% maker and 0.1% taker fees, your real break-even isn&apos;t the entry price. It&apos;s the entry price plus roughly 0.2% of trade value, plus whatever the spread costs you. The percentage stays the same as your trade size grows, but the dollar amount stings more on bigger positions, and small trades have it worst because the fees can eat half the move.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">This is why traders who only watch the chart&apos;s gross percentage end up confused when their realized P&amp;L disappoints. A bunch of small trades with 0.5% gains can net you nothing. Losses get worse the same way: a 0.5% chart loss is often 0.7–1% in your account once fees and slippage land.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The free crypto profit calculator on this page bakes those costs into the result. You enter your fees in dollar terms because real fees rarely fit a clean percentage. Network gas is a flat amount that has nothing to do with your trade size, withdrawal-network surcharges shift depending on the chain you use, and trying to convert all of that into one tidy percent is how mistakes happen.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">For thin-liquidity altcoin pairs you can also <Link href="/calculators/crypto-slippage-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50">model slippage separately</Link>. Most trades in the top 50 don&apos;t need it.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">How to calculate crypto profit without missing the fees</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">Real profit on a spot trade equals total exit value minus total fees minus initial investment. People who get the calculation wrong usually missed a fee, not the formula.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Costs people forget: exchange commissions on the buy and the sell side, network gas if you bridged the asset across chains or moved it to or from a self-custody wallet, withdrawal fees if you eventually pulled the asset to fiat or to another exchange, and conversion spreads when buying with a non-USD currency. The withdrawal one bites because exchanges quietly charge $5–25 to withdraw stablecoins on certain networks. Tax obligations on realized gains is a separate calculation most calculators rightly skip.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The calculator above uses two fee fields rather than ten because asking for ten would be annoying and most traders don&apos;t want to itemize. Add up your costs and put the total in the buy fee and sell fee inputs.</p>

          {/* Pro Tip Box */}
          <div className="border-l-4 border-blue-500 bg-blue-500/10 rounded-r-xl p-5 my-6">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Pro Tip</p>
            <p className="text-gray-300 text-sm leading-relaxed">For traders buying the same asset over weeks or months, calculate your weighted average entry price first and use that as the buy price. Or <Link href="/calculators/dca-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50">average down across multiple buys</Link> using the DCA tool, then bring that average back here.</p>
          </div>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">What each input actually means</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">The five inputs are designed to be self-explanatory but a couple deserve a quick note since people get them wrong.</p>
          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">Crypto coin</strong> pulls live prices from CoinGecko&apos;s API. Search by name (Chainlink, Solana) or ticker (LINK, SOL). The price auto-fills as a starting point but you should overwrite it with your actual entry and exit prices, not the current market price.</p>
          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">Buy price</strong> and <strong className="text-white font-semibold">sell price</strong> are per-unit prices in USD. If you bought 0.5 BTC at $62,000 each, the buy price is 62000, not 31000. The math handles the unit count from your investment amount.</p>
          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">Investment amount</strong> is the total USD you committed at entry, not including fees. So if you spent $1,000 and paid a $5 commission, the investment is $1,000 here and the $5 goes in buy fee.</p>
          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">Buy fee</strong> and <strong className="text-white font-semibold">sell fee</strong> are flat dollar amounts. If your fee was 0.1% on a $1,000 trade, that&apos;s $1 in this field. The calculator doesn&apos;t ask you to convert percentages because some traders work in flat fees and some in percentages, and forcing one format makes the tool worse for half the audience.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The result panel shows net investment, total exit value, total fees, and the profit/loss with ROI percentage. If the ROI feels suspiciously different from what you expected, the fees are usually the reason.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Where this calculator falls short</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">This is a spot-market calculator. If you&apos;re trading futures or perpetuals with leverage, <Link href="/calculators/crypto-futures-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50">use the crypto futures calculator</Link> instead. Spot math doesn&apos;t model liquidation prices, funding rates, or margin requirements, all of which matter more than fees for leveraged positions.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">It doesn&apos;t track tax obligations either. CoinLedger and Koinly are dedicated tax tools for capital gains and cost basis tracking across hundreds of trades. Use those for that problem.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Same goes for technical analysis. TradingView handles indicators and chart drawing. The calculator answers &quot;how much will I make on this trade if these prices hit?&quot; It doesn&apos;t answer &quot;should I take this trade?&quot;</p>

          {/* Important Note Box */}
          <div className="border-l-4 border-yellow-500 bg-yellow-500/10 rounded-r-xl p-5 my-6">
            <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-2">Important Note</p>
            <p className="text-gray-300 text-sm leading-relaxed">The price feed lags real-time exchange prices by 30–60 seconds because CoinGecko aggregates across many exchanges. None of that matters if you&apos;re holding for weeks. Scalping is a different story; pull prices from your exchange directly.</p>
          </div>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">A crypto profit loss calculator works in both directions</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">The &quot;profit&quot; framing in calculator names is misleading because the same math runs the loss side. Enter a sell price below your buy price and the calculator returns negative ROI, with the fees still subtracted, which makes the loss slightly worse than the price difference suggests.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">If your plan is to exit when the price drops 5% from entry, run the calculation with that 5%-down sell price and see what your actual loss is in dollars after fees. On a $1,000 position that 5% might be a $52 real loss instead of a clean $50. Knowing the dollar figure ahead of time makes the trigger easier to pull when the price actually moves against you.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">For position sizing, decide what dollar loss you&apos;re willing to absorb, then back into the position size that makes that loss tolerable. If you can absorb a $100 loss and your stop is 8% below entry, your max position is roughly $1,250.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">What a good crypto trading profit calculator gives you</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">The minimum is the four-number output: net investment, exit value, total fees, P&amp;L with ROI. Most calculators stop there.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">A few extras genuinely help. Live price autofill saves a lookup tab. The break-even price as a separate output answers &quot;what&apos;s the minimum sell price that gets me back to flat?&quot; which is a different question from profit. ROI as a percentage relative to net investment, not gross investment, is the honest number to display.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">What a calculator shouldn't do: bundle in tax estimates that go out of date, suggest trades, or pretend to model slippage without exchange data. Slippage varies by liquidity and order book depth, and any calculator claiming to model it without that data is making numbers up.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">If you want to model two trade ideas head to head before committing capital, <Link href="/compare-cryptocurrencies" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50">compare two coins side by side before buying</Link> using the comparison tool.</p>

          <hr className="border-gray-700/50 my-10" />

          {/* FAQ Section */}
          <div className="mt-12 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6 leading-tight">Frequently Asked Questions</h2>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">How accurate is the price data?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">It&apos;s pulled from CoinGecko&apos;s aggregated feed, which combines data from 600+ exchanges. For top-100 coins the price is usually within 0.5% of major exchange prices. For obscure altcoins the aggregated price can drift more, especially on low-liquidity pairs. If you&apos;re trading something outside the top 200 by market cap, treat the autofill as a starting estimate and overwrite it.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Can I use this for short selling?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Sort of. Plug your short entry into the buy price field and your cover price into the sell price field. A negative result is your profit. It&apos;s a workaround, not what the tool&apos;s built for. If you trade shorts often, get a dedicated tool.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Does it factor in gas fees and withdrawal costs?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Yes, but you have to add them yourself in the buy fee or sell fee fields. The calculator doesn&apos;t auto-pull gas prices because they vary too much by chain and time of day. Convert your estimated gas cost to USD and lump it in with whatever exchange commission you&apos;re paying. For Ethereum-based trades during congestion, gas can be the biggest cost component.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">What&apos;s the best way to use this if I&apos;m doing dollar-cost averaging?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Calculate your weighted average buy price across all your purchases, use that as the single buy price input, and put your total investment across all buys in the investment field. The DCA calculator linked above does the weighted-average math for you, then you bring that number here for the exit-side modeling.</p>
              </div>
            </div>
          </div>

          {/* Financial Disclaimer */}
          <div className="mt-12 border border-gray-700 rounded-xl p-6 bg-gray-800/50">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Disclaimer</p>
            <p className="text-gray-400 text-xs leading-6">The Crypto Profit Calculator on this page is provided for informational and educational purposes only. It does not constitute financial, investment, or trading advice. All calculations are estimates based on the inputs you provide and may not reflect actual trading outcomes due to market volatility, exchange-specific fees, slippage, and other factors. Cryptocurrency trading involves substantial risk of loss. Past performance is not indicative of future results. Always conduct your own research and consult a qualified financial advisor before making any investment decisions. Blockchain Bubbles is not responsible for any financial losses incurred from use of this tool.</p>
          </div>

        </article>
      </section>
      <RelatedTools
        currentPath="/calculators/crypto-profit-calculator"
        showCount={3}
      />
    </>
  )
}
