'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Bubble, checkCollisions, getChangeKey, getSizeKey } from '@/lib/bubbleUtils'
import { fetchCoingeckoPage, fetchCoingeckoCategory, fetchFavorites, RateLimitError } from '@/lib/api'
import { useStore } from '@/lib/store'

export default function BubbleChart({
  mode             = 'ranking',
  rankingPage      = 1,
  categoryId       = null,
  timeframe        = '1h',
  bubbleSizeMetric = 'performance',
  favorites        = [],
  onBubbleClick,
}) {
  const { setMarketTrend, setPreloadedCoins, searchQuery } = useStore()

  const containerRef      = useRef(null)
  const bubblesRef        = useRef([])
  const animationRef      = useRef(null)
  const lastFrameTimeRef  = useRef(0)
  const progressRef       = useRef(null)
  const isFetchingRef      = useRef(false)
  const isFirstRenderRef   = useRef(true)
  const fetchDataRef       = useRef(null)
  const createBubblesRef   = useRef(null)
  const lastFetchedDataRef = useRef([])
  const rateLimitTimerRef  = useRef(null)

  const [isLoading,     setIsLoading]     = useState(true)
  const [progressColor, setProgressColor] = useState('#3b82f6')
  const [rateLimitWait, setRateLimitWait] = useState(0)

  // ── Animation loop ──────────────────────────────────────────────────────────
  const animate = useCallback((timestamp) => {
    animationRef.current = requestAnimationFrame(animate)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const interval = isMobile ? 1000 / 30 : 1000 / 60
    const delta = timestamp - lastFrameTimeRef.current
    if (delta < interval) return
    lastFrameTimeRef.current = timestamp - (delta % interval)
    bubblesRef.current.forEach(b => b.updatePosition())
    checkCollisions(bubblesRef.current)
  }, [])

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])

  // ── Progress bar ────────────────────────────────────────────────────────────
  const resetProgressBar = useCallback(() => {
    const bar = progressRef.current
    if (!bar) return
    bar.style.transition = 'none'
    bar.style.width = '100%'
    void bar.offsetWidth
    bar.style.transition = 'width 180s linear'
    bar.style.width = '0%'
  }, [])

  // ── Build bubbles from coin data ────────────────────────────────────────────
  const createBubbles = useCallback((data) => {
    if (!containerRef.current) return

    stopAnimation()
    containerRef.current.innerHTML = ''
    bubblesRef.current = []

    const changeKey = getChangeKey(timeframe)
    const sizeKey   = getSizeKey(bubbleSizeMetric, changeKey)

    // Inject 24h fallback so coins missing chosen-timeframe data are never dropped
    const coinsWithFallback = data
      .filter(c => c != null)
      .map(c => ({
        ...c,
        [changeKey]:
          c[changeKey] ??
          c.price_change_percentage_24h_in_currency ??
          c.price_change_percentage_24h ??
          0,
      }))

    if (coinsWithFallback.length === 0) return

    console.log(`[BubbleChart] rendering ${coinsWithFallback.length} bubbles | mode=${mode} tf=${timeframe}`)

    const maxValue = Math.max(...coinsWithFallback.map(c => Math.abs(c[sizeKey] ?? 0)))

    coinsWithFallback.forEach((coin, index) => {
      const bubble = new Bubble(
        coin,
        maxValue,
        sizeKey,
        changeKey,
        containerRef.current,
        favorites,
        onBubbleClick ?? (() => {}),
        index,
      )
      bubblesRef.current.push(bubble)
    })

    if (bubblesRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(animate)
    }

    // Market sentiment
    const positiveCount = coinsWithFallback.filter(c => (c[changeKey] ?? 0) > 0).length
    const negativeCount = coinsWithFallback.filter(c => (c[changeKey] ?? 0) < 0).length
    if (positiveCount > negativeCount) {
      setMarketTrend('bullish')
      setProgressColor('#22c55e')
    } else if (negativeCount > positiveCount) {
      setMarketTrend('bearish')
      setProgressColor('#ef4444')
    } else {
      setMarketTrend('neutral')
      setProgressColor('#3b82f6')
    }

    setPreloadedCoins(coinsWithFallback.slice(0, 10))
  }, [timeframe, bubbleSizeMetric, favorites, onBubbleClick, animate, stopAnimation, mode, setMarketTrend, setPreloadedCoins])

  // ── Fetch coin data ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    setIsLoading(true)
    try {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
      let data = []
      if (mode === 'category' && categoryId) {
        data = await fetchCoingeckoCategory(categoryId, timeframe)
      } else if (mode === 'favorites') {
        data = await fetchFavorites(favorites)
      } else {
        const raw = await fetchCoingeckoPage(rankingPage, timeframe)
        data = isMobile ? raw.slice(0, 50) : raw
      }
      console.log(`[BubbleChart] fetched ${data.length} coins`)
      lastFetchedDataRef.current = data
      createBubbles(data)
      resetProgressBar()
    } catch (err) {
      if (err instanceof RateLimitError) {
        setRateLimitWait(err.waitSeconds)
        clearInterval(rateLimitTimerRef.current)
        rateLimitTimerRef.current = setInterval(() => {
          setRateLimitWait(prev => {
            if (prev <= 1) {
              clearInterval(rateLimitTimerRef.current)
              fetchDataRef.current?.()
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        console.error('[BubbleChart] fetch error:', err)
      }
    } finally {
      isFetchingRef.current = false
      setIsLoading(false)
    }
  }, [mode, rankingPage, categoryId, timeframe, favorites, createBubbles, resetProgressBar])

  // Always keep refs pointing at latest versions so timers and effects avoid stale closures
  fetchDataRef.current     = fetchData
  createBubblesRef.current = createBubbles

  // ── Effect: initial load + 3-minute auto-refresh ────────────────────────────
  useEffect(() => {
    fetchDataRef.current?.()
    const interval = setInterval(() => fetchDataRef.current?.(), 180_000)
    return () => {
      clearInterval(interval)
      clearInterval(rateLimitTimerRef.current)
      stopAnimation()
    }
  }, [stopAnimation])

  // ── Effect: redraw with new size metric — no API call needed ───────────────
  useEffect(() => {
    if (lastFetchedDataRef.current.length > 0) {
      createBubblesRef.current?.(lastFetchedDataRef.current)
    }
  }, [bubbleSizeMetric])

  // ── Effect: re-fetch when filter props change (skip initial mount) ───────────
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }
    fetchDataRef.current?.()
  }, [mode, rankingPage, categoryId, timeframe])

  // ── Effect: dim/highlight bubbles based on search query ─────────────────────
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      bubblesRef.current.forEach(b => {
        b.el.style.opacity = '1'
        b.el.style.pointerEvents = 'auto'
      })
      return
    }
    const matches = bubblesRef.current.filter(b =>
      b.coin.symbol.toLowerCase().startsWith(query) ||
      b.coin.name.toLowerCase().includes(query)
    )
    bubblesRef.current.forEach(b => {
      const isMatch    = matches.includes(b)
      const isFavorite = favorites.includes(b.coin.id)
      b.el.style.opacity      = (isMatch || isFavorite) ? '1' : '0.1'
      b.el.style.pointerEvents = (isMatch || isFavorite) ? 'auto' : 'none'
    })
  }, [searchQuery, favorites])

  // ── Effect: update favorite gold border live when favorites array changes ────
  useEffect(() => {
    bubblesRef.current.forEach(b => {
      if (favorites.includes(b.coin.id)) {
        b.el.classList.add('favorite-bubble')
      } else {
        b.el.classList.remove('favorite-bubble')
      }
    })
  }, [favorites])

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'relative', width: '100%', height: '85vh', overflow: 'hidden', background: '#111827' }}>

      {/* 3-minute progress bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#1f2937', zIndex: 10 }}>
        <div ref={progressRef} style={{ height: '100%', width: '100%', background: progressColor, transition: 'background-color 0.5s ease' }} />
      </div>

      {/* Loading spinner */}
      {isLoading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
          <div className="w-12 h-12 rounded-full border-4 border-gray-700 border-t-blue-500 animate-spin" />
        </div>
      )}

      {/* Bubble canvas — Bubble instances inject <div> elements here */}
      <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />

      {/* Rate limit toast */}
      {rateLimitWait > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-800 border border-yellow-500 rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3">
          <span className="text-yellow-400 text-xl">⏳</span>
          <div>
            <p className="text-white font-semibold">You are exploring fast!</p>
            <p className="text-gray-400 text-sm">Refreshing data in {rateLimitWait} seconds...</p>
          </div>
        </div>
      )}

    </div>
  )
}
