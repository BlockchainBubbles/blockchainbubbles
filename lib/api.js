import { incrementApiCall } from '@/lib/apiCounter'

const BASE = 'https://api.coingecko.com/api/v3'
const PRICE_CHANGE_PARAMS = '1h,24h,7d,30d,1y'

// ── Session cache ────────────────────────────────────────────────────────────
const sessionCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// ── Rate limit error ─────────────────────────────────────────────────────────
export class RateLimitError extends Error {
  constructor(waitSeconds) {
    super('Rate limit reached')
    this.waitSeconds = waitSeconds
    this.name = 'RateLimitError'
  }
}

// ── Rate limiter ─────────────────────────────────────────────────────────────
export const rateLimiter = {
  calls:     [],
  maxCalls:  8,
  windowMs:  60_000,

  canMakeCall() {
    const now = Date.now()
    this.calls = this.calls.filter(t => now - t < this.windowMs)
    return this.calls.length < this.maxCalls
  },

  recordCall() {
    this.calls.push(Date.now())
  },

  getWaitTime() {
    if (this.calls.length === 0) return 0
    const now = Date.now()
    const waitMs = this.windowMs - (now - this.calls[0])
    return Math.max(1, Math.ceil(waitMs / 1000))
  },

  getRemainingCalls() {
    const now = Date.now()
    this.calls = this.calls.filter(t => now - t < this.windowMs)
    return this.maxCalls - this.calls.length
  },
}

// ── Cache-or-fetch wrapper (handles rate limiting) ───────────────────────────
function getCachedOrFetch(cacheKey, fetchFn) {
  const now = Date.now()
  if (sessionCache.has(cacheKey)) {
    const cached = sessionCache.get(cacheKey)
    if (now - cached.savedAt < CACHE_DURATION) {
      console.log(`Cache hit: ${cacheKey} (${Math.floor((now - cached.savedAt) / 1000)}s old)`)
      return Promise.resolve(cached.data)
    }
  }

  if (!rateLimiter.canMakeCall()) {
    return Promise.reject(new RateLimitError(rateLimiter.getWaitTime()))
  }

  rateLimiter.recordCall()

  return fetchFn().then(data => {
    sessionCache.set(cacheKey, { data, savedAt: now })
    console.log(`Cache saved: ${cacheKey}`)
    return data
  })
}

// ── Public API ───────────────────────────────────────────────────────────────
export const TIMEFRAMES_COINGECKO = {
  '1h':  'price_change_percentage_1h_in_currency',
  '24h': 'price_change_percentage_24h_in_currency',
  '7d':  'price_change_percentage_7d_in_currency',
  '30d': 'price_change_percentage_30d_in_currency',
  '1y':  'price_change_percentage_1y_in_currency',
}

export async function fetchCoingeckoPage(page, timeframe = '1h') {
  return getCachedOrFetch(`ranking_${page}_${timeframe}`, async () => {
    const url = `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=${page}&sparkline=false&price_change_percentage=${PRICE_CHANGE_PARAMS}`
    incrementApiCall(`/coins/markets?page=${page}`)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`CoinGecko page ${page} failed: ${res.status}`)
    return res.json()
  })
}

export async function fetchCoingeckoCategory(categoryId, timeframe = '1h') {
  return getCachedOrFetch(`category_${categoryId}_${timeframe}`, async () => {
    const url = `${BASE}/coins/markets?vs_currency=usd&category=${encodeURIComponent(categoryId)}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=${PRICE_CHANGE_PARAMS}`
    incrementApiCall(`/coins/markets?category=${categoryId}`)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`CoinGecko category ${categoryId} failed: ${res.status}`)
    return res.json()
  })
}

export async function fetchFavorites(favoriteIds) {
  if (!favoriteIds || favoriteIds.length === 0) return []
  const ids = favoriteIds.join(',')
  return getCachedOrFetch(`favorites_${ids}`, async () => {
    const url = `${BASE}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=${PRICE_CHANGE_PARAMS}`
    incrementApiCall(`/coins/markets?ids=${ids.slice(0, 40)}`)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`CoinGecko favorites failed: ${res.status}`)
    return res.json()
  })
}

export async function fetchChartData(coinId) {
  console.log('[ChartDebug] fetchChartData called with coinId:', coinId, '| type:', typeof coinId)
  try {
    const res = await fetch(`/api/chart/${encodeURIComponent(coinId)}`)
    if (!res.ok) {
      console.log('[ChartDebug] Route error:', res.status, 'for coinId:', coinId)
      return { prices: [] }
    }
    const result = await res.json()
    const data   = result.data ?? result
    const prices = data.prices ?? []
    if (prices.length > 0) {
      const last = prices[prices.length - 1]
      console.log(`[ChartDebug] ${coinId} → ${prices.length} points | last: $${last[1]} @ ${new Date(last[0]).toISOString()} | fromCache: ${result.fromCache}`)
    } else {
      console.log('[ChartDebug] No price data returned for coinId:', coinId)
    }
    return data
  } catch (err) {
    console.log('[ChartDebug] Exception for coinId:', coinId, err)
    return { prices: [] }
  }
}

export async function searchCoins(query) {
  const res = await fetch(`${BASE}/search?query=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error('CoinGecko search failed')
  const data = await res.json()
  return data.coins ?? []
}

// Pre-fetch on module load — browser only, so 1-100/1h is always ready
if (typeof window !== 'undefined') {
  fetchCoingeckoPage(1, '1h').catch(() => {})
}
