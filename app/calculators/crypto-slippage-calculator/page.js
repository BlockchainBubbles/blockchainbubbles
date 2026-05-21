'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import RelatedTools from '@/components/RelatedTools'

export default function SlippageCalculatorPage() {
  const [expectedPrice, setExpectedPrice] = useState('')
  const [finalPrice, setFinalPrice] = useState('')
  const [tradeAmount, setTradeAmount] = useState('')
  const [slippageTolerance, setSlippageTolerance] = useState('0.5')

  const animationIdRef = useRef(null)
  const bubbleContainerRef = useRef(null)
  const bubbleRef = useRef(null)

  const results = useMemo(() => {
    const exp = parseFloat(expectedPrice) || 0
    const fin = parseFloat(finalPrice) || 0
    const amt = parseFloat(tradeAmount) || 0
    const tol = parseFloat(slippageTolerance) || 0

    if (amt <= 0 || exp <= 0 || fin <= 0) return null

    const priceDeviation = Math.abs(exp - fin)
    const slippagePercent = (priceDeviation / exp) * 100
    const slippageLoss = (amt * slippagePercent) / 100
    const isToleranceExceeded = slippagePercent > tol

    return { priceDeviation, slippagePercent, slippageLoss, isToleranceExceeded }
  }, [expectedPrice, finalPrice, tradeAmount, slippageTolerance])

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

  const bubbleColor = results
    ? results.isToleranceExceeded ? 'rgba(239,68,68,0.8)' : 'rgba(251,191,36,0.8)'
    : 'rgba(31,41,55,0.8)'
  const bubbleShadow = results
    ? results.isToleranceExceeded ? 'rgba(239,68,68,0.5)' : 'rgba(251,191,36,0.5)'
    : 'rgba(0,0,0,0.3)'
  const bubbleTextColor = results && !results.isToleranceExceeded ? 'black' : 'white'

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Calculators', href: '/calculators' },
          { label: 'Crypto Slippage Calculator', href: '/calculators/crypto-slippage-calculator' }
        ]}
        lastUpdated="May 2026"
      />
      <style>{`
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      {/* Calculator Section */}
      <section className="bg-gray-900 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-white mb-3">Crypto Slippage Calculator</h1>
          <p className="text-center text-gray-400 mb-12 text-lg">Measure unexpected trading costs (slippage) on decentralized exchanges (DEXs).</p>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-yellow-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">DEX Slippage Analyzer</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

              {/* Inputs card */}
              <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6 border border-gray-700">

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Expected Execution Price ($)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={expectedPrice}
                    onChange={e => setExpectedPrice(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-yellow-500 focus:border-yellow-500 transition duration-150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Final Executed Price ($)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={finalPrice}
                    onChange={e => setFinalPrice(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-yellow-500 focus:border-yellow-500 transition duration-150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Trade Amount ($ to swap/sell)</label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={tradeAmount}
                    onChange={e => setTradeAmount(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-yellow-500 focus:border-yellow-500 transition duration-150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Slippage Tolerance (e.g., 0.5%)</label>
                  <input
                    type="number"
                    placeholder="0.5"
                    step="0.01"
                    value={slippageTolerance}
                    onChange={e => setSlippageTolerance(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-yellow-500 focus:border-yellow-500 transition duration-150"
                  />
                </div>

                <button className="w-full bg-yellow-600 text-white font-bold py-3 rounded-xl hover:bg-yellow-700 transition duration-150 shadow-lg shadow-yellow-500/30">
                  Calculate Slippage
                </button>
              </div>

              {/* Results card */}
              <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-4">Slippage Result</h3>

                  <div
                    ref={bubbleContainerRef}
                    className="border border-gray-700"
                    style={{ position: 'relative', height: '200px', overflow: 'hidden', borderRadius: '0.5rem', backgroundColor: '#1f2937', marginBottom: '1rem' }}
                  >
                    {!results ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <p className="text-gray-400 italic text-sm">Enter trade details...</p>
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
                          color: bubbleTextColor,
                          padding: '1rem',
                          border: '2px solid rgba(255,255,255,0.1)',
                          willChange: 'transform',
                          backdropFilter: 'blur(5px)',
                          backgroundColor: bubbleColor,
                          boxShadow: `0 4px 20px ${bubbleShadow}`,
                        }}
                      >
                        <img
                          src="https://placehold.co/32x32/1f2937/FFFFFF?text=$"
                          alt="$"
                          onError={e => { e.target.style.display = 'none' }}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', marginBottom: '0.5rem' }}
                        />
                        <div style={{ fontSize: '1.125rem', fontWeight: '700', lineHeight: '1.2' }}>
                          {currFmt.format(results.slippageLoss)}
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>
                          {results.slippagePercent.toFixed(2)}% SLIPPAGE
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-400">Total Price Deviation</p>
                    <p className="text-lg font-bold text-white">
                      {results ? currFmt.format(results.priceDeviation) : '--'}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-400">Slippage Loss (USD)</p>
                    <p className="text-lg font-bold text-red-400">
                      {results ? currFmt.format(results.slippageLoss) : '--'}
                    </p>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-2">
                    <p className="text-sm text-gray-400">Slippage %</p>
                    <p className={`text-lg font-bold ${results ? (results.isToleranceExceeded ? 'text-red-400' : 'text-yellow-400') : 'text-white'}`}>
                      {results ? `${results.slippagePercent.toFixed(2)}%` : '--'}
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
            "name": "Crypto Slippage Calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "url": "https://www.blockchainbubbles.com/calculators/crypto-slippage-calculator"
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
                "name": "What's a reasonable slippage tolerance for a $5,000 ETH-to-USDC swap?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For a deep ETH-USDC pool on a major DEX during normal market conditions, 0.3 to 0.5 percent is usually fine. Bump it up if there's a sharp price move in progress, or if you're swapping during low-liquidity hours like late Sunday night UTC. If your actual slippage came in well under your tolerance, you set it too high and were probably visible to sandwich bots."
                }
              },
              {
                "@type": "Question",
                "name": "Why do I keep getting transaction failed even with 5 percent tolerance?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Either the pool has so little liquidity that even your small trade pushes the price more than 5 percent, or there's a token tax built into the contract that the DEX router isn't accounting for. Memecoins love this trick. Check the token contract for transfer fees before you blame the DEX."
                }
              },
              {
                "@type": "Question",
                "name": "Does using a higher gas setting reduce slippage?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Slightly, in volatile markets. Higher gas means your transaction lands faster, which means less time for the pool state to change between signing and confirmation. It doesn't help with price impact at all, though. If you're paying triple gas to save 0.05 percent slippage, you're losing money to optimize the wrong variable."
                }
              },
              {
                "@type": "Question",
                "name": "My slippage came in negative and the trade gave me a better price than quoted. Is that a bug?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No, it's positive slippage and it's real, just rare on AMM-based DEXes. It happens when the pool state moves in your favor between your wallet quoting the trade and the transaction landing. If you see it more than occasionally, check whether your wallet is using a stale quote rather than refreshing before you sign."
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
                "item": "https://www.blockchainbubbles.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Calculators",
                "item": "https://www.blockchainbubbles.com/calculators"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Crypto Slippage Calculator",
                "item": "https://www.blockchainbubbles.com/calculators/crypto-slippage-calculator"
              }
            ]
          })
        }}
      />

      {/* Article Section */}
      <section className="bg-gray-900 pb-20 px-4 sm:px-6 lg:px-8">
        <article className="max-w-3xl mx-auto py-12 px-4 md:px-8">

          <h2 className="text-3xl font-bold text-white mt-0 mb-4 leading-tight">Crypto Slippage Calculator</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">During the 2021 DeFi summer, it was common to see Uniswap v2 swaps under $10,000 lose 3 to 5 percent at execution on low-cap tokens. The trade went through, the wallet showed a new balance, and the only way to actually see what slippage cost was to open Etherscan and compare expected output to actual output, line by line.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">This calculator won&apos;t prevent any of that. Nothing does, once the transaction is signed. What it does is let you measure slippage cleanly after the fact, in dollars and percent, so you actually know what DEX trading is costing you across hundreds of swaps.</p>

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
                <span className="text-gray-300 text-sm leading-relaxed">Slippage has two sources: price impact (predictable) and execution slippage (only measurable after the trade).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1 text-lg leading-none">✓</span>
                <span className="text-gray-300 text-sm leading-relaxed">This is a post-trade analyzer. It measures what slippage cost you, not what it will cost on a future trade.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1 text-lg leading-none">✓</span>
                <span className="text-gray-300 text-sm leading-relaxed">Default 0.5% slippage tolerance is wrong for most trades: too high for stablecoin pairs while often too low for low-cap volatile tokens.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1 text-lg leading-none">✓</span>
                <span className="text-gray-300 text-sm leading-relaxed">High tolerance settings make you a target for sandwich bots. High tolerance doesn&apos;t get you a better execution price.</span>
              </li>
            </ul>
          </div>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">How slippage actually shows up on a DEX</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">Slippage on a DEX has two sources, and most explanations conflate them. There&apos;s price impact, where your trade itself moves the price. The bigger your swap relative to the pool size, the more you push the curve against yourself. This isn&apos;t a glitch, it&apos;s how AMMs are designed to work.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Then there&apos;s execution slippage, which happens between the moment you sign the transaction and the moment it&apos;s mined. Other people trade in the meantime, liquidity shifts in or out of the pool, and by the time your transaction lands the pool isn&apos;t where it was when your wallet calculated the quote.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Most interfaces lump these together under &quot;slippage tolerance&quot; because users don&apos;t want to learn the difference. But it matters when you&apos;re trying to figure out why a trade cost more than expected. Price impact you can predict before signing. Execution slippage you can only measure after.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The calculator above measures both, combined, after the trade. Enter the expected execution price your wallet quoted, the price the trade actually settled at, and the trade size. It tells you the gap in actual dollars rather than in basis points or as some abstract fraction of your slippage tolerance setting.</p>

          {/* Important Note Box */}
          <div className="border-l-4 border-yellow-500 bg-yellow-500/10 rounded-r-xl p-5 my-6">
            <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-2">Important Note</p>
            <p className="text-gray-300 text-sm leading-relaxed">Price impact and execution slippage are different problems requiring different solutions. Price impact is reduced by splitting large trades into smaller chunks. Execution slippage is reduced by trading during high-liquidity hours and using faster gas settings.</p>
          </div>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">What this calculator does, and what it doesn&apos;t</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">Worth being clear about scope, because most slippage calculators online are actually price impact estimators that pretend they&apos;re measuring the same thing.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">This calculator is a post-trade analyzer. You feed it numbers from a transaction that already happened and it tells you what slippage actually cost. It doesn&apos;t predict slippage on a future trade. For that, you want the quote your DEX router gives you before you sign.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Uniswap shows the expected price impact directly in its swap interface. 1inch&apos;s aggregator goes further with route-level estimates across multiple liquidity sources. CoW Swap takes a different approach entirely by batching trades together to remove most slippage from the equation.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">What this is good for: looking at a week of swaps and figuring out which ones actually went smoothly versus which ones bled value at execution. That&apos;s a hindsight tool, and hindsight is exactly what most traders skip when they&apos;re chasing the next entry.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">The slippage tolerance setting most people get wrong</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">Most DEX interfaces ship with 0.5 percent slippage tolerance as the default. For stablecoin swaps that&apos;s wildly too high. For volatile altcoins it&apos;s often too low.</p>

          {/* Important Note Box */}
          <div className="border-l-4 border-yellow-500 bg-yellow-500/10 rounded-r-xl p-5 my-6">
            <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-2">Important Note</p>
            <p className="text-gray-300 text-sm leading-relaxed">Setting tolerance high doesn&apos;t help you get a better price. It just means your transaction won&apos;t fail. The execution still happens at whatever the pool gives you. Sandwich attackers specifically target high tolerance settings to front-run your trades.</p>
          </div>

          <p className="text-gray-300 text-base leading-8 mb-6">For stablecoin pairs in deep pools, 0.1 percent is usually enough. Anything above 0.3 percent on a USDC-USDT swap means something weird is happening with the route.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">For blue-chip liquid tokens like ETH, BTC, or major L1s on a high-liquidity pool, 0.3 to 0.5 percent works for normal market conditions. During fast-moving days, bump it up.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">For low-cap or thin-liquidity tokens, 1 percent minimum, often 2 to 3 percent. If you need above 5 percent for a token to trade at all, that&apos;s a signal about the token, not about your settings.</p>

          {/* Pro Tip Box */}
          <div className="border-l-4 border-blue-500 bg-blue-500/10 rounded-r-xl p-5 my-6">
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-2">Pro Tip</p>
            <p className="text-gray-300 text-sm leading-relaxed">Sandwich attackers love high tolerance settings. If you&apos;re set to 3 percent on a moderately liquid pool, a bot can front-run you, push the price, fill behind you, and pocket the difference. Your transaction succeeds. You just paid them to make it happen.</p>
          </div>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Reading the result without fooling yourself</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">The calculator gives you three numbers: the total price deviation, the slippage loss in dollars, and the slippage as a percent. The dollar figure is usually the one that matters most.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Take a trader who runs about $180,000 of swap volume in a year, with average slippage running close to 0.45 percent. That&apos;s roughly $810 in execution costs across the year, before counting gas. On a $25,000 trading account, that&apos;s a 3.2 percent annual drag on capital that never shows up on a P&amp;L statement because each individual trade looked fine. The dollar figure forces you to see it. The percent figure on a single trade lets you ignore it.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Where this gets useful in practice is when you log a few weeks of trades and run them through the calculator. Patterns emerge. Maybe your worst slippage hits cluster around the same hour of day, when liquidity providers are pulling out before US market open. Maybe a specific token consistently costs you more than expected because the main pool has fragmented across two DEXes.</p>

          {/* Pro Tip Box */}
          <div className="border-l-4 border-blue-500 bg-blue-500/10 rounded-r-xl p-5 my-6">
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-2">Pro Tip</p>
            <p className="text-gray-300 text-sm leading-relaxed">Once you identify your slippage patterns, plug those numbers into the <Link href="/calculators/crypto-profit-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50">crypto profit calculator</Link> to get the full picture of what your DEX activity actually netted you, slippage costs included.</p>
          </div>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">When this calculator stops being useful</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">Two scenarios where this isn&apos;t the right tool.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">If you&apos;re about to trade large size on a token with patchy liquidity, the post-trade view is the wrong shape of analysis. You want the route quote before you sign, and an aggregator handles that better than any standalone calculator.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Conventional advice says to just bump up your slippage tolerance and let the trade through. That&apos;s bad advice. Higher tolerance doesn&apos;t get you a better price, it just makes you a more attractive target for sandwich bots. A more honest fix is to split a large swap into smaller chunks, which is essentially what <Link href="/calculators/dca-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50">dollar-cost averaging</Link> does for entries.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The other situation is liquidity provision. If you&apos;re farming or analyzing a pool&apos;s behavior over time, slippage is one variable in a bigger picture. Impermanent loss interacts with execution costs in ways most LPs underestimate. Use the <Link href="/calculators/impermanent-loss-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50">impermanent loss calculator</Link> alongside this one for the full picture.</p>

          <hr className="border-gray-700/50 my-10" />

          {/* FAQ Section */}
          <div className="mt-12 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6 leading-tight">Frequently Asked Questions</h2>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">What&apos;s a reasonable slippage tolerance for a $5,000 ETH-to-USDC swap?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">For a deep ETH-USDC pool on a major DEX during normal market conditions, 0.3 to 0.5 percent is usually fine. Bump it up if there&apos;s a sharp price move in progress, or if you&apos;re swapping during low-liquidity hours like late Sunday night UTC. If your actual slippage came in well under your tolerance, you set it too high and were probably visible to sandwich bots.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Why do I keep getting transaction failed even with 5 percent tolerance?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Either the pool has so little liquidity that even your small trade pushes the price more than 5 percent, or there&apos;s a token tax built into the contract that the DEX router isn&apos;t accounting for. Memecoins love this trick. Check the token contract for transfer fees before you blame the DEX.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Does using a higher gas setting reduce slippage?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Slightly, in volatile markets. Higher gas means your transaction lands faster, which means less time for the pool state to change between signing and confirmation. It doesn&apos;t help with price impact at all, though. If you&apos;re paying triple gas to save 0.05 percent slippage, you&apos;re losing money to optimize the wrong variable.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">My slippage came in negative and the trade gave me a better price than quoted. Is that a bug?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">No, it&apos;s positive slippage and it&apos;s real, just rare on AMM-based DEXes. It happens when the pool state moves in your favor between your wallet quoting the trade and the transaction landing. If you see it more than occasionally, check whether your wallet is using a stale quote rather than refreshing before you sign.</p>
              </div>
            </div>
          </div>

          {/* Financial Disclaimer */}
          <div className="mt-12 border border-gray-700 rounded-xl p-6 bg-gray-800/50">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Disclaimer</p>
            <p className="text-gray-300 text-xs leading-6">The Crypto Slippage Calculator on this page is provided for informational and educational purposes only. It does not constitute financial, investment, or trading advice. Slippage calculations are estimates based on the inputs you provide and may not reflect actual trading outcomes due to pool liquidity changes, gas price variations, MEV activity, and other on-chain factors. DEX trading involves substantial risk of loss including the potential for complete loss of funds. Always verify transaction details before signing. Blockchain Bubbles is not responsible for any financial losses incurred from use of this tool or any trading decisions made based on its output.</p>
          </div>

        </article>
      </section>
      <RelatedTools
        currentPath="/calculators/crypto-slippage-calculator"
        showCount={3}
      />
    </>
  )
}
