const cache = {}
const CACHE_DURATION = 3 * 60 * 1000 // 3 minutes

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3/coins/markets'
const PRICE_CHANGE_PARAMS = '1h,24h,7d,30d,1y'

async function fetchFromCoinGecko(page, category, ids) {
  const params = new URLSearchParams({
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: '100',
    page: String(page),
    sparkline: 'false',
    price_change_percentage: PRICE_CHANGE_PARAMS,
  })
  if (category) params.set('category', category)
  if (ids) params.set('ids', ids)

  const res = await fetch(`${COINGECKO_BASE}?${params}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })

  if (res.status === 429) throw new Error('RATE_LIMITED')
  if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`)
  return res.json()
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const page     = searchParams.get('page')     || '1'
  const category = searchParams.get('category') || null
  const ids      = searchParams.get('ids')      || null

  const cacheKey = `${page}-${category ?? 'all'}-${ids ?? 'none'}`
  const now = Date.now()

  const hit = cache[cacheKey]
  if (hit && now - hit.timestamp < CACHE_DURATION) {
    return Response.json(
      { data: hit.data, fromCache: true, cacheAge: Math.floor((now - hit.timestamp) / 1000) },
      { headers: { 'Cache-Control': 'public, s-maxage=180', 'X-Cache': 'HIT' } },
    )
  }

  try {
    const data = await fetchFromCoinGecko(parseInt(page, 10), category, ids)
    cache[cacheKey] = { data, timestamp: now }
    return Response.json(
      { data, fromCache: false, cacheAge: 0 },
      { headers: { 'Cache-Control': 'public, s-maxage=180', 'X-Cache': 'MISS' } },
    )
  } catch (err) {
    // Serve stale cache rather than a hard error
    if (cache[cacheKey]?.data) {
      return Response.json(
        { data: cache[cacheKey].data, fromCache: true, stale: true },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    }
    const status = err.message === 'RATE_LIMITED' ? 429 : 500
    return Response.json({ error: err.message }, { status })
  }
}
