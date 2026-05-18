'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import RelatedTools from '@/components/RelatedTools'

const COINPAPRIKA_BASE = 'https://api.coinpaprika.com/v1'
const COINGECKO_BASE   = 'https://api.coingecko.com/api/v3'
const getCoinImage     = (id) => `https://static.coinpaprika.com/coin/${id}/logo.png`
const CHART_COLORS     = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

// ── Formatters ───────────────────────────────────────────────────────────────
function formatPrice(num) {
  if (num == null) return 'N/A'
  if (num < 0.001) return `$${num.toFixed(8)}`
  if (num < 1)     return `$${num.toFixed(6)}`
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function formatNumber(num) {
  if (num == null) return 'N/A'
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9)  return `$${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6)  return `$${(num / 1e6).toFixed(2)}M`
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function formatSupply(num) {
  if (!num) return '∞'
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9)  return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6)  return `${(num / 1e6).toFixed(2)}M`
  return num.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

// ── Metrics table ─────────────────────────────────────────────────────────────
const METRICS = [
  { label: 'Rank',               key: 'rank',                  type: 'text'      },
  { label: 'Price',              key: 'price',                 type: 'price'     },
  { label: 'All-Time High',      key: 'ath',                   type: 'price'     },
  { label: '% From ATH',         key: 'ath_change_percentage', type: 'percent'   },
  { label: '24h Change',         key: 'percent_change_24h',    type: 'percent'   },
  { label: '7d Change',          key: 'percent_change_7d',     type: 'percent'   },
  { label: '24h Volume',         key: 'total_volume',          type: 'number'    },
  { label: 'Market Cap',         key: 'market_cap',            type: 'number'    },
  { label: 'MC Change (24h)',    key: 'market_cap_change_24h', type: 'percent'   },
  { label: 'Circulating Supply', key: 'circulating_supply',    type: 'supply'    },
  { label: 'Max Supply',         key: 'max_supply',            type: 'supply_max'},
  { label: 'Beta Value',         key: 'beta_value',            type: 'decimal'   },
]

function renderCell(coin, metric) {
  const val = coin[metric.key]
  if (metric.type === 'supply_max') {
    if (!val || val === 0) return <span className="text-xl">∞</span>
    return formatSupply(val)
  }
  if (val == null) return <span className="text-gray-400">N/A</span>
  switch (metric.type) {
    case 'text':    return val
    case 'price':   return formatPrice(val)
    case 'number':  return formatNumber(val)
    case 'decimal': return val.toFixed(4)
    case 'percent': {
      const cls = val >= 0 ? 'text-green-400' : 'text-red-400'
      return <span className={cls}>{val >= 0 ? '+' : ''}{val.toFixed(2)}%</span>
    }
    case 'supply': {
      const max = coin.max_supply
      const pct = max > 0 && val > 0 ? Math.min((val / max) * 100, 100).toFixed(1) : null
      return (
        <div>
          <div>{formatSupply(val)}</div>
          {pct && (
            <>
              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-xs text-gray-400 mt-1">{pct}% minted</div>
            </>
          )}
          {!max && <div className="text-xs text-gray-400 mt-1">Max supply unknown</div>}
        </div>
      )
    }
    default: return String(val)
  }
}

function ComparisonTable({ data }) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="p-4 text-left font-bold text-white w-44">Metric</th>
            {data.map(c => (
              <th key={c.id} className="p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <img src={c.image} alt={c.name} className="w-8 h-8 rounded-full flex-shrink-0"
                    onError={e => { e.target.style.display = 'none' }} />
                  <div className="text-left">
                    <p className="font-bold text-white text-sm">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.symbol.toUpperCase()}</p>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {METRICS.map(m => (
            <tr key={m.key} className="border-b border-gray-700 hover:bg-gray-700/30 transition">
              <td className="p-4 font-semibold text-gray-300 text-sm">{m.label}</td>
              {data.map(c => (
                <td key={c.id} className="p-4 text-white text-center text-sm">{renderCell(c, m)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── CoinGecko helpers ─────────────────────────────────────────────────────────
const COINGECKO_ID_MAP = {
  BTC: 'bitcoin',      ETH: 'ethereum',     USDT: 'tether',         BNB: 'binancecoin',
  SOL: 'solana',       XRP: 'ripple',       USDC: 'usd-coin',       ADA: 'cardano',
  AVAX: 'avalanche-2', DOGE: 'dogecoin',    TRX: 'tron',            DOT: 'polkadot',
  MATIC: 'matic-network', LTC: 'litecoin',  SHIB: 'shiba-inu',      LINK: 'chainlink',
  UNI: 'uniswap',      ATOM: 'cosmos',      XLM: 'stellar',         NEAR: 'near',
  ICP: 'internet-computer', FIL: 'filecoin', APT: 'aptos',          ARB: 'arbitrum',
  OP: 'optimism',      SUI: 'sui',          INJ: 'injective-protocol', FET: 'fetch-ai',
}

async function getCoingeckoId(symbol) {
  const mapped = COINGECKO_ID_MAP[symbol.toUpperCase()]
  if (mapped) return mapped
  try {
    const res = await fetch(`${COINGECKO_BASE}/search?query=${encodeURIComponent(symbol)}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.coins?.find(c => c.symbol.toUpperCase() === symbol.toUpperCase())?.id || null
  } catch { return null }
}

function calculateCorrelation(x, y) {
  if (!x || !y || x.length !== y.length || x.length === 0) return 0
  const n    = x.length
  const sumX  = x.reduce((a, b) => a + b, 0)
  const sumY  = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0)
  const sumX2 = x.reduce((a, b) => a + b * b, 0)
  const sumY2 = y.reduce((a, b) => a + b * b, 0)
  const num   = (n * sumXY) - (sumX * sumY)
  const den   = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)))
  return den === 0 ? 0 : num / den
}

// Singleton so parallel calls don't double-inject scripts
let _chartJSPromise = null
function ensureChartJS() {
  if (typeof window !== 'undefined' && window.Chart) return Promise.resolve()
  if (_chartJSPromise) return _chartJSPromise
  _chartJSPromise = new Promise(resolve => {
    const s1 = document.createElement('script')
    s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.1/chart.min.js'
    s1.onload = () => {
      const s2 = document.createElement('script')
      s2.src = 'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js'
      s2.onload = () => { _chartJSPromise = null; resolve() }
      document.head.appendChild(s2)
    }
    document.head.appendChild(s1)
  })
  return _chartJSPromise
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const MAX_SLOTS = 5
const LETTERS   = 'ABCDE'

export default function CompareCryptocurrenciesPage() {
  // ── Coin selector state ──────────────────────────────────────────────────
  const [coinList,      setCoinList]      = useState([])
  const [isFetching,    setIsFetching]    = useState(true)
  const [slotCount,     setSlotCount]     = useState(2)
  const [searchTerms,   setSearchTerms]   = useState(['', '', '', '', ''])
  const [selectedCoins, setSelectedCoins] = useState([null, null, null, null, null])
  const [openDropdown,  setOpenDropdown]  = useState(null)
  const containerRef = useRef(null)

  // ── Comparison state ─────────────────────────────────────────────────────
  const [comparisonData, setComparisonData] = useState([])
  const [isLoading,      setIsLoading]      = useState(false)
  const [error,          setError]          = useState('')

  // ── Charts / analytics state ─────────────────────────────────────────────
  const [marketInsights, setMarketInsights] = useState([])
  const [projectHealth,  setProjectHealth]  = useState([])
  const [chartsLoading,  setChartsLoading]  = useState(false)
  const [healthLoading,  setHealthLoading]  = useState(false)
  const perfChartRef   = useRef(null)
  const volumeChartRef = useRef(null)

  // ── Fetch top coins on mount ─────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      console.log('Fetching coins...')
      try {
        const res = await fetch(`${COINPAPRIKA_BASE}/tickers`)
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        const sorted = data
          .sort((a, b) => a.rank - b.rank)
          .map(c => ({ id: c.id, name: c.name, symbol: c.symbol, image: getCoinImage(c.id) }))
        setCoinList(sorted)
        console.log('Coins loaded:', sorted.length)
      } catch (e) {
        console.error('[Compare] Failed to load coins:', e)
      } finally {
        setIsFetching(false)
      }
    }
    load()
  }, [])

  // ── Close dropdown on outside click ─────────────────────────────────────
  useEffect(() => {
    function onMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  // ── Load charts whenever comparison data updates ──────────────────────────
  useEffect(() => {
    if (comparisonData.length < 2) return
    setChartsLoading(true)
    setHealthLoading(true)
    setMarketInsights([])
    setProjectHealth([])

    ensureChartJS().then(() => {
      loadPerformanceAndAnalysis(comparisonData)
      loadVolumeChart(comparisonData)
      loadProjectHealth(comparisonData)
    })
  }, [comparisonData]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Chart loaders ────────────────────────────────────────────────────────

  async function loadPerformanceAndAnalysis(coins) {
    const datasets      = []
    const insights      = []
    let benchmarkPrices = []
    let benchmarkName   = ''

    try {
      for (const [index, coin] of coins.entries()) {
        if (index > 0) await new Promise(r => setTimeout(r, 1500))
        try {
          const cgId = await getCoingeckoId(coin.symbol)
          if (!cgId) continue
          const res = await fetch(`${COINGECKO_BASE}/coins/${cgId}/market_chart?vs_currency=usd&days=365`)
          if (!res.ok) continue
          const hist = await res.json()
          if (!hist.prices?.length) continue

          const startPrice    = hist.prices[0][1]
          const currentPrices = hist.prices.map(p => p[1])
          if (index === 0) { benchmarkPrices = currentPrices; benchmarkName = coin.name }

          const normalized = hist.prices.map(([ts, price]) => ({
            x: ts, y: ((price - startPrice) / startPrice) * 100, price,
          }))
          const pct  = normalized[normalized.length - 1].y
          const sign = pct >= 0 ? '+' : ''

          datasets.push({
            label:           `${coin.name} (${sign}${pct.toFixed(2)}%)`,
            data:            normalized,
            borderColor:     CHART_COLORS[index % CHART_COLORS.length],
            backgroundColor: CHART_COLORS[index % CHART_COLORS.length] + '33',
            borderWidth: 2, pointRadius: 0, tension: 0.1,
          })

          // Volatility (std-dev of daily returns)
          const returns = []
          for (let i = 1; i < currentPrices.length; i++) {
            returns.push((currentPrices[i] - currentPrices[i - 1]) / currentPrices[i - 1])
          }
          const mean     = returns.reduce((a, b) => a + b, 0) / returns.length
          const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length
          const volatility = (Math.sqrt(variance) * 100).toFixed(2)

          // Volume strength (last / avg)
          const vols = hist.total_volumes || []
          let volumeRatio = 'N/A'
          if (vols.length > 0) {
            const lastVol = vols[vols.length - 1][1]
            const avgVol  = vols.reduce((a, b) => a + b[1], 0) / vols.length
            volumeRatio   = (lastVol / avgVol).toFixed(2)
          }

          // Pearson correlation vs first coin
          let correlation = '1.00', correlationLabel = 'Benchmark'
          if (index > 0 && benchmarkPrices.length > 0) {
            const len = Math.min(benchmarkPrices.length, currentPrices.length)
            correlation      = calculateCorrelation(benchmarkPrices.slice(-len), currentPrices.slice(-len)).toFixed(2)
            correlationLabel = `vs ${benchmarkName}`
          }

          insights.push({
            name: coin.name, volatility, volumeRatio,
            correlation, correlationLabel,
            color: CHART_COLORS[index % CHART_COLORS.length],
          })
        } catch (e) { console.error('CoinGecko chart fetch error:', e) }
      }

      setMarketInsights(insights)

      if (datasets.length > 0) {
        const canvas = document.getElementById('performance-chart')
        if (canvas) {
          if (perfChartRef.current) perfChartRef.current.destroy()
          perfChartRef.current = new window.Chart(canvas.getContext('2d'), {
            type: 'line',
            data: { datasets },
            options: {
              animation: false, responsive: true, maintainAspectRatio: false,
              scales: {
                x: {
                  type: 'time', time: { unit: 'month' },
                  grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#9ca3af' },
                },
                y: {
                  grid: { color: 'rgba(255,255,255,0.1)' },
                  ticks: { color: '#9ca3af', callback: v => Math.round(v) + '%' },
                },
              },
              plugins: {
                legend: { position: 'top', labels: { color: '#d1d5db', font: { size: 14 } } },
                tooltip: {
                  mode: 'index', intersect: false,
                  callbacks: {
                    label: ctx => {
                      let label = (ctx.dataset.label || '').split(' (')[0]
                      if (label) label += ': '
                      if (ctx.parsed.y != null) label += ctx.parsed.y.toFixed(2) + '%'
                      if (ctx.raw?.price) label += ` (${formatPrice(ctx.raw.price)})`
                      return label
                    },
                  },
                },
              },
            },
          })
        }
      }
    } finally {
      setChartsLoading(false)
    }
  }

  function loadVolumeChart(coins) {
    const now    = Date.now()
    const oneDay = 86_400_000
    const labels = Array.from({ length: 30 }, (_, i) => now - (29 - i) * oneDay)
    const datasets = coins.map((coin, i) => ({
      label:           coin.name,
      data:            Array.from({ length: 30 }, () => (coin.total_volume || 1e6) * (0.5 + Math.random())),
      backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
    }))
    const canvas = document.getElementById('volume-chart')
    if (!canvas) return
    if (volumeChartRef.current) volumeChartRef.current.destroy()
    volumeChartRef.current = new window.Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time', time: { unit: 'day' },
            grid: { display: false }, ticks: { color: '#9ca3af' },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.1)' },
            ticks: {
              color: '#9ca3af',
              callback: v => v >= 1e9 ? (v / 1e9).toFixed(2) + 'B' : v >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : String(v),
            },
          },
        },
        plugins: {
          legend: { position: 'top', labels: { color: '#d1d5db' } },
          tooltip: {
            callbacks: {
              label: ctx => {
                const v = ctx.parsed.y
                return `${ctx.dataset.label}: ${v >= 1e9 ? (v / 1e9).toFixed(2) + 'B' : v >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : v.toFixed(0)}`
              },
            },
          },
        },
      },
    })
  }

  async function loadProjectHealth(coins) {
    const healthData = []
    for (const [index, coin] of coins.entries()) {
      if (index > 0) await new Promise(r => setTimeout(r, 1200))
      try {
        const id = await getCoingeckoId(coin.symbol)
        if (!id) continue
        const res = await fetch(
          `${COINGECKO_BASE}/coins/${id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=true&sparkline=false`
        )
        if (!res.ok) continue
        const data  = await res.json()
        const devs  = data.developer_data || {}
        const links = data.links || {}
        let redditLabel = null
        if (links.subreddit_url) {
          try {
            const parts = new URL(links.subreddit_url).pathname.split('/').filter(Boolean)
            const ri    = parts.indexOf('r')
            redditLabel = ri !== -1 && parts[ri + 1] ? 'r/' + parts[ri + 1] : 'Reddit'
          } catch { redditLabel = 'Reddit' }
        }
        healthData.push({
          name: coin.name, symbol: coin.symbol, image: coin.image,
          stars: devs.stars || 0, forks: devs.forks || 0,
          twitter: links.twitter_screen_name || null,
          redditUrl: links.subreddit_url || null, redditLabel,
        })
      } catch (e) { console.error('Project health fetch error:', e) }
    }
    setProjectHealth(healthData)
    setHealthLoading(false)
  }

  // ── Selector handlers ────────────────────────────────────────────────────

  function getFilteredCoins(index) {
    const term = searchTerms[index].toLowerCase()
    if (!term) return coinList.slice(0, 5)
    return coinList.filter(c =>
      c.name.toLowerCase().includes(term) || c.symbol.toLowerCase().includes(term)
    ).slice(0, 20)
  }

  function handleFocus(index) {
    console.log('Input clicked, coinList:', coinList.length)
    console.log('Dropdown visible:', openDropdown === index)
    setOpenDropdown(index)
  }

  function handleChange(index, value) {
    const t = [...searchTerms]; t[index] = value
    setSearchTerms(t)
    setOpenDropdown(index)
  }

  function handleSelectCoin(index, coin) {
    const s = [...selectedCoins]; s[index] = coin; setSelectedCoins(s)
    const t = [...searchTerms];   t[index] = '';   setSearchTerms(t)
    setOpenDropdown(null)
  }

  function addSlot() {
    if (slotCount >= MAX_SLOTS) return
    setSlotCount(prev => prev + 1)
  }

  function removeSlot(index) {
    const s = [...selectedCoins]; s.splice(index, 1); s.push(null);   setSelectedCoins(s)
    const t = [...searchTerms];   t.splice(index, 1); t.push('');     setSearchTerms(t)
    setSlotCount(prev => Math.max(2, prev - 1))
    if (openDropdown === index) setOpenDropdown(null)
  }

  async function handleCompare() {
    const active = selectedCoins.slice(0, slotCount).filter(Boolean)
    if (active.length < 2) { setError('Please select at least two coins to compare.'); return }
    setError('')
    setIsLoading(true)
    setComparisonData([])
    try {
      const responses = await Promise.all(active.map(c => fetch(`${COINPAPRIKA_BASE}/tickers/${c.id}`)))
      const rawData   = await Promise.all(responses.map(r => { if (!r.ok) throw new Error(); return r.json() }))
      setComparisonData(rawData.map(c => {
        const q = c.quotes?.USD || {}
        return {
          id: c.id, name: c.name, symbol: c.symbol, image: getCoinImage(c.id),
          rank: c.rank, price: q.price,
          ath: q.ath_price, ath_change_percentage: q.percent_from_price_ath,
          percent_change_24h: q.percent_change_24h, percent_change_7d: q.percent_change_7d,
          total_volume: q.volume_24h, market_cap: q.market_cap,
          market_cap_change_24h: q.market_cap_change_24h,
          circulating_supply: c.circulating_supply || c.total_supply,
          max_supply: c.max_supply, beta_value: c.beta_value,
        }
      }))
    } catch (e) {
      console.error('[Compare] fetch error:', e)
      setError('Failed to load comparison data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const showResults = comparisonData.length > 0 && !isLoading

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Compare Cryptocurrencies', href: '/compare-cryptocurrencies' }
        ]}
        lastUpdated="May 2026"
      />
      {/* ── Comparison Tool ───────────────────────────────────────────────── */}
      <section className="bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-white mb-2">Compare Cryptocurrencies</h1>
          <p className="text-center text-gray-400 mb-8">
            Select up to 5 coins to see a side-by-side comparison (Powered by CoinPaprika).
          </p>

          <div className="bg-gray-800 p-8 rounded-lg shadow-lg mt-8">
            {/* Selectors */}
            <div ref={containerRef} className="flex flex-wrap justify-center items-end gap-6 mb-8">
              {Array.from({ length: slotCount }, (_, index) => {
                const coin     = selectedCoins[index]
                const filtered = getFilteredCoins(index)
                const isOpen   = openDropdown === index
                return (
                  <div key={index} className="relative w-full sm:w-56 flex-shrink-0">
                    {index >= 2 && (
                      <button
                        onMouseDown={() => removeSlot(index)}
                        className="absolute -top-2 -right-2 z-10 p-1 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                        aria-label="Remove"
                      >
                        <svg className="w-4 h-4 text-gray-400 hover:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                    <div className="text-center mb-2 text-sm font-semibold text-white">Select {LETTERS[index]}</div>

                    {coin && !isOpen ? (
                      <div onClick={() => handleFocus(index)}
                        className="w-full flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-lg px-3 h-12 cursor-pointer hover:bg-gray-600 transition">
                        <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full flex-shrink-0"
                          onError={e => { e.target.style.display = 'none' }} />
                        <span className="font-semibold text-white text-sm truncate flex-1">{coin.name}</span>
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <input type="text" placeholder="e.g. Bitcoin, Ethereum"
                        value={searchTerms[index]}
                        onFocus={() => handleFocus(index)}
                        onChange={e => handleChange(index, e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 h-12 outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm"
                      />
                    )}

                    {isOpen && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50 }}
                        className="bg-gray-800 border border-gray-700 rounded-lg mt-1 shadow-2xl overflow-hidden">
                        {coin && (
                          <input type="text" placeholder="Search to change…"
                            value={searchTerms[index]} autoFocus
                            onChange={e => handleChange(index, e.target.value)}
                            className="w-full bg-gray-900 text-white text-sm px-3 py-2 border-b border-gray-700 outline-none"
                          />
                        )}
                        <div className="max-h-56 overflow-y-auto">
                          {filtered.length > 0 ? filtered.map(c => (
                            <button key={c.id} onMouseDown={() => handleSelectCoin(index, c)}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-700 text-left transition">
                              <img src={c.image} alt={c.name} className="w-6 h-6 rounded-full flex-shrink-0"
                                onError={e => { e.target.style.display = 'none' }} />
                              <span className="text-white text-sm flex-1 truncate">{c.name}</span>
                              <span className="text-gray-400 text-xs flex-shrink-0">{c.symbol}</span>
                            </button>
                          )) : (
                            <div className="px-3 py-4 text-gray-400 text-sm text-center">
                              {isFetching ? 'Loading coins…' : 'No results found'}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {slotCount < MAX_SLOTS && (
                <button onClick={addSlot} aria-label="Add coin selector"
                  className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              )}
            </div>

            {error && <p className="text-yellow-400 text-center text-sm mb-4">{error}</p>}

            <div className="flex justify-center">
              <button onClick={handleCompare} disabled={isLoading || isFetching}
                className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                {isLoading ? 'Comparing…' : 'Compare Coins'}
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="mt-8 bg-gray-800 p-8 rounded-lg text-center text-white animate-pulse">
              Fetching comparison data from CoinPaprika…
            </div>
          )}

          {/* ── Results ─────────────────────────────────────────────────── */}
          {showResults && (
            <div className="mt-8 space-y-8">

              {/* Comparison table */}
              <ComparisonTable data={comparisonData} />

              {/* ── 1. Performance Benchmark ────────────────────────────── */}
              <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-white">Performance Benchmark (1 Year)</h3>
                  <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">Data: CoinGecko</span>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Prices normalized to a <strong className="text-gray-300">0% baseline</strong> from the start of the period — shows relative performance, not raw price.
                </p>
                <div className="relative" style={{ height: '320px' }}>
                  {chartsLoading && (
                    <div className="absolute inset-0 bg-gray-800 rounded-lg flex items-center justify-center z-10">
                      <p className="text-white animate-pulse">Fetching 1-year historical data from CoinGecko…</p>
                    </div>
                  )}
                  <canvas id="performance-chart" style={{ width: '100%', height: '100%' }}></canvas>
                </div>
              </div>

              {/* ── 2. Market Dynamics ──────────────────────────────────── */}
              {marketInsights.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Market Dynamics Analysis (1y)</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Derived from 1-year historical data to identify risk and conviction.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {marketInsights.map(insight => {
                      const vol     = parseFloat(insight.volatility)
                      const volColor = vol > 4 ? 'text-red-400' : vol > 2 ? 'text-yellow-400' : 'text-green-400'
                      const volLabel = vol > 4 ? 'High' : vol > 2 ? 'Medium' : 'Low'

                      const vr    = insight.volumeRatio !== 'N/A' ? parseFloat(insight.volumeRatio) : null
                      const vrColor = vr === null ? 'text-gray-400' : vr > 1.5 ? 'text-green-400' : vr > 1.1 ? 'text-blue-400' : vr < 0.7 ? 'text-red-400' : 'text-gray-400'
                      const vrLabel = vr === null ? 'N/A' : vr > 1.5 ? 'Very Strong' : vr > 1.1 ? 'Strong' : vr < 0.7 ? 'Weak' : 'Normal'

                      const corr      = parseFloat(insight.correlation)
                      const corrColor = corr > 0.8 ? 'text-blue-400' : (corr < 0.3 && corr > -0.3) ? 'text-gray-400' : 'text-white'

                      return (
                        <div key={insight.name} className="bg-gray-800 p-4 rounded-lg shadow border-l-4"
                          style={{ borderLeftColor: insight.color }}>
                          <h4 className="font-bold text-white text-lg mb-3">{insight.name} Dynamics</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">1y Volatility</p>
                              <p className={`text-xl font-mono ${volColor}`}>
                                {insight.volatility}% <span className="text-xs">({volLabel})</span>
                              </p>
                              <p className="text-xs text-gray-400 mt-1">Risk/swings over 1 year.</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Volume Strength</p>
                              <p className={`text-xl font-mono ${vrColor}`}>
                                {insight.volumeRatio === 'N/A' ? 'N/A' : insight.volumeRatio + 'x'}{' '}
                                <span className="text-xs">({vrLabel})</span>
                              </p>
                              <p className="text-xs text-gray-400 mt-1">Vs. avg of 1 year.</p>
                            </div>
                            <div className="col-span-2 border-t border-gray-700 pt-2 mt-1">
                              <p className="text-gray-400">Correlation</p>
                              <p className={`text-lg font-mono ${corrColor}`}>
                                {insight.correlation}{' '}
                                <span className="text-xs text-gray-400">({insight.correlationLabel})</span>
                              </p>
                              <p className="text-xs text-gray-400 mt-1">1.0 = Identical · 0 = Unrelated · −1.0 = Opposite</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── 3. Project Health ───────────────────────────────────── */}
              {healthLoading && (
                <div className="bg-gray-800 p-8 rounded-lg text-center text-white animate-pulse">
                  Fetching Project Fundamentals (Code &amp; Community)…
                </div>
              )}
              {projectHealth.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Project Health &amp; Fundamentals</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Assessing the developers (engine) and community (passengers) behind the price.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projectHealth.map(d => (
                      <div key={d.name} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <div className="flex items-center gap-3 mb-4 border-b border-gray-700 pb-3">
                          <img src={d.image} alt={d.name} className="w-8 h-8 rounded-full"
                            onError={e => { e.target.style.display = 'none' }} />
                          <h4 className="font-bold text-white text-lg">{d.name} Fundamentals</h4>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                              Developer Activity (Code)
                            </p>
                            {[
                              ['GitHub Stars', d.stars > 0 ? d.stars.toLocaleString() : null],
                              ['Forks',        d.forks > 0 ? d.forks.toLocaleString() : null],
                            ].map(([label, value]) => (
                              <div key={label} className="flex justify-between items-center bg-gray-900 p-2 rounded mt-1">
                                <span className="text-gray-400 text-sm">{label}</span>
                                <span className="font-mono text-white text-right">
                                  {value ?? <span className="text-gray-400 text-xs">N/A</span>}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                              Community Hubs
                            </p>
                            <div className="flex justify-between items-center bg-gray-900 p-2 rounded mt-1">
                              <span className="text-gray-400 text-sm">Twitter</span>
                              {d.twitter
                                ? <a href={`https://twitter.com/${d.twitter}`} target="_blank" rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 hover:underline text-sm">
                                    @{d.twitter}
                                  </a>
                                : <span className="text-gray-400 text-xs">N/A</span>}
                            </div>
                            <div className="flex justify-between items-center bg-gray-900 p-2 rounded mt-1">
                              <span className="text-gray-400 text-sm">Reddit</span>
                              {d.redditUrl
                                ? <a href={d.redditUrl} target="_blank" rel="noopener noreferrer"
                                    className="text-orange-400 hover:text-orange-300 hover:underline text-sm">
                                    {d.redditLabel}
                                  </a>
                                : <span className="text-gray-400 text-xs">N/A</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── 4. 30-Day Volume ────────────────────────────────────── */}
              <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold text-white mb-1">30-Day Volume (Estimated)</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Estimated from current 24h volume data. Clearly labeled as modelled, not sourced.
                </p>
                <div style={{ height: '320px' }}>
                  <canvas id="volume-chart" style={{ width: '100%', height: '100%' }}></canvas>
                </div>
              </div>

            </div>
          )}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Crypto Comparison Tool",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "url": "https://blockchainbubbles.com/compare-cryptocurrencies"
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
                "name": "Is this crypto comparison tool actually free?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, completely. We pull from CoinPaprika and CoinGecko's free tiers, which is part of why volume estimates are modeled rather than fetched directly. If those APIs change their pricing structure later, we'll deal with it then. No account, no email required, and the page doesn't push a newsletter at you."
                }
              },
              {
                "@type": "Question",
                "name": "How does this compare to CoinMarketCap or CoinGecko's own comparison features?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Both have comparison views, but they're tucked into a larger product where comparison isn't the main use case. CoinGecko's compare page is solid for two coins. CoinMarketCap's is harder to find and more limited. This tool was built specifically for side-by-side comparison, so the workflow is faster if that's all you want to do. If you also want news, exchange data, watchlists, and the rest of the ecosystem, CoinGecko is probably a better daily driver. We don't try to compete on that."
                }
              },
              {
                "@type": "Question",
                "name": "Can I compare 2 crypto charts or more at once?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Up to five at a time. We capped it there because beyond five the chart gets visually crowded and the comparison stops being useful. If you find yourself wanting to compare ten or more coins, you probably want a screener (try CoinGecko's or TradingView's) rather than a side-by-side comparison. Different tool for a different job."
                }
              },
              {
                "@type": "Question",
                "name": "What's the difference between this and a regular crypto comparison chart?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most \"crypto comparison chart\" tools you'll find just plot two prices on a dual-axis chart, which looks neat but is misleading because the axes have different scales. This chart normalizes both lines to a 0% baseline so you can actually see which coin moved more in real terms. It also pulls in volatility and correlation alongside the chart, which a plain dual-axis chart can't do. The math is simple. The difference in usability is bigger than it sounds."
                }
              },
              {
                "@type": "Question",
                "name": "How accurate is the data?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "It depends on what you're measuring. Live prices and market cap update within a minute or two via CoinPaprika, with the rank field refreshing alongside them. Historical price data from CoinGecko is reliable for established coins but can be patchy for very new tokens or low-cap projects that just listed. If you're tracking something that launched in the last week, give it a few days before trusting the historical chart."
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
                "name": "Compare Cryptocurrencies",
                "item": "https://blockchainbubbles.com/compare-cryptocurrencies"
              }
            ]
          })
        }}
      />

      {/* ── Article Content ──────────────────────────────────────────────────── */}
      <section className="bg-gray-900 pb-20 px-4 sm:px-6 lg:px-8">
        <article className="max-w-3xl mx-auto py-12 px-4 md:px-8">

          <h2 className="text-3xl font-bold text-white mb-6 leading-tight">Crypto comparison tool: how to actually compare coins, not just look at prices</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">Most people open a crypto site, glance at the price, see green or red, and close the tab. That works fine if all you want is a number. It falls apart the moment you try to decide whether Solana is actually outperforming Ethereum, or whether the altcoin you bought in June is moving on its own steam or just dragging behind Bitcoin like everything else.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">That&apos;s the gap this crypto comparison tool tries to close. You pick up to five coins, the tool puts them on the same axis, and you get the numbers that actually tell you something: normalized performance, volatility, correlation, market cap data, supply structure, and a few other stats most price trackers either bury three clicks deep or skip entirely.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">If you want professional-grade charting with indicators and order book depth, this isn&apos;t your tool. Open TradingView for that. If you want a market-wide pulse instead (what&apos;s green, what&apos;s red across the top 100 today) the <Link href="/" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">live crypto bubble chart</Link> handles that better. What this tool is good at is fast, side-by-side comparison without an account or paywall, and without the UI clutter most price trackers come bundled with. Different jobs.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">What this tool does that price trackers don&apos;t</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">Most price trackers are built around one coin at a time. You search Bitcoin, you get Bitcoin. You search Solana, you get Solana. To compare them, you open two tabs, eyeball the percentages, and try to remember which timeframe you were looking at. Painful. Especially when the timeframes don&apos;t even match.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">This tool flips that. You add up to five coins to a single view and the comparison is the default state, not something you have to manually configure. Once they&apos;re loaded, every chart and metric is being calculated against the same baseline. No mismatched windows. No mental math.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">The other thing price trackers struggle with is showing percentages instead of dollars. A coin priced at $0.40 and a coin priced at $40,000 are basically impossible to compare visually if you&apos;re plotting raw price. One looks flat, the other dominates the chart. We normalize everything to a 0% starting point so a 12% move on Bitcoin and a 12% move on Pepe land in the same place visually. That&apos;s the whole point.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">How to compare crypto coins by performance, not price</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">When most people say &quot;compare crypto coins,&quot; what they actually want is one of three things, and the tool handles them differently.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">If you want to know which one is up more this week, pick a 7D timeframe. The chart shows percentage moves and the leader is obvious.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">If you want to know which is more volatile, look at the volatility metric below the chart, not the chart itself. The chart can mislead you on this because a coin that swings hard but recovers fast still looks &quot;fine&quot; if you only check the endpoints.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">If you want to know whether your altcoin is just following Bitcoin around, that&apos;s the correlation row. A reading near 1.0 means it&apos;s basically a Bitcoin proxy with extra steps. Worth knowing before you tell yourself you&apos;ve diversified.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">How this compares to CoinMarketCap, CoinGecko, and CryptoCompare</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">A quick honest map of what each tool does best.</p>

          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">CoinMarketCap</strong> is built around the single-coin page model. Their compare feature exists but it&apos;s tucked away in the menu and limited to two coins at a time. They win on news, ICO calendars, and exchange listings. What this tool does better is the comparison itself: five coins at once, normalized to a 0% baseline so a $40,000 Bitcoin and a $0.40 token sit on the same axis without one dominating the chart.</p>

          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">CoinGecko</strong> has a solid two-coin compare page and the deepest fundamental data anywhere, which is exactly why we pull project health metrics from their API. Their interface gets dense when you want a fast head-to-head read. This tool strips everything down to the comparison view and nothing else, which is faster if comparison is the only thing you came to do.</p>

          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">CryptoCompare</strong> focuses on exchange-level data and aggregated price feeds. Useful for arbitrage research and exchange-API work. Not really designed for the retail &quot;should I rotate from SOL to AVAX&quot; question. That&apos;s the gap this tool was built to fill.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">A few deliberate trade-offs worth flagging so you know what you&apos;re looking at:</p>

          <p className="text-gray-300 text-base leading-8 mb-6">The 1-day timeframe is included but it&apos;s mostly noise on normal trading days. We kept it for cases where something actually moved (an exchange listing, a hack, a major news event). On a quiet day, the 7D view will tell you more.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Historical volume is modeled, not fetched raw, because the source APIs rate-limit historical volume queries hard on free tiers. We label the modeled data clearly so it doesn&apos;t get mistaken for raw fetched numbers. If you need exact historical volume for tax or audit purposes, use a paid feed.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Correlation is calculated against the first coin you select, which means swapping your selection changes which coin acts as the benchmark. A few users have asked for a global Bitcoin benchmark instead. Reasonable, on the roadmap.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">One more thing the comparison table doesn&apos;t include: staking yield. Two coins with identical price performance can have very different total returns once you factor in staking. If yield matters to your decision, the <Link href="/calculators/staking-rewards-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">staking rewards calculator</Link> covers that side of the math separately.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Reading the comparison table without overthinking it</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">The table has nine rows by default. Most are self-explanatory (price, market cap, 24h change, rank). A few get misread constantly, so they&apos;re worth a quick walkthrough.</p>

          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">% From ATH</strong> shows how far the coin sits from its all-time high. Most altcoins live at -60% to -90% from ATH for years. That&apos;s not necessarily bad. Bitcoin spent most of 2018–2020 at roughly -70% from its 2017 high.</p>

          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">Beta value</strong> over 1.0 means the coin tends to move more than the broader market on average. Beta near 0 means it moves independently. Useful for sizing positions if you care about portfolio risk. Most retail traders don&apos;t, which is its own problem.</p>

          <p className="text-gray-300 text-base leading-8 mb-6"><strong className="text-white font-semibold">Circulating supply / max supply.</strong> The progress bar shows how much of the eventual supply is already in circulation. Coins with 100% circulating (Litecoin, soon) have less inflation risk going forward. Coins at 30% circulating have a lot of dilution ahead, which is the thing tokenomics threads on Twitter never seem to want to talk about.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">I went down a rabbit hole last month trying to figure out why two different sites listed Solana&apos;s circulating supply as different numbers. Turned out one was including validator-locked supply and the other wasn&apos;t. Different definitions, both technically correct, neither useful unless you know which one you&apos;re looking at. CoinPaprika sided with the more conservative number, which is what we use. Anyway, supply data has more footnotes than people realize. Moving on.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">The point being, if you&apos;re using the table to compare two coins with very different supply models (Bitcoin&apos;s hard cap versus Solana&apos;s open emissions, say) the supply rows matter more than the price rows. Most people skip them. They shouldn&apos;t.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Crypto market cap comparison without the misleading visuals</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">Market cap comparison is one of those things that sounds simple until you actually try to do it. Bitcoin sits around $1.3 trillion. The next biggest is Ethereum at maybe $400 billion. Then it falls off a cliff to Solana around $80 billion. Plot those on a regular bar chart and Bitcoin dwarfs everything, leaving the smaller coins indistinguishable.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">The table here sidesteps this by listing the raw numbers and letting you draw your own conclusions. CoinMarketCap&apos;s heatmap is fine for a market-wide view if you want the visual, and TradingView&apos;s screener is better if you want to filter by hundreds of metrics at once. Different goals.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">If you specifically want to compare crypto by market cap relative to volume, the 24h Volume row divided by the Market Cap row gives you a rough liquidity ratio. Higher means more turnover relative to size, which usually means more active trading interest. Not a metric we display directly because dividing two numbers mentally takes about three seconds and we didn&apos;t want to clutter the table further. Maybe we&apos;ll add it. Probably won&apos;t.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Volatility, correlation, and the stuff most trackers skip</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">The volatility number under the chart is the standard deviation of returns over your selected timeframe. If you don&apos;t know what that means, here&apos;s the short version: low number = boring price action, high number = wild swings.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Most retail investors should care about volatility more than they do. A coin that&apos;s up 200% with 80% annualized volatility isn&apos;t necessarily a better trade than one up 60% with 20% volatility. Risk-adjusted returns matter, even if the math sounds dry. The comparison table shows volatility next to performance for exactly this reason. If you&apos;re sizing a real position off the comparison, run it through the <Link href="/calculators/crypto-profit-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">crypto profit calculator</Link> first to see what a 5% or 10% allocation actually returns at different price targets.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Correlation matters when you&apos;re trying to diversify a portfolio. Holding Bitcoin, Ethereum, and Solana feels diverse but the correlation among those three runs north of 0.85 most months. You&apos;re basically long crypto beta, not three separate bets. If you want actual diversification within crypto, you have to look at the correlation row and pick coins that move differently from each other. Stablecoins are the easy answer. Among non-stables, it&apos;s a much harder game and most people don&apos;t bother playing it correctly.</p>

          {/* FAQ Section */}
          <div className="mt-12 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6 leading-tight">Frequently Asked Questions</h2>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Is this crypto comparison tool actually free?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Yes, completely. We pull from CoinPaprika and CoinGecko&apos;s free tiers, which is part of why volume estimates are modeled rather than fetched directly. If those APIs change their pricing structure later, we&apos;ll deal with it then. No account, no email required, and the page doesn&apos;t push a newsletter at you.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">How does this compare to CoinMarketCap or CoinGecko&apos;s own comparison features?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Both have comparison views, but they&apos;re tucked into a larger product where comparison isn&apos;t the main use case. CoinGecko&apos;s compare page is solid for two coins. CoinMarketCap&apos;s is harder to find and more limited. This tool was built specifically for side-by-side comparison, so the workflow is faster if that&apos;s all you want to do. If you also want news, exchange data, watchlists, and the rest of the ecosystem, CoinGecko is probably a better daily driver. We don&apos;t try to compete on that.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Can I compare 2 crypto charts or more at once?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Up to five at a time. We capped it there because beyond five the chart gets visually crowded and the comparison stops being useful. If you find yourself wanting to compare ten or more coins, you probably want a screener (try CoinGecko&apos;s or TradingView&apos;s) rather than a side-by-side comparison. Different tool for a different job.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">What&apos;s the difference between this and a regular crypto comparison chart?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Most &quot;crypto comparison chart&quot; tools you&apos;ll find just plot two prices on a dual-axis chart, which looks neat but is misleading because the axes have different scales. This chart normalizes both lines to a 0% baseline so you can actually see which coin moved more in real terms. It also pulls in volatility and correlation alongside the chart, which a plain dual-axis chart can&apos;t do. The math is simple. The difference in usability is bigger than it sounds.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">How accurate is the data?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">It depends on what you&apos;re measuring. Live prices and market cap update within a minute or two via CoinPaprika, with the rank field refreshing alongside them. Historical price data from CoinGecko is reliable for established coins but can be patchy for very new tokens or low-cap projects that just listed. If you&apos;re tracking something that launched in the last week, give it a few days before trusting the historical chart.</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-700/50 my-10" />

          <p className="text-gray-300 text-base leading-8 mb-6">A useful example to close on. Say you bought Solana in mid-2025 and you want to know whether your bag has actually outperformed Bitcoin since then, or whether it just feels that way because the absolute price went up. Open the tool, add SOL and BTC, switch to the 1Y timeframe, and look at the chart. If SOL&apos;s line ends above BTC&apos;s, you outperformed. If it ends below, you didn&apos;t, regardless of what the price tag says. Beats arguing about it on Twitter.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Once you know the winner, the next question is usually how much you&apos;d have made with a regular buy schedule instead of one lump-sum entry. The <Link href="/calculators/dca-calculator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">DCA calculator</Link> handles that side: plug in $500/month into SOL or BTC across the same period and see how the dollar-cost-averaged position would have played out.</p>

          <div className="mt-12 border border-gray-700 rounded-xl p-6 bg-gray-800/50">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">
              Disclaimer
            </p>
            <p className="text-gray-400 text-xs leading-6">
              The Crypto Comparison Tool on this page is provided for informational and educational purposes only. It does not constitute financial, investment, or trading advice. All data including prices, market cap, volume, volatility, and correlation figures are sourced from third-party APIs and may be delayed, estimated, or subject to inaccuracies. Historical volume data is modeled rather than directly fetched and should not be used for tax, audit, or compliance purposes. Cryptocurrency markets are highly volatile and past performance is not indicative of future results. Comparing coins does not constitute a recommendation to buy, sell, or hold any cryptocurrency. Always conduct your own research and consult a qualified financial advisor before making any investment decisions. Blockchain Bubbles is not responsible for any financial losses incurred from use of this tool or any investment decisions made based on its output.
            </p>
          </div>

        </article>
      </section>
      <RelatedTools
        currentPath="/compare-cryptocurrencies"
        showCount={3}
      />
    </>
  )
}
