'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import RelatedTools from '@/components/RelatedTools'

export default function ImpermanentLossCalculatorPage() {
  const [initialDeposit, setInitialDeposit] = useState('')
  const [initialPriceA, setInitialPriceA] = useState('')
  const [initialPriceB, setInitialPriceB] = useState('1.00')
  const [currentPriceA, setCurrentPriceA] = useState('')
  const [currentPriceB, setCurrentPriceB] = useState('1.00')

  const animationIdRef = useRef(null)
  const bubbleContainerRef = useRef(null)
  const bubbleRef = useRef(null)

  const results = useMemo(() => {
    const deposit = parseFloat(initialDeposit) || 0
    const initA = parseFloat(initialPriceA) || 0
    const initB = parseFloat(initialPriceB) || 0
    const currA = parseFloat(currentPriceA) || 0
    const currB = parseFloat(currentPriceB) || 0

    if (deposit <= 0 || initA <= 0 || initB <= 0 || currA <= 0 || currB <= 0) return null

    const halfDeposit = deposit / 2
    const initialTokensA = halfDeposit / initA
    const initialTokensB = halfDeposit / initB
    const hodlValue = (initialTokensA * currA) + (initialTokensB * currB)
    const initialRatio = initA / initB
    const currentRatio = currA / currB
    const R = currentRatio / initialRatio
    const lpValueFactor = (2 * Math.sqrt(R)) / (1 + R)
    const poolValue = hodlValue * lpValueFactor
    const impermanentLossUSD = hodlValue - poolValue
    const impermanentLossPercent = (impermanentLossUSD / hodlValue) * 100
    const isLoss = impermanentLossUSD > 0

    return { hodlValue, poolValue, impermanentLossUSD, impermanentLossPercent, isLoss }
  }, [initialDeposit, initialPriceA, initialPriceB, currentPriceA, currentPriceB])

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

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Calculators', href: '/calculators' },
          { label: 'Impermanent Loss Calculator', href: '/calculators/impermanent-loss-calculator' }
        ]}
        lastUpdated="May 2026"
      />
      <style>{`
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      {/* Calculator Section */}
      <section id="calculator-section" className="bg-gray-900 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-white mb-3">Impermanent Loss Calculator</h1>
          <p className="text-center text-gray-400 mb-12 text-lg">Calculate the core risk (IL) of providing liquidity to DeFi Automated Market Makers (AMMs).</p>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-pink-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">AMM Impermanent Loss Analyzer (50/50 Pool)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

              {/* Inputs card */}
              <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6 border border-gray-700">

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Initial Deposit Value (USD)</label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={initialDeposit}
                    onChange={e => setInitialDeposit(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-pink-500 focus:border-pink-500 transition duration-150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Token A Initial Price ($)</label>
                  <input
                    type="number"
                    placeholder="100.00"
                    value={initialPriceA}
                    onChange={e => setInitialPriceA(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-pink-500 focus:border-pink-500 transition duration-150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Token B Initial Price ($)</label>
                  <input
                    type="number"
                    placeholder="1.00"
                    value={initialPriceB}
                    onChange={e => setInitialPriceB(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-pink-500 focus:border-pink-500 transition duration-150"
                  />
                  <p className="text-xs text-gray-400 mt-1">Set to $1.00 for stablecoin pairs or token A comparison.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Token A Current Price ($)</label>
                  <input
                    type="number"
                    placeholder="150.00"
                    value={currentPriceA}
                    onChange={e => setCurrentPriceA(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-pink-500 focus:border-pink-500 transition duration-150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Token B Current Price ($)</label>
                  <input
                    type="number"
                    placeholder="1.00"
                    value={currentPriceB}
                    onChange={e => setCurrentPriceB(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-pink-500 focus:border-pink-500 transition duration-150"
                  />
                </div>

                <button className="w-full bg-pink-600 text-white font-bold py-3 rounded-xl hover:bg-pink-700 transition duration-150 shadow-lg shadow-pink-500/30">
                  Calculate Impermanent Loss
                </button>
              </div>

              {/* Results card */}
              <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-4">IL Analysis</h3>

                  <div
                    ref={bubbleContainerRef}
                    className="border border-gray-700"
                    style={{ position: 'relative', height: '200px', overflow: 'hidden', borderRadius: '0.5rem', backgroundColor: '#1f2937', marginBottom: '1rem' }}
                  >
                    {!results ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <p className="text-gray-400 italic text-sm">Enter pool details...</p>
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
                          backgroundColor: results.isLoss ? 'rgba(239,68,68,0.8)' : 'rgba(16,185,129,0.8)',
                          boxShadow: `0 4px 20px ${results.isLoss ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.5)'}`,
                        }}
                      >
                        <img
                          src="https://placehold.co/32x32/1f2937/FFFFFF?text=IL"
                          alt="IL"
                          onError={e => { e.target.style.display = 'none' }}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', marginBottom: '0.5rem' }}
                        />
                        <div style={{ fontSize: '1.125rem', fontWeight: '700', lineHeight: '1.2' }}>
                          {currFmt.format(Math.abs(results.impermanentLossUSD))}
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>
                          {Math.abs(results.impermanentLossPercent).toFixed(2)}% IL
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-400">Value of HODL Portfolio</p>
                    <p className="text-lg font-bold text-white">
                      {results ? currFmt.format(results.hodlValue) : '--'}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-400">Pool Value at Current Price</p>
                    <p className="text-lg font-bold text-pink-400">
                      {results ? currFmt.format(results.poolValue) : '--'}
                    </p>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-2">
                    <p className="text-sm text-gray-400">Impermanent Loss (USD)</p>
                    <p className={`text-lg font-bold ${results ? (results.isLoss ? 'text-red-400' : 'text-green-400') : 'text-white'}`}>
                      {results ? currFmt.format(results.impermanentLossUSD) : '--'}
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
            "name": "Impermanent Loss Calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "url": "https://blockchainbubbles.com/calculators/impermanent-loss-calculator"
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
                "name": "Is impermanent loss actually permanent?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Technically no, practically yes. If price returns to the exact ratio at which you deposited, your IL goes back to zero, plus you keep all the fees you earned in the meantime. That's the case for \"impermanent.\" The problem is that prices in crypto rarely revert exactly, and most LPs withdraw at some point regardless of the price. Once you withdraw, the loss is locked in. So \"impermanent\" is true in theory and a stretch in practice."
                }
              },
              {
                "@type": "Question",
                "name": "How does IL compare to just staking the same tokens?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "It depends on what you're staking and at what yield. ETH staking pays 3-4% APR with no IL and decent liquidity via liquid staking tokens. An ETH/USDC pool can pay 8-15% APR in fees but exposes you to IL on every ETH price move. If you have a strong directional view (ETH is going up), HODLing or staking usually beats LPing. Sideways chop, on the other hand, favors the pool."
                }
              },
              {
                "@type": "Question",
                "name": "Does the 2√R/(1+R) − 1 formula work for non-50/50 pools?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No. Balancer's weighted pools (80/20, 95/5, and so on) have their own derivation, and the IL on a heavily weighted pool can be much smaller on the dominant token. For a quick reference, the Balancer documentation has the closed-form expression. Our calculator is set up for the 50/50 case because that's what the vast majority of pool deposits still use."
                }
              },
              {
                "@type": "Question",
                "name": "What's a realistic IL to expect on a typical altcoin pool?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Honestly, more than you think. Most altcoins move 2x to 5x against ETH or USDC over any six-month window, which gives you 5-25% IL just from the math. If the altcoin then dumps to a fraction of where you started, your IL doesn't shrink, it grows. Compare token volatility against your reference asset before you LP, not after."
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
                "name": "Impermanent Loss Calculator",
                "item": "https://blockchainbubbles.com/calculators/impermanent-loss-calculator"
              }
            ]
          })
        }}
      />

      {/* Article Section */}
      <section className="bg-gray-900 pb-20 px-4 sm:px-6 lg:px-8">
        <article className="max-w-3xl mx-auto py-12 px-4 md:px-8">

          <h2 className="text-3xl font-bold text-white mt-0 mb-4 leading-tight">How to calculate impermanent loss (and the parts most calculators skip)</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">At a 4x price move, your impermanent loss is about 20%. At 10x, it&apos;s roughly 42%. Those two numbers do most of the work in any liquidity pool decision you&apos;ll make in DeFi, and yet plenty of people stake real money into pools without ever running them.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The formula behind those percentages is short. The implications are not. This article walks through the math, a worked example with actual dollar amounts, and the things our <Link href="/calculators/impermanent-loss-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50">Impermanent Loss Calculator</Link> (or any other) won&apos;t tell you on its own.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">The impermanent loss formula, in one sentence</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">Impermanent loss in a standard 50/50 constant product pool comes from this:</p>
          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">IL = 2·√R / (1+R) − 1</strong></p>
          <p className="text-gray-300 text-base leading-8 mb-6">R is the price ratio. Take the current price of your volatile asset and divide it by the price you deposited at. If you put ETH in at $2,000 and it&apos;s now $4,000, R = 2.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Plug R = 2 into the formula and you get about −0.0572. That&apos;s a 5.72% drop versus just holding the same tokens in your wallet. (Yes, you can derive this from the constant product invariant xy = k, but the textbook derivation isn&apos;t really what matters here. The number on the right side of the equation is what matters.)</p>
          <p className="text-gray-300 text-base leading-8 mb-6">A few benchmark values worth memorizing:</p>
          <ul className="list-disc list-inside space-y-2 mb-6 text-gray-300 leading-8">
            <li>1.5x price move (R = 1.5): about 2% IL</li>
            <li>2x: 5.7%</li>
            <li>3x: 13.4%</li>
            <li>4x: 20%</li>
            <li>5x: 25.5%</li>
            <li>10x: about 42.5%</li>
          </ul>
          <p className="text-gray-300 text-base leading-8 mb-6">These numbers assume a vanilla Uniswap V2-style 50/50 pool. Concentrated liquidity (Uniswap V3) and skewed pools (Balancer 80/20) follow different curves, and the formula above no longer applies cleanly to them.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">A worked example with real numbers</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">Say you deposit $5,000 worth of ETH (2.5 ETH at $2,000) and $5,000 of USDC into a 50/50 pool. Total starting value: $10,000.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">ETH then runs to $4,000. The AMM, doing what AMMs do, has been quietly selling your ETH the entire way up. By the time the price settles at $4,000, you hold roughly 1.77 ETH and $7,071 USDC. Pool value: about $14,142.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Had you just held the original 2.5 ETH plus your $5,000 USDC, you&apos;d have $10,000 + $5,000 = $15,000 at the new price.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The gap is $858, or about 5.72%. Matches the formula. You&apos;re not in the red. You went from $10k to $14k. You just left some upside on the table compared to doing nothing.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">This is the part the formula gets right and the part most articles overstate. Whether $858 is a real &quot;loss&quot; depends entirely on whether the pool paid you enough in fees and rewards to make up for it. Frequently it does. Sometimes it doesn&apos;t.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">What the calculator doesn&apos;t show you</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">A typical impermanent loss calculator (ours included) outputs a single percentage based on price-in versus price-out. That number is mathematically correct and economically incomplete. It ignores:</p>
          <ul className="list-disc list-inside space-y-2 mb-6 text-gray-300 leading-8">
            <li><strong className="text-white font-semibold">Trading fees collected.</strong> Uniswap V3&apos;s documented fee tiers are 0.01%, 0.05%, 0.30%, and 1%. ETH/USDC sits mostly in the 0.05% pool and pays fees in the 5-15% APR range during normal volume conditions, more in the 0.30% pool when price action picks up. Over a year of moderate volatility, fees often beat the IL.</li>
            <li><strong className="text-white font-semibold">Token rewards.</strong> Yield farming programs on protocols like Aerodrome and Curve gauges can pay 20-100% APR in protocol tokens on top of fees. The IL is real, but so is the income.</li>
            <li><strong className="text-white font-semibold">Gas costs.</strong> On Ethereum mainnet, depositing and withdrawing from an LP can run $30-150 per transaction depending on conditions. On a $1,000 position this matters more than the IL itself.</li>
            <li><strong className="text-white font-semibold">Slippage on entry and exit.</strong> If you&apos;re providing into a thin pool, the act of depositing changes the prices. Worth checking the pool depth before committing.</li>
          </ul>
          <p className="text-gray-300 text-base leading-8 mb-6">The IL number on its own answers the question &quot;what would I have if I&apos;d held instead?&quot; That&apos;s useful but it isn&apos;t the same question as &quot;should I provide liquidity here?&quot; Don&apos;t confuse the two.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Stablecoin pools and the Terra problem</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">Conventional wisdom says stablecoin pools (USDC/USDT, DAI/USDC) have basically zero impermanent loss. That&apos;s mostly true and almost always misleading.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Two stablecoins that stay near $1 each give you R close to 1, which gives you IL close to 0. Curve&apos;s 3pool has lived in this near-zero IL regime for years. Fine.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The catch: stablecoins de-peg sometimes. UST in May 2022 went from $1 to under $0.10 in a week. Anyone in a UST/USDC pool watched their R collapse to roughly 0.1, their IL spike to almost 38%, and their pool drain to almost entirely UST as arbitrageurs took the USDC out. The &quot;low risk&quot; label was correct right up until it wasn&apos;t.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Two years ago I&apos;d have told you stablecoin pools were the genuinely safe play in DeFi. UST changed that for me. The math is still right; the assumption that the pegs hold is the part you&apos;re actually betting on.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">When fees actually save you</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">Sometimes the math lies. Or rather, the math is correct but the conclusion you draw from it isn&apos;t.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Take a high-volume ETH/USDC pool over a year where ETH goes from $2,000 to $3,000 and back. Net price change: zero. IL based on starting and ending price: also zero. But during that year, ETH spent significant time at $2,500, $2,800, $1,900, and so on. Every time the price moved, the pool rebalanced, locking in a small amount of IL along the way. Pool fee income, however, accumulated continuously.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Side note: &quot;impermanent&quot; is one of crypto&apos;s worst pieces of branding. The loss is permanent the second you withdraw, and almost everyone withdraws. &quot;Divergence loss&quot; would have been more honest. Anyway, back to fees.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The right way to think about a pool isn&apos;t &quot;what&apos;s my IL going to be&quot; in isolation. It&apos;s &quot;what&apos;s my IL going to be relative to the fee yield I&apos;m capturing.&quot; A pool paying 25% APR in fees can absorb a fair amount of IL and still beat HODL. A pool paying 2% APR cannot. If you only have one number from the calculator, you only have half the answer.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Concentrated liquidity changes the picture</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">Uniswap V3 (and the copies of it on every chain that runs an EVM) introduced concentrated liquidity, where you set a price range and only earn fees while price stays inside it. Uniswap&apos;s own announcement claims up to 4,000x capital efficiency relative to V2 at very tight ranges, and that efficiency cuts both ways.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Here&apos;s the part the standard formula misses. Take an ETH/USDC position with a range of 0.5x to 2x the current price. That position carries roughly a 3.4x amplification factor versus a V2 position of the same size. So if ETH doubles (R = 2), your IL inside the range isn&apos;t the V2 number of 5.72%. It&apos;s closer to 19%.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">And then a worse thing happens: at R = 2 you&apos;ve hit the upper edge of your range. Your position is now 100% USDC. You stop earning fees, plus ETH keeps running without you. The 19% number is just the realized IL at the boundary. The opportunity cost above the range adds to it indefinitely.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Tighter ranges multiply this. A 0.8x-1.25x range has an amplification factor closer to 9x. Looks great when price stays put, brutal when it doesn&apos;t.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">If you&apos;re providing concentrated liquidity, you basically need a position simulator (Revert Finance, DefiLab, or just a spreadsheet) rather than a generic IL calculator. Worth saying, since I see people drop V3 positions and then run V2 calculators on them.</p>

          <hr className="border-gray-700/50 my-10" />

          {/* FAQ Section */}
          <div className="mt-12 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6 leading-tight">Frequently Asked Questions</h2>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Is impermanent loss actually permanent?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Technically no, practically yes. If price returns to the exact ratio at which you deposited, your IL goes back to zero, plus you keep all the fees you earned in the meantime. That&apos;s the case for &quot;impermanent.&quot; The problem is that prices in crypto rarely revert exactly, and most LPs withdraw at some point regardless of the price. Once you withdraw, the loss is locked in. So &quot;impermanent&quot; is true in theory and a stretch in practice.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">How does IL compare to just staking the same tokens?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">It depends on what you&apos;re staking and at what yield. ETH staking pays 3-4% APR with no IL and decent liquidity via liquid staking tokens. An ETH/USDC pool can pay 8-15% APR in fees but exposes you to IL on every ETH price move. If you have a strong directional view (ETH is going up), HODLing or staking usually beats LPing. Sideways chop, on the other hand, favors the pool. Our <Link href="/calculators/staking-rewards-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50">Staking Rewards Calculator</Link> handles the staking side of that comparison.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Does the 2√R/(1+R) − 1 formula work for non-50/50 pools?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">No. Balancer&apos;s weighted pools (80/20, 95/5, and so on) have their own derivation, and the IL on a heavily weighted pool can be much smaller on the dominant token. For a quick reference, the Balancer documentation has the closed-form expression. Our calculator is set up for the 50/50 case because that&apos;s what the vast majority of pool deposits still use.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">What&apos;s a realistic IL to expect on a typical altcoin pool?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Honestly, more than you think. Most altcoins move 2x to 5x against ETH or USDC over any six-month window, which gives you 5-25% IL just from the math. If the altcoin then dumps to a fraction of where you started, your IL doesn&apos;t shrink, it grows. Compare token volatility against your reference asset <em>before</em> you LP, not after.</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">What to actually do with this</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">Don&apos;t memorize the formula. Run real numbers through the <Link href="/calculators/impermanent-loss-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50">Impermanent Loss Calculator</Link> at the prices you actually expect, not the ones the calculator defaults to. Then add 2-4 percentage points to the result before deciding, because that&apos;s roughly what gas plus a typical mistimed exit will cost you on a six-month position. Then check whether the pool&apos;s expected fee yield clears that adjusted IL with margin to spare. If it does, you&apos;re probably fine. If it&apos;s close, the pool isn&apos;t worth the position management.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The math is the easy part. Treating the math as the entire decision is where people lose money.</p>

          {/* Financial Disclaimer */}
          <div className="mt-12 border border-gray-700 rounded-xl p-6 bg-gray-800/50">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Disclaimer</p>
            <p className="text-gray-400 text-xs leading-6">The Impermanent Loss Calculator and related content on this page are provided for informational and educational purposes only. They do not constitute financial, investment, or DeFi advice. Impermanent loss calculations are mathematical estimates based on standard constant product AMM formulas and may not reflect actual outcomes in concentrated liquidity pools, weighted pools, or protocols with additional reward mechanisms. DeFi liquidity provision involves substantial risks including but not limited to smart contract vulnerabilities, token de-pegging, liquidity drains, and total loss of funds. Always conduct your own research before providing liquidity to any protocol. Blockchain Bubbles is not responsible for any financial losses incurred from use of this calculator or any liquidity provision decisions made based on its output.</p>
          </div>

        </article>
      </section>
      <RelatedTools
        currentPath="/calculators/impermanent-loss-calculator"
        showCount={3}
      />
    </>
  )
}
