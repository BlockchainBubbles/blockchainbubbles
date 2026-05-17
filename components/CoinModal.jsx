'use client'

import { useEffect, useRef, useState } from 'react'
import { fetchChartData } from '@/lib/api'

const CHANGE_KEYS = {
  '1h':  'price_change_percentage_1h_in_currency',
  '24h': 'price_change_percentage_24h_in_currency',
  '7d':  'price_change_percentage_7d_in_currency',
  '30d': 'price_change_percentage_30d_in_currency',
  '1y':  'price_change_percentage_1y_in_currency',
}

function formatPrice(num) {
  if (!num) return '0.00'
  if (num >= 1) return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return num.toPrecision(4)
}

function formatNumber(num) {
  if (!num || !isFinite(num)) return 'N/A'
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)} T`
  if (num >= 1e9)  return `$${(num / 1e9).toFixed(2)} B`
  if (num >= 1e6)  return `$${(num / 1e6).toFixed(2)} M`
  return `$${num.toLocaleString()}`
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload  = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

export default function CoinModal({
  coin,
  timeframe,
  isOpen,
  onClose,
  favorites,
  onFavoriteToggle,
}) {
  const [chartData,     setChartData]     = useState([])
  const [isLoadingChart, setIsLoadingChart] = useState(false)
  const [chartReady,    setChartReady]    = useState(false)
  const priceChart = useRef(null)
  const canvasRef  = useRef(null)

  // ── Load Chart.js + date adapter from CDN (runs whenever modal opens) ─────
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return
    if (window.Chart) { setChartReady(true); return }

    setChartReady(false)
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.1/chart.min.js')
      .then(() => loadScript('https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js'))
      .then(() => setChartReady(true))
      .catch(err => console.error('Chart.js failed to load:', err))
  }, [isOpen])

  // ── Fetch chart data when modal opens or coin changes ─────────────────────
  useEffect(() => {
    if (!isOpen || !coin) return
    let cancelled = false

    setChartData([])
    setIsLoadingChart(true)

    fetchChartData(coin.id)
      .then(result => { if (!cancelled) setChartData(result.prices ?? []) })
      .catch(()    => { if (!cancelled) setChartData([]) })
      .finally(()  => { if (!cancelled) setIsLoadingChart(false) })

    return () => { cancelled = true }
  }, [coin, isOpen])

  // ── Render Chart.js when data arrives and library is ready ────────────────
  useEffect(() => {
    if (!chartReady || !canvasRef.current || chartData.length === 0) return

    if (priceChart.current) { priceChart.current.destroy(); priceChart.current = null }

    const ctx     = canvasRef.current.getContext('2d')
    const labels  = chartData.map(p => new Date(p[0]))
    const prices  = chartData.map(p => p[1])

    const gradient = ctx.createLinearGradient(0, 0, 0, 160)
    gradient.addColorStop(0, 'rgba(250, 204, 21, 0.2)')
    gradient.addColorStop(1, 'rgba(250, 204, 21, 0)')

    const highLowPlugin = {
      id: 'highLowPlugin',
      afterDraw(chart) {
        const cctx  = chart.ctx
        const data  = chart.data.datasets[0].data
        if (!data.length) return

        const highIdx = data.reduce((mi, v, i) => (v > data[mi] ? i : mi), 0)
        const lowIdx  = data.reduce((mi, v, i) => (v < data[mi] ? i : mi), 0)
        const meta    = chart.getDatasetMeta(0)
        if (!meta.data[highIdx] || !meta.data[lowIdx]) return

        const { left: chartLeft, right: chartRight, bottom: chartBottom } = chart.chartArea

        const blink = Math.abs(Math.sin(Date.now() / 400))
        cctx.save()
        cctx.font = '11px Inter, sans-serif'

        const dot = (x, y, strokeRgb, fillRgb, label, rawLabelY, maxY = chartBottom - 5, rightEdge = chartRight) => {
          // outer blinking ring
          cctx.beginPath()
          cctx.strokeStyle = `rgba(${strokeRgb}, ${blink})`
          cctx.lineWidth = 2
          cctx.arc(x, y, 6, 0, Math.PI * 2)
          cctx.stroke()
          // solid centre
          cctx.beginPath()
          cctx.fillStyle = `rgb(${fillRgb})`
          cctx.arc(x, y, 4, 0, Math.PI * 2)
          cctx.fill()
          // bounds-safe label
          const safeY = Math.max(15, Math.min(maxY, rawLabelY))
          cctx.textAlign = 'left'
          const textWidth = cctx.measureText(label).width
          let labelX = x - textWidth / 2
          if (labelX + textWidth > rightEdge) labelX = rightEdge - textWidth - 5
          if (labelX < chartLeft) labelX = chartLeft + 2
          cctx.fillStyle = 'rgba(255,255,255,0.9)'
          cctx.fillText(label, labelX, safeY)
        }

        const hx = meta.data[highIdx].x, hy = meta.data[highIdx].y
        const lx = meta.data[lowIdx].x,  ly = meta.data[lowIdx].y
        dot(hx, hy, '74,222,128',  '74,222,128',  `$${formatPrice(prices[highIdx])}`, hy - 10)
        dot(lx, ly, '248,113,113', '248,113,113', `$${formatPrice(prices[lowIdx])}`,  ly + 20, chartBottom - 2, chartRight - 60)

        cctx.restore()
      },
    }

    priceChart.current = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Price (USD)',
          data: prices,
          borderColor: '#fbbf24',
          borderWidth: 2,
          fill: true,
          backgroundColor: gradient,
          tension: 0.4,
          pointRadius: 0,
        }],
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 20, right: 60, bottom: 25, left: 10 },
        },
        scales: {
          x: {
            type: 'time',
            time: { unit: 'hour', tooltipFormat: 'MMM d, h:mm a' },
            grid:  { color: 'rgba(255,255,255,0.08)' },
            ticks: { color: '#9ca3af', maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
          },
          y: {
            position: 'right',
            grid:  { color: 'rgba(255,255,255,0.08)' },
            ticks: { color: '#9ca3af', callback: v => formatPrice(v) },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: { label: c => `Price: $${formatPrice(c.parsed.y)}` },
          },
        },
      },
      plugins: [highLowPlugin],
    })

    return () => {
      if (priceChart.current) { priceChart.current.destroy(); priceChart.current = null }
    }
  }, [chartData, chartReady])

  // ── Close on Escape ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen || !coin) return null

  const changeKey  = CHANGE_KEYS[timeframe] ?? CHANGE_KEYS['24h']
  const change     = coin[changeKey] ?? coin.price_change_percentage_24h ?? 0
  const isPositive = change >= 0
  const isFav      = favorites.includes(coin.id)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-[99]"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-full max-w-3xl px-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6 md:p-8">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <img
                src={coin.image}
                alt={`${coin.name} icon`}
                className="w-10 h-10 rounded-full"
                onError={e => { e.target.style.display = 'none' }}
              />
              <div>
                <h2 className="text-xl font-bold text-white leading-tight">{coin.name}</h2>
                <p className="text-sm text-gray-400">{coin.symbol?.toUpperCase()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Favorite toggle */}
              <button
                onClick={() => onFavoriteToggle(coin.id)}
                aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                className="text-gray-400 hover:text-yellow-400 transition"
              >
                {isFav ? (
                  <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                )}
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-700/50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Price</p>
              <p className="text-sm font-semibold text-white">${formatPrice(coin.current_price)}</p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Change ({timeframe})</p>
              <p className={`text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{change.toFixed(2)}%
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Market Cap</p>
              <p className="text-sm font-semibold text-white">{formatNumber(coin.market_cap)}</p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">24h Volume</p>
              <p className="text-sm font-semibold text-white">{formatNumber(coin.total_volume)}</p>
            </div>
          </div>

          {/* ── Chart ── */}
          <div className="relative h-64 rounded-xl overflow-hidden">
            {isLoadingChart && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 z-10">
                <div className="w-8 h-8 rounded-full border-4 border-gray-600 border-t-blue-500 animate-spin" />
              </div>
            )}
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>

        </div>
      </div>
    </>
  )
}
