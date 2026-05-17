'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import RelatedTools from '@/components/RelatedTools'

export default function DCACalculatorPage() {
  const [investmentAmount, setInvestmentAmount] = useState('')
  const [numberOfBuys, setNumberOfBuys] = useState('')
  const [averageBuyPrice, setAverageBuyPrice] = useState('')
  const [currentTokenPrice, setCurrentTokenPrice] = useState('')
  const [transactionFee, setTransactionFee] = useState('0')

  const animationIdRef = useRef(null)
  const bubbleContainerRef = useRef(null)
  const bubbleRef = useRef(null)

  const results = useMemo(() => {
    const invAmt = parseFloat(investmentAmount) || 0
    const numBuys = parseFloat(numberOfBuys) || 0
    const avgBuyPrice = parseFloat(averageBuyPrice) || 0
    const currPrice = parseFloat(currentTokenPrice) || 0
    const fee = parseFloat(transactionFee) || 0

    if (invAmt <= 0 || numBuys <= 0 || avgBuyPrice <= 0 || currPrice <= 0) return null

    const grossInvestment = invAmt * numBuys
    const totalFees = fee * numBuys
    const dollarsForTokens = grossInvestment - totalFees

    if (dollarsForTokens <= 0) return { feesExceedInvestment: true }

    const totalTokens = dollarsForTokens / avgBuyPrice
    const trueAverageCost = grossInvestment / totalTokens
    const currentPortfolioValue = totalTokens * currPrice
    const netProfit = currentPortfolioValue - grossInvestment
    const roiPercent = (netProfit / grossInvestment) * 100
    const isProfit = netProfit >= 0

    return { totalTokens, trueAverageCost, netProfit, roiPercent, isProfit, feesExceedInvestment: false }
  }, [investmentAmount, numberOfBuys, averageBuyPrice, currentTokenPrice, transactionFee])

  useEffect(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
      animationIdRef.current = null
    }
    if (!results || results.feesExceedInvestment || !bubbleContainerRef.current || !bubbleRef.current) return

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

  const tokenFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 })
  const currFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

  const validResults = results && !results.feesExceedInvestment ? results : null
  const sign = validResults ? (validResults.netProfit >= 0 ? '+' : '') : ''

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Calculators', href: '/calculators' },
          { label: 'DCA Calculator', href: '/calculators/dca-calculator' }
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
          <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-white mb-3">Dollar Cost Averaging (DCA) Calculator</h1>
          <p className="text-center text-gray-400 mb-12 text-lg">Calculate your average price, total spent, and profit using the DCA strategy.</p>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">DCA Investment Analyzer</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

              {/* Inputs card */}
              <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6 border border-gray-700">

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Fixed Investment Amount ($)</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={investmentAmount}
                    onChange={e => setInvestmentAmount(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Number of Purchases (e.g., 12 months)</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={numberOfBuys}
                    onChange={e => setNumberOfBuys(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Simulated Avg. Buy Price ($)</label>
                    <input
                      type="number"
                      placeholder="50.00"
                      value={averageBuyPrice}
                      onChange={e => setAverageBuyPrice(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Current Token Price ($)</label>
                    <input
                      type="number"
                      placeholder="75.00"
                      value={currentTokenPrice}
                      onChange={e => setCurrentTokenPrice(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Fee Per Buy ($)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={transactionFee}
                    onChange={e => setTransactionFee(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                  />
                </div>

                <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition duration-150 shadow-lg shadow-indigo-500/30">
                  Calculate DCA Performance
                </button>
              </div>

              {/* Results card */}
              <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-4">DCA Performance</h3>

                  <div
                    ref={bubbleContainerRef}
                    className="border border-gray-700"
                    style={{ position: 'relative', height: '200px', overflow: 'hidden', borderRadius: '0.5rem', backgroundColor: '#1f2937', marginBottom: '1rem' }}
                  >
                    {!results ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <p className="text-gray-400 italic text-sm">Enter DCA strategy...</p>
                      </div>
                    ) : results.feesExceedInvestment ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <p className="text-red-400 font-semibold text-sm">Fees exceed investment amount</p>
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
                          backgroundColor: validResults.isProfit ? 'rgba(16,185,129,0.8)' : 'rgba(239,68,68,0.8)',
                          boxShadow: `0 4px 20px ${validResults.isProfit ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`,
                        }}
                      >
                        <img
                          src="https://placehold.co/32x32/1f2937/FFFFFF?text=$"
                          alt="$"
                          onError={e => { e.target.style.display = 'none' }}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', marginBottom: '0.5rem' }}
                        />
                        <div style={{ fontSize: '1.125rem', fontWeight: '700', lineHeight: '1.2' }}>
                          {sign}{currFmt.format(validResults.netProfit)}
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>
                          {sign}{validResults.roiPercent.toFixed(2)}% ROI
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-400">Total Tokens Purchased</p>
                    <p className="text-lg font-bold text-white">
                      {validResults ? tokenFmt.format(validResults.totalTokens) : '--'}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-400">True Average Cost</p>
                    <p className="text-lg font-bold text-indigo-400">
                      {validResults ? currFmt.format(validResults.trueAverageCost) : '--'}
                    </p>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-2">
                    <p className="text-sm text-gray-400">Net Profit/Loss (USD)</p>
                    <p className={`text-lg font-bold ${results?.feesExceedInvestment ? 'text-red-400' : validResults ? (validResults.isProfit ? 'text-green-400' : 'text-red-400') : 'text-white'}`}>
                      {results?.feesExceedInvestment
                        ? 'Fees Exceed Investment'
                        : validResults
                          ? currFmt.format(validResults.netProfit)
                          : '--'}
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
            "name": "Crypto DCA Calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "url": "https://blockchainbubbles.com/calculators/dca-calculator"
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
                "name": "So is \"dollar cost averaging\" the same thing as \"value averaging\"?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No, and the difference matters. DCA buys a fixed dollar amount on a schedule regardless of price. Value averaging targets a fixed portfolio value on a schedule, which means you buy more when prices fall and less (or sell) when prices rise. Value averaging tends to beat DCA in choppy markets but requires more capital flexibility, which is why most retail investors stick with plain DCA in practice."
                }
              },
              {
                "@type": "Question",
                "name": "How accurate is the calculator if I'm using a recurring-buy product on an exchange?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "It depends on the exchange and the token. For BTC or ETH on a major exchange, the calculator's output will be within a couple of percent of reality, since execution prices stay close to the displayed market price. For long-tail tokens, expect more drift due to spread, and pull your real buy log if you want the actual number rather than an estimate."
                }
              },
              {
                "@type": "Question",
                "name": "Does the calculator work for stocks or only crypto?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The math is identical. You can plug any asset's prices in and get correct outputs. The reason this page is framed for crypto is that fee structures and price volatility differ enough between stocks and crypto that the practical advice diverges. For stocks specifically, MLQ AI and DCAcalculator dot org both have stock-focused tools that handle dividends and split-adjusted prices more cleanly."
                }
              },
              {
                "@type": "Question",
                "name": "What if I'm DCA'ing into a stablecoin first and bridging into a token later?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "That isn't really DCA in the technical sense. You've separated the dollar-cost step from the actual buy. The calculator still works if you treat each bridge-and-buy event as a single purchase at that day's price. It just adds a layer of bookkeeping. I'd skip the stablecoin step entirely unless your exchange charges extra for direct fiat-to-token recurring buys."
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
                "name": "Crypto DCA Calculator",
                "item": "https://blockchainbubbles.com/calculators/dca-calculator"
              }
            ]
          })
        }}
      />

      {/* Article Section */}
      <section className="bg-gray-900 pb-20 px-4 sm:px-6 lg:px-8">
        <article className="max-w-3xl mx-auto py-12 px-4 md:px-8">

          <h2 className="text-3xl font-bold text-white mb-6 leading-tight">Crypto DCA calculator: real average cost, profit, and ROI</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">The calculator above takes a fixed buy amount, the number of buys you&apos;ve made, the average price you bought at, and the current price. It returns your true average cost after fees, your total tokens, and the net profit or loss in dollars.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">That&apos;s the part most people get wrong. They check their exchange dashboard, see &quot;average cost,&quot; and trust it. The exchange number usually ignores fees. On a $10 weekly buy with a 1% fee, that&apos;s $0.10 per purchase. Small, until you&apos;ve done it 52 times and you&apos;re more than $5 off the real number. Multiply across years and the gap matters.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">If you want a quick way to model what &quot;$50 a week into Bitcoin&quot; actually looks like over a year, that&apos;s what this DCA calculator is for. Below the tool you&apos;ll find the math, where the strategy genuinely helps, and where it falls apart. For sanity-checking which token to DCA into in the first place, <Link href="/" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">the bubble chart on the home page</Link> is faster than scrolling CMC.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Plugging your numbers into the calculator</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">Five fields:</p>

          <ol className="list-decimal list-inside space-y-4 mb-6 text-gray-300 leading-8">
            <li><strong className="text-white font-semibold">Fixed investment amount.</strong> Your per-buy dollar amount. Stay realistic. $50 a week is more useful to model than $5,000 a week if that isn&apos;t actually what you&apos;ll do.</li>
            <li><strong className="text-white font-semibold">Number of purchases.</strong> Total buys across the period. Twelve weekly buys is a quarter, fifty-two is a year. Don&apos;t count partial buys, or do, it doesn&apos;t really matter.</li>
            <li><strong className="text-white font-semibold">Simulated average buy price.</strong> Your estimate of the average market price across those buys. Pull this from a chart, or use last year&apos;s average if you&apos;re forecasting forward.</li>
            <li><strong className="text-white font-semibold">Current token price.</strong> Today&apos;s price, or whatever exit price you&apos;re modeling.</li>
            <li><strong className="text-white font-semibold">Fee per buy.</strong> Easy to skip and easy to regret. Most centralized exchanges charge 0.1% to 1.5% per spot purchase, and recurring-buy products usually sit at the higher end of that.</li>
          </ol>

          <p className="text-gray-300 text-base leading-8 mb-6">Hit calculate and the output panel populates: total tokens accumulated, your fee-adjusted average cost, the dollar P/L, plus the ROI percentage below.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">If you&apos;re using Binance Auto-Invest or Coinbase&apos;s recurring buys, pull your actual buy log into a spreadsheet and average the executed prices for the simulated buy field. That gets you closer to reality than a guess.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">The dollar cost average formula</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">The simple version:</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Average cost = Total invested ÷ Total tokens accumulated</p>

          <p className="text-gray-300 text-base leading-8 mb-6">The fee-aware version, which is what the calculator actually uses:</p>

          <p className="text-gray-300 text-base leading-8 mb-6">True average cost = (Total invested + Total fees) ÷ Total tokens accumulated</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Worked example. Three weekly buys of $100, with prices of $20, $15, and $30, and a $1 fee on each. You spend $303 total. After the dollar of fee comes off each $100, you buy 4.95, 6.6, and 3.3 tokens, totaling 14.85. True average cost: $303 ÷ 14.85 = $20.40.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Skip the fees and you&apos;d get $20.00 even, which looks cleaner but is wrong by 2%. Over many buys, that 2% becomes the difference between &quot;I&apos;m up&quot; and &quot;I&apos;m break-even.&quot; (The same applies to slippage on lower-liquidity tokens, which has <Link href="/calculators/crypto-slippage-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">its own slippage calculator on this site</Link>.)</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Where DCA actually helps in crypto</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">Two situations make it worth the trouble.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">The first is psychological. Crypto sentiment cycles fast and the temptation to dump on a 30% drop or chase a 30% pump is what eats most retail returns. A schedule removes the decision. You buy on Tuesday because it&apos;s Tuesday, not because the chart looks a certain way. That&apos;s the real edge.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">The second is for assets you genuinely believe in for the long haul. Bitcoin and Ethereum, mostly. Maybe a small basket of L1s. DCA into a token you&apos;d be embarrassed to mention to a friend in three years is just dressed-up gambling on a schedule.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Most exchanges now let you automate this. Binance Auto-Invest and Coinbase&apos;s recurring buys are the two main options, and they work fine, though the fees on automated recurring buys often run higher than a manual market buy. If you want lower fees specifically for Bitcoin, Swan Bitcoin and River are dedicated DCA platforms with cleaner pricing for that one use case. For picking what to actually buy, <Link href="/compare-cryptocurrencies" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">the side-by-side comparison tool on this site</Link> is more useful than reading a Twitter thread.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Where it doesn&apos;t help</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">DCA is not a substitute for asset selection. If the token goes to zero, you&apos;ve just averaged your way into a smaller loss instead of one big one. The execution was disciplined; the bet was wrong.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">It also performs worse than lump-sum investing in straight bull markets. (This part is in basically every DCA article and people still ignore it.) Vanguard&apos;s most recent research, updated in 2023, puts the lump-sum win rate between 61% and 74% across rolling one-year periods, depending on the asset mix. Crypto&apos;s track record is shorter and more chaotic, but the same logic applies. If the asset only goes up while you&apos;re spreading out buys, you&apos;re paying higher average prices than someone who went all-in on day one.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Quick aside: the original &quot;DCA is suboptimal&quot; paper goes back to 1979, George Constantinides writing in the Journal of Financial and Quantitative Analysis. Forty-six years later we&apos;re still having the same argument, mostly because the academic answer (&quot;invest now&quot;) and the human answer (&quot;but what if I lose half of it the next morning&quot;) aren&apos;t really arguing about the same thing. Anyway.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">The short version: DCA buys you sleep, not alpha.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">A few things I&apos;d do differently</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">Pick one schedule and one asset to start. Two weekly DCAs into eight different memecoins is not a strategy, it&apos;s a way to lose track.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Set the calculator to your real fee rate, not a clean number. Coinbase&apos;s recurring-buy fee can run noticeably higher than the 0.1% you might assume from their advanced trade pricing. That gap quietly compounds.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Don&apos;t review your results weekly. The whole point of a schedule is that you stop watching. I check my own DCA spreadsheet quarterly, sometimes less. A friend of mine refuses to look at his for a year at a time, and his returns are objectively better than mine. Make of that what you will.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">If you&apos;re trying to actively time entries with technical analysis, this isn&apos;t your tool. Open TradingView for that. The dollar cost averaging tool on this page is built for people who&apos;ve already decided not to time entries. And once you&apos;ve actually accumulated, <Link href="/calculators/staking-rewards-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">estimating the staking yield on those tokens</Link> is usually the natural next move.</p>

          {/* FAQ Section */}
          <div className="mt-12 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6 leading-tight">Frequently Asked Questions</h2>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">So is &quot;dollar cost averaging&quot; the same thing as &quot;value averaging&quot;?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">No, and the difference matters. DCA buys a fixed dollar amount on a schedule regardless of price. Value averaging targets a fixed portfolio value on a schedule, which means you buy more when prices fall and less (or sell) when prices rise. Value averaging tends to beat DCA in choppy markets but requires more capital flexibility, which is why most retail investors stick with plain DCA in practice.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">How accurate is the calculator if I&apos;m using a recurring-buy product on an exchange?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">It depends on the exchange and the token. For BTC or ETH on a major exchange, the calculator&apos;s output will be within a couple of percent of reality, since execution prices stay close to the displayed market price. For long-tail tokens, expect more drift due to spread, and pull your real buy log if you want the actual number rather than an estimate.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Does the calculator work for stocks or only crypto?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">The math is identical. You can plug any asset&apos;s prices in and get correct outputs. The reason this page is framed for crypto is that fee structures and price volatility differ enough between stocks and crypto that the practical advice diverges. For stocks specifically, MLQ AI and DCAcalculator dot org both have stock-focused tools that handle dividends and split-adjusted prices more cleanly.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">What if I&apos;m DCA&apos;ing into a stablecoin first and bridging into a token later?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">That isn&apos;t really DCA in the technical sense. You&apos;ve separated the dollar-cost step from the actual buy. The calculator still works if you treat each bridge-and-buy event as a single purchase at that day&apos;s price. It just adds a layer of bookkeeping. I&apos;d skip the stablecoin step entirely unless your exchange charges extra for direct fiat-to-token recurring buys.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 border border-gray-700 rounded-xl p-6 bg-gray-800/50">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">
              Disclaimer
            </p>
            <p className="text-gray-400 text-xs leading-6">
              The Dollar Cost Averaging Calculator on this page is provided for informational and educational purposes only. It does not constitute financial, investment, or trading advice. All calculations are estimates based on the inputs you provide and assume fixed prices, fees, and purchase intervals that may not reflect actual market conditions. Real DCA outcomes will vary due to price fluctuations, variable exchange fees, slippage, and execution timing. Cryptocurrency investments involve substantial risk of loss including the potential for total loss of invested capital. Past performance is not indicative of future results. Dollar cost averaging does not guarantee profit or protect against loss in declining markets. Always conduct your own research and consult a qualified financial advisor before making any investment decisions. Blockchain Bubbles is not responsible for any financial losses incurred from use of this calculator or any investment decisions made based on its output.
            </p>
          </div>

        </article>
      </section>
      <RelatedTools
        currentPath="/calculators/dca-calculator"
        showCount={3}
      />
    </>
  )
}
