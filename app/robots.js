export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: 'https://blockchainbubbles.com/sitemap.xml',
    host: 'https://blockchainbubbles.com',
  }
}
