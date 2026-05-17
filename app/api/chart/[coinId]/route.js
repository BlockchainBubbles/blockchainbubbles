const cache = new Map()
const CACHE_MS = 3 * 60 * 1000

export async function GET(request, { params }) {
  const { coinId } = await params
  const now = Date.now()
  const bust = new URL(request.url).searchParams.get('bust')

  console.log('[chart/route] Request for coinId:', coinId, '| bust:', bust)

  if (bust) {
    cache.delete(coinId)
    console.log('[chart/route] Cache busted for:', coinId)
  }

  if (cache.has(coinId)) {
    const cached = cache.get(coinId)
    if (now - cached.savedAt < CACHE_MS) {
      const prices = cached.data.prices ?? []
      if (prices.length > 0) {
        const last = prices[prices.length - 1]
        console.log(`[chart/route] Cache HIT for ${coinId} | last: $${last[1]} @ ${new Date(last[0]).toISOString()} | age: ${Math.floor((now - cached.savedAt) / 1000)}s`)
      }
      return Response.json({
        data: cached.data,
        fromCache: true,
        cacheAge: Math.floor((now - cached.savedAt) / 1000),
      })
    }
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=3`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      console.log(`[chart/route] CoinGecko error for ${coinId}: ${res.status}`)
      if (cache.has(coinId)) {
        return Response.json({ data: cache.get(coinId).data, fromCache: true, stale: true })
      }
      throw new Error(`CoinGecko error: ${res.status}`)
    }

    const data = await res.json()
    const prices = data.prices ?? []
    if (prices.length > 0) {
      const last = prices[prices.length - 1]
      console.log(`[chart/route] Fresh fetch for ${coinId} | ${prices.length} points | last: $${last[1]} @ ${new Date(last[0]).toISOString()}`)
    } else {
      console.log(`[chart/route] Fresh fetch for ${coinId} | NO price data returned`)
    }

    cache.set(coinId, { data, savedAt: now })

    return Response.json({ data, fromCache: false })
  } catch {
    if (cache.has(coinId)) {
      return Response.json({ data: cache.get(coinId).data, fromCache: true, stale: true })
    }
    return Response.json({ error: 'Failed to fetch chart data' }, { status: 500 })
  }
}
