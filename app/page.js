'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import BubbleChart from '@/components/BubbleChart'
import CoinModal from '@/components/CoinModal'
import { useStore } from '@/lib/store'

function BubbleChartSkeleton() {
  return (
    <div className="relative w-full bg-gray-900" style={{ height: '85vh' }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="relative w-full h-full overflow-hidden">
          {[
            {w:120,h:120,l:10,t:20},
            {w:90,h:90,l:25,t:45},
            {w:150,h:150,l:40,t:15},
            {w:80,h:80,l:60,t:50},
            {w:110,h:110,l:75,t:25},
            {w:70,h:70,l:15,t:65},
            {w:100,h:100,l:50,t:65},
            {w:85,h:85,l:85,t:55},
            {w:130,h:130,l:30,t:35},
            {w:75,h:75,l:70,t:70},
          ].map((bubble, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gray-700/50 animate-pulse"
              style={{
                width: bubble.w,
                height: bubble.h,
                left: `${bubble.l}%`,
                top: `${bubble.t}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1.5s',
              }}
            />
          ))}
        </div>
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3">
          <p className="text-gray-500 text-sm">Loading crypto market data...</p>
          <div className="flex gap-2">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  // ── Global state comes from the store (FilterModal & SettingsModal write here) ──
  const {
    currentMode,
    coingeckoPage,
    currentCategoryId,
    currentTimeframe,
    bubbleSizeMetric,
    favorites,
    toggleFavorite,
    selectedCoin,
    setSelectedCoin,
  } = useStore()

  // ── Local modal visibility ────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Open modal whenever selectedCoin is set (e.g. via navbar search)
  useEffect(() => {
    if (selectedCoin) setIsModalOpen(true)
  }, [selectedCoin])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleBubbleClick = useCallback((coin) => {
    setSelectedCoin(coin)
    setIsModalOpen(true)
  }, [setSelectedCoin])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    setSelectedCoin(null)
  }, [setSelectedCoin])

  const handleFavoriteToggle = useCallback((coinId) => {
    toggleFavorite(coinId)
  }, [toggleFavorite])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Live bubble chart — full width, 85 vh */}
      <Suspense fallback={<BubbleChartSkeleton />}>
        <BubbleChart
          mode={currentMode}
          rankingPage={coingeckoPage}
          categoryId={currentCategoryId}
          timeframe={currentTimeframe}
          bubbleSizeMetric={bubbleSizeMetric}
          favorites={favorites}
          onBubbleClick={handleBubbleClick}
        />
      </Suspense>

      {/* Coin detail modal — rendered at page level so z-index sits above chart */}
      <CoinModal
        coin={selectedCoin}
        timeframe={currentTimeframe}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        favorites={favorites}
        onFavoriteToggle={handleFavoriteToggle}
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
                "name": "What is crypto bubbles live and how does it work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "It's a real-time visualization of the cryptocurrency market where every coin shows up as a floating bubble whose size and color update as prices change. Green means up, red means down, and the size depends on which mode you've picked (performance, market cap, or 24-hour volume). Data refreshes every three minutes from CoinGecko's API, so the chart always reflects roughly current market conditions without you needing to reload anything."
                }
              },
              {
                "@type": "Question",
                "name": "What's the difference between a crypto bubble map and a crypto heatmap?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A heatmap is usually a static grid of colored rectangles where color shows price change strength. A bubble map is animated, with circles whose size carries information in addition to color. Blockchain Bubbles combines both ideas, so you get the spatial layout of a map plus the color intensity of a heatmap in one view. If you want a strict heatmap-style grid, CoinMarketCap has one. If you want the animated bubble version, you're already on it."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use this as an altcoin bubble chart specifically?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, that's actually one of the more useful workflows. Set the rank filter to something like 101-500 and you isolate altcoins that get drowned out by Bitcoin and Ethereum on the default view. You can also stack a category filter on top, so for example \"AI tokens, ranks 101-300\" gives you a clean view of mid-cap AI projects. This is genuinely hard to do in any other tool without building a custom watchlist."
                }
              },
              {
                "@type": "Question",
                "name": "How many coins are tracked and where does the data come from?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "About 1000+ in total, sourced from CoinGecko's main listings. CoinGecko is one of the more trusted price aggregators in the space, and most of the comparable tools out there use the same source. The downside is that very new tokens (less than a few weeks old) sometimes don't show up immediately because they haven't been indexed by CoinGecko yet. If you're hunting brand-new launches, this isn't the right tool."
                }
              },
              {
                "@type": "Question",
                "name": "Is there an account, signup, or any cost?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No to all three. Open the site and everything works. There isn't a premium tier hidden somewhere with extra features. The site is free because it costs almost nothing to run on top of the CoinGecko API, and we'd rather have more people using it than try to monetize a small audience."
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
              }
            ]
          })
        }}
      />

      {/* ── SEO article content ── */}
      <section className="bg-gray-900 pb-20 px-4 sm:px-6 lg:px-8">
        <article className="max-w-3xl mx-auto py-12 px-4 md:px-8">

          <h2 className="text-3xl font-bold text-white mb-6 leading-tight">Crypto bubbles live: read the whole market in one glance</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">Most price trackers throw a wall of numbers at you and expect you to figure it out. A bubble chart works the opposite way. Every coin shows up as a circle floating on the page, and the circles change size and color as prices move. Glance at the screen and you already know whether the market is up, down, or having one of those weird mixed days where Bitcoin is flat but altcoins are doing something interesting.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Blockchain Bubbles tracks more than a thousand cryptocurrencies this way. The whole tool is free and there&apos;s no signup. Data comes from CoinGecko (which is what most price trackers use under the hood) and the chart refreshes every three minutes.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">One thing to clear up before going further. A &quot;bubble&quot; in this context has nothing to do with the financial idea of a market bubble bursting. It&apos;s just the shape of the visualization. Each coin is literally a circle on your screen. That&apos;s it. Nobody is predicting crashes here.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Why a chart works better than a list</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">Open a sortable table of 500 coins and your brain has real work to do. You read each row, compare numbers across columns, scroll, scroll some more, and try to remember what you saw three rows back. By the time you&apos;ve taken in the top 20, you&apos;ve forgotten whatever was happening at rank 200.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">A crypto bubble chart skips most of that work. Bitcoin is the biggest circle because it has the biggest market cap. Ethereum sits next to it, slightly smaller. After those two, the size differences get steep fast, which honestly does a better job of showing real market dominance than any &quot;BTC dominance: 58%&quot; stat. The smaller altcoins cluster around the giants, and you can see the structure of the market in about a second.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Color does the rest. Green means the coin is up over whatever timeframe you&apos;ve set. Red means it&apos;s down. Bright neon green on a coin like Solana usually means something interesting happened that day, maybe up 10 to 20 percent. A pale washed-out green is barely a move. The same logic runs in reverse for red.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">If you want to do precise technical analysis on a single coin, this isn&apos;t your tool. Open TradingView for that. The bubble view is for the panoramic shot, not the close-up. But if you&apos;re trying to keep tabs on the broader market while you do other things, or you want to spot which sector is leading on a given day, the chart wins easily.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">How size actually works</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">There are three ways to set what bubble size represents, and the choice changes the whole feel of the chart.</p>

          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">Performance mode</strong> is the default. Bubble size reflects price change percentage over your selected timeframe. Whatever&apos;s moving the most that day, up or down, takes up the most space. A small-cap coin that pumped 40 percent will look bigger than Bitcoin in this view, which is the point. You&apos;re seeing momentum, not market cap.</p>

          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">Market cap mode</strong> sizes bubbles by total market value. This is the most &quot;honest&quot; view in the sense that it shows you actual scale. Bitcoin dominates everything. Ethereum is a clear second. After that, the gap to Solana, BNB, and XRP is bigger than people realize until they see it visually. Meme coins shrink down to dots. This is the mode I keep open when something is being hyped on Twitter and I want a reality check.</p>

          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">24h volume mode</strong> sizes bubbles by trading activity. Sometimes Bitcoin still leads because it&apos;s Bitcoin, but on memecoin-frenzy days you&apos;ll see something like DOGE or PEPE balloon up because that&apos;s where actual money is moving. Volume mode is the closest thing to a &quot;where is the action right now&quot; view.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">You switch modes from a settings panel and the chart redraws on the spot. Toggling between performance and market cap is genuinely useful, since one shows you what&apos;s moving and the other shows you whether the thing that&apos;s moving actually matters at scale.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Where crypto heatmap bubbles fit in</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">People use &quot;bubble chart&quot; and &quot;heatmap&quot; interchangeably and they shouldn&apos;t. A heatmap is usually a static grid of colored rectangles where the color shows the strength of a price move. Heatmaps are great for instantly reading sentiment but they feel a bit dead. Nothing moves; you&apos;re just looking at colored boxes. CoinMarketCap has one of these and it&apos;s perfectly fine for what it does.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">A bubble chart is animated. The circles bounce, drift around, and push into each other with physics-based motion. You can drag them. Size carries information that a heatmap doesn&apos;t show as well, because in a heatmap everything is the same shape and only color varies.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Blockchain Bubbles uses both ideas at once. You get the moving, draggable bubbles of a real bubble chart, plus the color intensity logic of a heatmap. A coin up 2 percent is faintly green. A coin up 18 percent is glowing. That combination is what makes the chart pleasant to keep open in a tab while you work, instead of feeling like another dashboard.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">If you want a strict heatmap (the static grid kind), there are other tools that do that. Some traders prefer it because it&apos;s more compact. I find the bubble version easier to read at a glance, but that&apos;s a preference, not a fact.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Reading market mood in two seconds</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">The fastest way to use the chart is also the dumbest one, and that&apos;s a compliment. You don&apos;t need to read anything. You don&apos;t even need to think. You just look at the colors.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Mostly green screen? Bullish day, money flowing in, traders feeling fine. Mostly red? Something&apos;s wrong, people are selling, and you should probably check the news before you do anything stupid. Mixed colors with red Bitcoin and a few green clusters means sector rotation is happening, and that&apos;s where the chart actually gets interesting.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Sector rotations are the thing lists hide and bubble charts surface. When DeFi tokens start glowing green while everything else is flat or red, that&apos;s a signal worth noticing. Same with AI coins, or RWA, or whatever narrative is currently in favor. On a list of 500 coins sorted by market cap, you&apos;d never notice the cluster effect. On the bubble map it&apos;s obvious because the green coins literally cluster on screen when you filter by category.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Quick aside on this. Watching sector rotations on a bubble chart feels a bit like watching weather radar. You see the storm cell forming before the news report mentions it, and there&apos;s something satisfying about that even when nothing actionable comes out of it. Anyway.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">A specific example of what this looks like. During the FTX collapse in November 2022, the entire crypto market went deep red over a couple of days. If you&apos;d had a bubble tool open during that window, you&apos;d have seen the whole screen turn into a sea of red bubbles, with the contagion radiating out from FTT to every major altcoin. Blockchain Bubbles didn&apos;t exist back then, but the pattern repeats every time the market has a serious risk-off event.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">The altcoin bubble chart filters that actually matter</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">Nine sector filters live above the chart: Layer 1, Layer 2, DeFi, GameFi, AI, Meme Coins, RWA, Oracles, and DEX tokens. Click one and the chart redraws with only coins in that category.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">This is where the tool starts being genuinely useful, not just decorative. Layer 1 brings up Solana, Avalanche, Cardano, Sui, and the other smart contract chains, so you can compare them directly without Bitcoin&apos;s giant bubble drowning everything else. DeFi pulls Ethereum-based protocols and lending tokens. Oracles is mostly Chainlink plus a handful of smaller competitors. Meme Coins is exactly what it sounds like, and that filter gets a lot of action when retail is in a mood.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">The ranking filter is the other useful one. You can show only the top 100, or 101 to 200, or 201 to 500, or all the way down to 901 to 1000. The point of the lower ranges is to give smaller altcoins room to breathe. If you only ever look at the top 100, you miss what&apos;s happening among smaller projects. Some of the most interesting moves happen in the 200 to 500 range.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Combining filters works too. Set the category to AI and the rank range to 101-500 and you get a clean view of mid-cap AI tokens specifically. That&apos;s a slice of the market that&apos;s basically impossible to scan any other way without building your own watchlist from scratch.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Where the crypto bubble map is most useful (and where it isn&apos;t)</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">The chart is at its best for two situations. The first is when you want a quick read on overall market mood without committing time to it. Five seconds with the chart tells you more than ten minutes of scrolling Twitter. The second is when you&apos;re trying to spot sector rotations or unusual single-coin moves. The visual cluster effect catches things you&apos;d miss in numerical data.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">It&apos;s not as useful when you&apos;re doing serious analysis on one specific coin. The detail panel that opens when you click a bubble has the basics (price chart, market cap, volume, percentage change) but it isn&apos;t a replacement for a real charting tool. If you want indicators, drawing tools, or multi-timeframe analysis, you need TradingView or your exchange&apos;s chart.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">It&apos;s also less useful in extremely flat markets. When everything is up or down half a percent, the chart looks like a wash of pale color and there isn&apos;t much signal in it. On those days you might as well close the tab and check back later.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Using it day to day</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">The interface is minimal, so a quick walkthrough covers everything you need.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">When the page loads you get the default view, which is the top 100 coins by market cap, performance mode, 24-hour timeframe. Take a few seconds to look at the overall colors before you start filtering. That gives you the baseline read of the day before you go hunting for specifics.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Click any bubble to open a side panel with that coin&apos;s price chart, current price, market cap, 24-hour volume, and percentage change. Click the star icon in the panel to save it as a favorite, and favorites get a subtle gold border on the main view so they&apos;re easy to track over time.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">The search bar in the top right finds any coin by name or ticker. Typing &quot;sol&quot; pulls up Solana, &quot;doge&quot; pulls up Dogecoin, and so on. Useful when you have something specific in mind and don&apos;t want to scan visually.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Timeframe buttons (1h, 24h, 7d, 30d, 1y) sit in the controls and redraw the chart based on whichever period you pick. The 1-hour view is mostly noise unless you&apos;re scalping. The 24-hour and 7-day views are the ones I actually use. The 30-day and 1-year views are good for spotting longer trends but they hide what&apos;s happening right now.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Plugging into actual trading decisions</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">Spotting an interesting move on the chart is the easy part. The number-crunching is the part most people skip and shouldn&apos;t.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Say you see a coin glowing bright green and you want to plan a trade. The <Link href="/calculators/crypto-profit-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">crypto profit calculator</Link> takes your entry price, target price, and position size, and gives you the profit, ROI, and break-even back. If you&apos;re trading with leverage, the futures calculator handles position sizing, liquidation prices, and margin requirements, which is the math you do not want to mess up. There&apos;s also a <Link href="/calculators/staking-rewards-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">staking rewards calculator</Link> for longer-term plays, plus a <Link href="/compare-cryptocurrencies" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">compare cryptocurrencies</Link> tool that puts two coins side by side on price, market cap, volume, supply, and a few other stats.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">The calculators are basic, deliberately. They aren&apos;t trying to replace a portfolio tracker or a tax tool. They cover the math you&apos;d otherwise do in your head or in a spreadsheet, faster.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Why this is free</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">People ask about the business model a lot, so quickly. There isn&apos;t a premium tier hidden somewhere. We don&apos;t run ads on the page. We don&apos;t sell user data because we don&apos;t collect any (no signup means there&apos;s nothing to sell). The site costs almost nothing to run because the data flows from CoinGecko&apos;s API and the front-end is just rendering it.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">If you want to support the project, the most useful thing is to send the link to someone who&apos;d find it useful. That&apos;s it.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">The site works on phones and desktop. The bubbles scale down for smaller screens, filters stay accessible, and you can pinch-zoom on a cluster if you want to read the smaller coins. The mobile experience is a little tighter than desktop because you have less space, but it&apos;s the same chart.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">FAQ</h2>

          <h3 className="text-xl font-semibold text-white mt-8 mb-3">What is crypto bubbles live and how does it work?</h3>

          <p className="text-gray-300 text-base leading-8 mb-6">It&apos;s a real-time visualization of the cryptocurrency market where every coin shows up as a floating bubble whose size and color update as prices change. Green means up, red means down, and the size depends on which mode you&apos;ve picked (performance, market cap, or 24-hour volume). Data refreshes every three minutes from CoinGecko&apos;s API, so the chart always reflects roughly current market conditions without you needing to reload anything.</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-3">What&apos;s the difference between a crypto bubble map and a crypto heatmap?</h3>

          <p className="text-gray-300 text-base leading-8 mb-6">A heatmap is usually a static grid of colored rectangles where color shows price change strength. A bubble map is animated, with circles whose size carries information in addition to color. Blockchain Bubbles combines both ideas, so you get the spatial layout of a map plus the color intensity of a heatmap in one view. If you want a strict heatmap-style grid, CoinMarketCap has one. If you want the animated bubble version, you&apos;re already on it.</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-3">Can I use this as an altcoin bubble chart specifically?</h3>

          <p className="text-gray-300 text-base leading-8 mb-6">Yes, that&apos;s actually one of the more useful workflows. Set the rank filter to something like 101-500 and you isolate altcoins that get drowned out by Bitcoin and Ethereum on the default view. You can also stack a category filter on top, so for example &quot;AI tokens, ranks 101-300&quot; gives you a clean view of mid-cap AI projects. This is genuinely hard to do in any other tool without building a custom watchlist.</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-3">How many coins are tracked and where does the data come from?</h3>

          <p className="text-gray-300 text-base leading-8 mb-6">About 1000+ in total, sourced from CoinGecko&apos;s main listings. CoinGecko is one of the more trusted price aggregators in the space, and most of the comparable tools out there use the same source. The downside is that very new tokens (less than a few weeks old) sometimes don&apos;t show up immediately because they haven&apos;t been indexed by CoinGecko yet. If you&apos;re hunting brand-new launches, this isn&apos;t the right tool.</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-3">Is there an account, signup, or any cost?</h3>

          <p className="text-gray-300 text-base leading-8 mb-6">No to all three. Open the site and everything works. There isn&apos;t a premium tier hidden somewhere with extra features. The site is free because it costs almost nothing to run on top of the CoinGecko API, and we&apos;d rather have more people using it than try to monetize a small audience.</p>

          <div className="mt-12 border border-gray-700 rounded-xl p-6 bg-gray-800/50">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">
              Disclaimer
            </p>
            <p className="text-gray-400 text-xs leading-6">
              Blockchain Bubbles is a free cryptocurrency market visualization tool provided for informational and educational purposes only. It does not constitute financial, investment, or trading advice. All price data, market cap figures, and percentage changes are sourced from third-party APIs including CoinGecko and may be delayed by up to several minutes. Data accuracy cannot be guaranteed and should not be relied upon for time-sensitive trading decisions. Cryptocurrency markets are highly volatile and involve substantial risk of loss. Past market performance shown in the visualization is not indicative of future results. Nothing on this page should be interpreted as a recommendation to buy, sell, or hold any cryptocurrency. Always conduct your own research and consult a qualified financial advisor before making any investment decisions. Blockchain Bubbles is not responsible for any financial losses incurred from use of this tool or any investment decisions made based on its output.
            </p>
          </div>

        </article>
      </section>
    </>
  )
}
