export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl || !imageUrl.includes('coingecko.com')) {
    return new Response('Invalid URL', { status: 400 })
  }

  const response = await fetch(imageUrl)
  if (!response.ok) {
    return new Response('Image fetch failed', { status: response.status })
  }

  const buffer = await response.arrayBuffer()
  const contentType = response.headers.get('content-type') || 'image/png'

  return new Response(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
