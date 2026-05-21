'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import RelatedTools from '@/components/RelatedTools'

export default function StakingCalculatorPage() {
  const [initialStake, setInitialStake] = useState('')
  const [currentPrice, setCurrentPrice] = useState('')
  const [annualYield, setAnnualYield] = useState('10')
  const [compoundingFrequency, setCompoundingFrequency] = useState('365')
  const [durationYears, setDurationYears] = useState('1')

  const animationIdRef = useRef(null)
  const bubbleContainerRef = useRef(null)
  const bubbleRef = useRef(null)

  // A = P * (1 + r/n)^(n*t)
  const results = useMemo(() => {
    const stake = parseFloat(initialStake) || 0
    const price = parseFloat(currentPrice) || 0
    const apy = (parseFloat(annualYield) || 0) / 100
    const n = parseFloat(compoundingFrequency) || 365
    const t = parseFloat(durationYears) || 0

    if (stake <= 0 || price <= 0 || t <= 0 || apy <= 0) return null

    const ratePerPeriod = apy / n
    const totalPeriods = n * t
    const finalTokens = stake * Math.pow(1 + ratePerPeriod, totalPeriods)
    const tokensEarned = finalTokens - stake
    const finalUSDValue = finalTokens * price
    const yieldPercent = (tokensEarned / stake) * 100

    return { finalTokens, tokensEarned, finalUSDValue, yieldPercent }
  }, [initialStake, currentPrice, annualYield, compoundingFrequency, durationYears])

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

  const tokenFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 })
  const currFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Calculators', href: '/calculators' },
          { label: 'Staking Rewards Calculator', href: '/calculators/staking-rewards-calculator' }
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
          <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-white mb-3">Staking Rewards Calculator</h1>
          <p className="text-center text-gray-400 mb-12 text-lg">Estimate potential rewards and final yield on your Proof-of-Stake assets.</p>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-green-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">APY &amp; Compounding Estimator</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

              {/* Inputs card */}
              <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6 border border-gray-700">

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Initial Stake (Tokens)</label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={initialStake}
                    onChange={e => setInitialStake(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-green-500 focus:border-green-500 transition duration-150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Current Token Price ($)</label>
                  <input
                    type="number"
                    placeholder="1.50"
                    value={currentPrice}
                    onChange={e => setCurrentPrice(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-green-500 focus:border-green-500 transition duration-150"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Annual Yield (APY %)</label>
                    <input
                      type="number"
                      placeholder="10"
                      step="0.1"
                      value={annualYield}
                      onChange={e => setAnnualYield(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-green-500 focus:border-green-500 transition duration-150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Compounding (Times/Year)</label>
                    <select
                      value={compoundingFrequency}
                      onChange={e => setCompoundingFrequency(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-green-500 focus:border-green-500 transition duration-150 appearance-none"
                    >
                      <option value="1">Annually (1)</option>
                      <option value="12">Monthly (12)</option>
                      <option value="52">Weekly (52)</option>
                      <option value="365">Daily (365)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Duration (Years)</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={durationYears}
                    onChange={e => setDurationYears(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 focus:ring-green-500 focus:border-green-500 transition duration-150"
                  />
                </div>

                <button className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition duration-150 shadow-lg shadow-green-500/30">
                  Calculate Staking Yield
                </button>
              </div>

              {/* Results card */}
              <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-4">Staking Result</h3>

                  <div
                    ref={bubbleContainerRef}
                    className="border border-gray-700"
                    style={{ position: 'relative', height: '200px', overflow: 'hidden', borderRadius: '0.5rem', backgroundColor: '#1f2937', marginBottom: '1rem' }}
                  >
                    {!results ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <p className="text-gray-400 italic text-sm">Enter staking parameters...</p>
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
                          backgroundColor: 'rgba(16,185,129,0.8)',
                          boxShadow: '0 4px 20px rgba(16,185,129,0.5)',
                        }}
                      >
                        <img
                          src="https://placehold.co/32x32/1f2937/FFFFFF?text=$"
                          alt="$"
                          onError={e => { e.target.style.display = 'none' }}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', marginBottom: '0.5rem' }}
                        />
                        <div style={{ fontSize: '1.125rem', fontWeight: '700', lineHeight: '1.2' }}>
                          +{currFmt.format(results.finalUSDValue)}
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>
                          +{results.yieldPercent.toFixed(2)}% YIELD
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-400">Total Tokens Earned</p>
                    <p className="text-lg font-bold text-white">
                      {results ? tokenFmt.format(results.tokensEarned) : '--'}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-400">Final Token Count</p>
                    <p className="text-lg font-bold text-green-400">
                      {results ? tokenFmt.format(results.finalTokens) : '--'}
                    </p>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-2">
                    <p className="text-sm text-gray-400">Final USD Value</p>
                    <p className="text-lg font-bold text-white">
                      {results ? currFmt.format(results.finalUSDValue) : '--'}
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
            "name": "Staking Rewards Calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "url": "https://www.blockchainbubbles.com/calculators/staking-rewards-calculator"
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
                "name": "How are staking rewards calculated?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Two layers worth separating. The first is how staking APY itself is calculated by the network, which varies by chain. Cosmos uses fixed-rate inflation. Solana adjusts based on validator participation. Ethereum's APY drops as more ETH gets staked. That's how the network sets the rate, and it moves constantly as validators join and leave. The second layer is how a specific reward gets calculated from that APY once it's fixed, which is compound interest applied to your balance over time. That's the layer this tool handles. Some people search for a staking rewards calculator. Others use \"profit calculator\" or \"earnings calculator\" as the search term. Same kind of tool either way. Calculating staking rewards is a compound interest problem with extra steps for compounding frequency and token price."
                }
              },
              {
                "@type": "Question",
                "name": "How accurate are the numbers from a staking rewards calculator?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The math is exact. The assumptions aren't. If you plug in 10% APY and the network actually pays 8% over your staking period, the output is wrong by that gap. Calculators are useful for comparing scenarios under fixed assumptions, not for predicting absolute outcomes. Use this one to answer questions like \"is monthly compounding meaningfully better than annual\" rather than \"exactly how much will I have in five years.\""
                }
              },
              {
                "@type": "Question",
                "name": "What's the difference between a staking calculator and a yield farming calculator?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Staking calculators model returns from validating a network: you lock tokens to help secure the chain and earn newly issued rewards in return. Yield farming calculators model returns from providing liquidity to a DeFi protocol, which involves impermanent loss, trading fees, and often complex multi-token reward structures. The math is genuinely different. Don't use one to plan the other."
                }
              },
              {
                "@type": "Question",
                "name": "Should I auto-compound or claim rewards manually?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "It depends on a few things. Gas cost is the big one. Position size is the second. What you'd do with the rewards otherwise is the third. On low-fee networks like Cosmos or Solana, auto-compound is almost always better. On Ethereum L1, the gas cost of compounding can exceed the rewards on small stakes, so manual quarterly claims may make more sense. And if you'd otherwise sell the rewards for dollars, then \"auto-compounding\" isn't compounding anything for you. It's just delaying the sale."
                }
              },
              {
                "@type": "Question",
                "name": "Why are my actual staking rewards lower than the calculator predicted?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Validator commission, mostly. Most validators charge 5-10% of rewards, and the calculator doesn't subtract that automatically. Beyond commission: APY drift downward as more validators join, network upgrades that change emission schedules, time spent unstaked between manual claims, and occasional missed blocks from validator downtime. The gap is rarely massive, but it's almost always there. Treat calculator output as an upper bound, not an expectation."
                }
              },
              {
                "@type": "Question",
                "name": "Is staking better than just holding the token?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Usually, but not always. Staking gives you more tokens, which is great if the price stays flat or rises. But staked tokens are often locked or have unstaking delays, and that lost flexibility can cost more than the rewards earned during a sharp drawdown. For tokens with short unstaking periods (Solana is two to three days) the answer is almost always yes, stake them. For longer locks like Polkadot's 28-day window, it depends on your conviction in the asset and your tolerance for being stuck through a sell-off."
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
                "name": "Staking Rewards Calculator",
                "item": "https://www.blockchainbubbles.com/calculators/staking-rewards-calculator"
              }
            ]
          })
        }}
      />

      {/* Article Section */}
      <section className="bg-gray-900 pb-20 px-4 sm:px-6 lg:px-8">
        <article className="max-w-3xl mx-auto py-12 px-4 md:px-8">

          <h2 className="text-3xl font-bold text-white mt-0 mb-4 leading-tight">Staking Rewards Calculator</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">Estimate potential rewards and final yield on your Proof-of-Stake assets.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">A year of staking can swing your final token count by 10% or more depending on a single setting most people ignore: how often rewards compound. The headline APY is the number platforms advertise. The real return depends on what&apos;s underneath it. This calculator handles that math, but the output only means something if you know what you&apos;re feeding it.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">What staking rewards actually represent</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">When you stake tokens on a Proof-of-Stake network, you&apos;re locking them up to help validate transactions. The protocol pays you in newly issued tokens for keeping the network honest. That&apos;s the short version.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The longer version matters more. Staking yield comes from a few different places: protocol emissions (new tokens minted by the network), transaction fees, plus, in some cases, MEV revenue. Most networks lean heavily on emissions. Heavily as in &quot;almost entirely.&quot;</p>
          <p className="text-gray-300 text-base leading-8 mb-6">This is why the phrase &quot;real yield&quot; started showing up around 2022. Real yield comes from actual fees and MEV, not emissions. If 5% of total supply is being issued as staking rewards each year and you&apos;re earning 5% APY, you&apos;re treading water on percentage of supply owned. You&apos;re earning more tokens, sure. You&apos;re just not gaining ground against everyone else on the network.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">I always check the source of yield before staking. The APY number itself tells you almost nothing. A network paying 50% APY funded entirely by emissions is paying you with diluted future tokens, and you&apos;re going to figure that out the hard way when the price reflects the dilution.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">How to calculate your staking rewards properly</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">The compound interest formula is what&apos;s running under the hood:</p>
          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">Final balance = Initial × (1 + APY/n)^(n × years)</strong></p>
          <p className="text-gray-300 text-base leading-8 mb-6">Where n is the number of compounding periods per year. Daily compounding means n = 365. Monthly is 12. Weekly is 52. Annual is 1.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The reason a calculator is useful, instead of doing this in a spreadsheet, is that you&apos;ll usually want to test multiple scenarios at once. Different durations. Different compounding frequencies. Different token prices on exit. The math is trivial. The combinations are not.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Plug numbers into the staking rewards calculator above and you&apos;ll notice the compounding frequency field changes the output significantly even when APY stays fixed. That&apos;s the part most beginners miss. The next section gets into why.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">One thing the calculator deliberately doesn&apos;t model: variable APY. Real-world staking rates drift up and down as more validators join or leave the network. Solana&apos;s staking APY has moved between roughly 6% and 8% over the past two years. Cosmos has seen wider swings. The calculator assumes a flat rate because that&apos;s the only honest assumption when you&apos;re projecting forward. Just know your actual results will follow a moving average, not a clean line.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">APY vs APR, and why most platforms blur them</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">APR is simple interest. APY includes the effect of compounding. If a platform compounds rewards daily and quotes you 10% APR, your effective APY is closer to 10.52%. Same yield rate, different label.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Some platforms quote APY but actually pay APR (no compounding unless you manually claim and re-stake). Others quote APR but auto-compound, leaving the real APY hidden. The difference between 10% APR with manual weekly claims, vs 10.52% APY with daily auto-compounding, can be a few percentage points over five years. Not nothing.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Stakingrewards.com (the actual site, not the keyword) tracks this carefully across hundreds of networks if you want a cross-reference for any specific asset. They aggregate APR and APY data and show both side by side. Worth bookmarking before you commit capital. We don&apos;t try to compete on the cross-asset database side; this calculator is for modeling your own position once you&apos;ve picked a network.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Quick test for spotting fake APY: if a platform&apos;s calculator shows the same number whether you choose &quot;compound monthly&quot; or &quot;compound daily,&quot; they&apos;re using simple interest under the hood and labeling it APY. Which means the number is APR. Which means whatever they pay you needs to be reinvested manually to compound at all.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Why compounding frequency does most of the work</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">Take 1,000 tokens. 10% APY. Five years.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Annual compounding: 1,610.51 tokens. Monthly: 1,645.31. Weekly: 1,648.06. Daily: 1,648.66. The gap between annual and daily is about 38 tokens, or 3.8% of your starting position.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">Now stretch the timeline. Same parameters, ten years instead of five. Annual: 2,593.74. Daily: 2,718.39. The gap is 124.65 tokens. Almost 12.5% of your starting position, picked up by switching one setting.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">This is the reason auto-compounding matters more than the APY number itself, within reasonable ranges. A platform paying 9% APY with daily auto-compound beats one paying 10% APY where you have to manually claim once a quarter. People reach for the higher headline number and lose returns to friction they never see.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">A few things to check on whatever platform you&apos;re staking with:</p>
          <ul className="list-disc list-inside space-y-2 mb-6 text-gray-300 leading-8">
            <li>Are rewards compounded automatically, or do you need to claim and re-stake?</li>
            <li>If automatic, how often? Daily, weekly, monthly?</li>
            <li>Is there a gas cost or fee for auto-compounding? On some chains the fees eat the benefit.</li>
            <li>Is there a minimum reward threshold before compounding triggers?</li>
          </ul>
          <p className="text-gray-300 text-base leading-8 mb-6">The calculator above lets you model the spread between annual, monthly, weekly, and daily so you can see the gap for your specific position. Smaller stakes won&apos;t see massive differences. Larger ones will.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Token price is the variable nobody wants to model</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">Here&apos;s the part that wrecks most staking math. You can earn an extra 500 tokens over three years and still come out negative if the token&apos;s price drops 70%. The reverse is also true: a modest token yield triples in dollar terms if you happen to time a bull cycle.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">The calculator&apos;s USD field handles this by letting you set a current price. It assumes that price holds. It will not. Crypto prices don&apos;t do steady.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">What the calculator can&apos;t tell you is which direction the token&apos;s headed. For that, you have to look at how the token is moving in the market. The <Link href="/" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50">live bubble chart on the homepage</Link> shows performance and momentum across hundreds of assets at once, which is more useful than the static spreadsheet view exchanges give you. Pair that with the <Link href="/compare-cryptocurrencies" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50">crypto comparison tool</Link> for side-by-side performance history before you commit to locking anything up.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">I&apos;ll be blunt: token price is more important than APY for most stakers. If you stake a 20% APY token that drops 50%, you&apos;ve still lost 40% in dollar terms over the year. Pick the asset right. The yield is a secondary optimization.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">(Worth saying, since people forget: this is part of why Bitcoin, which doesn&apos;t really stake at the protocol level, often outperforms PoS networks on a total-return basis during bull cycles. The base asset matters more than the yield mechanics. Anyway.)</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">The risks the calculator can&apos;t show</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">A staking calculator is a model, not a prediction. Here&apos;s what it deliberately ignores:</p>
          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">Slashing.</strong> If your validator misbehaves or goes offline for too long, a percentage of your stake gets burned by the protocol. Rare but real. Cosmos validators have been slashed for double-signing. Ethereum slashes validators for extended downtime. Pick your validator carefully, or stake to a liquid staking protocol that handles validator selection.</p>
          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">Lock-up periods.</strong> Some networks have a fixed unstaking delay. Polkadot is 28 days. Cosmos is 21. Ethereum&apos;s varies based on the validator queue. During that window your tokens are illiquid. If the price collapses in week two, you can&apos;t exit.</p>
          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">Network changes.</strong> Networks update their tokenomics. The Merge changed Ethereum&apos;s issuance from roughly 4-5% down to under 1% in a single upgrade. Future hard forks could shift rewards either direction. Your APY at the start may not be your APY at the end.</p>
          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">Validator commission.</strong> Most validators take a cut, usually 5-10% of rewards. They can raise it. Watch for stealth commission hikes, especially during bull markets when validators get bolder about it.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">If you&apos;re providing liquidity to a DeFi pool instead of staking, you&apos;re dealing with a different risk profile entirely. The <Link href="/calculators/impermanent-loss-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50">impermanent loss calculator</Link> handles that math; it&apos;s a separate concept from staking and worth understanding before mixing the two strategies.</p>

          <hr className="border-gray-700/50 my-10" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Where this calculator falls short</h2>
          <p className="text-gray-300 text-base leading-8 mb-6">This calculator does one thing and does it cleanly: model compound staking returns under fixed assumptions. It will not:</p>
          <ul className="list-disc list-inside space-y-2 mb-6 text-gray-300 leading-8">
            <li>Predict APY changes over time</li>
            <li>Account for slashing or downtime</li>
            <li>Model token price movement (the USD field is static)</li>
            <li>Calculate after-tax returns</li>
          </ul>
          <p className="text-gray-300 text-base leading-8 mb-6">For tax tracking, Koinly or CoinTracker do the heavy lifting better than any calculator can. Both can pull staking rewards directly from major chains and exchanges and apply your jurisdiction&apos;s rules. Don&apos;t try to compute taxes by hand from this output. You&apos;ll miss something, and the something will be expensive.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">For cross-asset APY research, stakingrewards.com (mentioned earlier) is what most people use to pick a network in the first place. The calculator above is for modeling your specific position, not researching where to put it.</p>
          <p className="text-gray-300 text-base leading-8 mb-6">If you&apos;re accumulating into a staking position over time instead of front-loading the whole stake, pair this with a <Link href="/calculators/dca-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-400/50">DCA strategy</Link>. The two approaches work well together for long-horizon plays where you don&apos;t want to time a single entry.</p>

          <hr className="border-gray-700/50 my-10" />

          {/* FAQ Section */}
          <div className="mt-12 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6 leading-tight">Frequently Asked Questions</h2>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">How are staking rewards calculated?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Two layers worth separating. The first is how staking APY itself is calculated by the network, which varies by chain. Cosmos uses fixed-rate inflation. Solana adjusts based on validator participation. Ethereum&apos;s APY drops as more ETH gets staked. That&apos;s how the network sets the rate, and it moves constantly as validators join and leave.</p>
                <p className="text-gray-300 text-sm leading-7 mt-3">The second layer is how a specific reward gets calculated from that APY once it&apos;s fixed, which is compound interest applied to your balance over time. That&apos;s the layer this tool handles. Some people search for a staking rewards calculator. Others use &quot;profit calculator&quot; or &quot;earnings calculator&quot; as the search term. Same kind of tool either way. Calculating staking rewards is a compound interest problem with extra steps for compounding frequency and token price.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">How accurate are the numbers from a staking rewards calculator?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">The math is exact. The assumptions aren&apos;t. If you plug in 10% APY and the network actually pays 8% over your staking period, the output is wrong by that gap. Calculators are useful for comparing scenarios under fixed assumptions, not for predicting absolute outcomes. Use this one to answer questions like &quot;is monthly compounding meaningfully better than annual&quot; rather than &quot;exactly how much will I have in five years.&quot;</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">What&apos;s the difference between a staking calculator and a yield farming calculator?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Staking calculators model returns from validating a network: you lock tokens to help secure the chain and earn newly issued rewards in return. Yield farming calculators model returns from providing liquidity to a DeFi protocol, which involves impermanent loss, trading fees, and often complex multi-token reward structures. The math is genuinely different. Don&apos;t use one to plan the other.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Should I auto-compound or claim rewards manually?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">It depends on a few things. Gas cost is the big one. Position size is the second. What you&apos;d do with the rewards otherwise is the third. On low-fee networks like Cosmos or Solana, auto-compound is almost always better. On Ethereum L1, the gas cost of compounding can exceed the rewards on small stakes, so manual quarterly claims may make more sense. And if you&apos;d otherwise sell the rewards for dollars, then &quot;auto-compounding&quot; isn&apos;t compounding anything for you. It&apos;s just delaying the sale.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Why are my actual staking rewards lower than the calculator predicted?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Validator commission, mostly. Most validators charge 5-10% of rewards, and the calculator doesn&apos;t subtract that automatically. Beyond commission: APY drift downward as more validators join, network upgrades that change emission schedules, time spent unstaked between manual claims, and occasional missed blocks from validator downtime. The gap is rarely massive, but it&apos;s almost always there. Treat calculator output as an upper bound, not an expectation.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Is staking better than just holding the token?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Usually, but not always. Staking gives you more tokens, which is great if the price stays flat or rises. But staked tokens are often locked or have unstaking delays, and that lost flexibility can cost more than the rewards earned during a sharp drawdown. For tokens with short unstaking periods (Solana is two to three days) the answer is almost always yes, stake them. For longer locks like Polkadot&apos;s 28-day window, it depends on your conviction in the asset and your tolerance for being stuck through a sell-off.</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-700/50 my-10" />

          {/* Financial Disclaimer */}
          <div className="mt-12 border border-gray-700 rounded-xl p-6 bg-gray-800/50">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Disclaimer</p>
            <p className="text-gray-300 text-xs leading-6">The Staking Rewards Calculator on this page is provided for informational and educational purposes only. It does not constitute financial, investment, or staking advice. All calculations are estimates based on fixed APY assumptions and may not reflect actual staking outcomes due to validator commission, APY fluctuations, network upgrades, slashing events, lock-up periods, and token price volatility. Staking cryptocurrency involves substantial risks including but not limited to loss of staked principal through slashing, inability to exit during lock-up periods, and significant token price depreciation. Past staking yields are not indicative of future results. Always conduct your own research and consult a qualified financial advisor before staking any cryptocurrency. Blockchain Bubbles is not responsible for any financial losses incurred from use of this calculator or any staking decisions made based on its output.</p>
          </div>

        </article>
      </section>
      <RelatedTools
        currentPath="/calculators/staking-rewards-calculator"
        showCount={3}
      />
    </>
  )
}
