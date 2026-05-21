export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: 'https://www.blockchainbubbles.com/sitemap.xml',
    host: 'https://www.blockchainbubbles.com',
  }
}
