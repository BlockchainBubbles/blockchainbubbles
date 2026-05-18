/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  experimental: {
    optimizeCss: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
      },
    ],
  },

  async redirects() {
    return [
      // Old HTML pages to new Next.js URLs
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/crypto_profile_calculator.html',
        destination: '/calculators/crypto-profit-calculator',
        permanent: true,
      },
      {
        source: '/crypto_futures_calculator.html',
        destination: '/calculators/crypto-futures-calculator',
        permanent: true,
      },
      {
        source: '/slippage_calculator.html',
        destination: '/calculators/crypto-slippage-calculator',
        permanent: true,
      },
      {
        source: '/staking_rewards_calculator.html',
        destination: '/calculators/staking-rewards-calculator',
        permanent: true,
      },
      {
        source: '/dca_calculator.html',
        destination: '/calculators/dca-calculator',
        permanent: true,
      },
      {
        source: '/impermanent_loss_calculator.html',
        destination: '/calculators/impermanent-loss-calculator',
        permanent: true,
      },
      {
        source: '/crypto-comparison-tool.html',
        destination: '/compare-cryptocurrencies',
        permanent: true,
      },
      {
        source: '/privacy-policy.html',
        destination: '/privacy-policy',
        permanent: true,
      },
      {
        source: '/terms-of-service.html',
        destination: '/terms-of-service',
        permanent: true,
      },
      // Old Next.js short URLs to new full URLs
      {
        source: '/calculators/dca',
        destination: '/calculators/dca-calculator',
        permanent: true,
      },
      {
        source: '/calculators/staking',
        destination: '/calculators/staking-rewards-calculator',
        permanent: true,
      },
      {
        source: '/calculators/futures',
        destination: '/calculators/crypto-futures-calculator',
        permanent: true,
      },
      {
        source: '/calculators/slippage',
        destination: '/calculators/crypto-slippage-calculator',
        permanent: true,
      },
      {
        source: '/calculators/impermanent-loss',
        destination: '/calculators/impermanent-loss-calculator',
        permanent: true,
      },
      {
        source: '/calculators/profile',
        destination: '/calculators/crypto-profit-calculator',
        permanent: true,
      },
      {
        source: '/compare',
        destination: '/compare-cryptocurrencies',
        permanent: true,
      },
    ]
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=180, stale-while-revalidate=60',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
