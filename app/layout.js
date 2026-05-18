import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Script from 'next/script'
import { StoreProvider } from '@/lib/store'

const inter = Inter({ subsets: ['latin'], display: 'swap', preload: true })

export const metadata = {
  metadataBase: new URL('https://blockchainbubbles.com'),

  title: {
    default: 'Crypto Bubbles Live — Free Bubble Chart, Map & Heatmap | Blockchain Bubbles',
    template: '%s | Blockchain Bubbles',
  },

  description: 'Track crypto bubbles live with our free interactive bubble chart and map. Visualize 1000+ coins by market cap, volume or price change. Updated every 3 minutes.',

  keywords: [
    'crypto bubbles', 'crypto bubble chart',
    'blockchain bubbles', 'crypto heatmap',
    'cryptocurrency visualization',
    'live crypto chart', 'crypto market map',
    'altcoin bubbles', 'bitcoin bubble chart',
  ],

  authors: [{ name: 'Blockchain Bubbles' }],
  creator: 'Blockchain Bubbles',
  publisher: 'Blockchain Bubbles',

  alternates: {
    canonical: 'https://blockchainbubbles.com',
  },

  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
    shortcut: '/favicon.svg',
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://blockchainbubbles.com',
    siteName: 'Blockchain Bubbles',
    title: 'Live Crypto Bubble Chart & HeatMap - Blockchain Bubbles',
    description: 'Instantly visualize the entire cryptocurrency market with our live, interactive bubble chart.',
    images: [{
      url: 'https://blockchainbubbles.com/img/social-preview.png',
      width: 1200,
      height: 630,
      alt: 'Blockchain Bubbles - Live Crypto Market Visualization',
    }],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Live Crypto Bubble Chart & HeatMap - Blockchain Bubbles',
    description: 'Instantly visualize the entire cryptocurrency market with our live, interactive bubble chart.',
    images: ['https://blockchainbubbles.com/img/social-preview.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
    other: {
      'msvalidate.01': 'D75B88F2C1A57E245C1AD580EBFD9778',
    },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'name': 'Blockchain Bubbles | Live Crypto Market Visualization & Heat Map',
  'description': 'Instantly visualize the entire cryptocurrency market with Blockchain Bubbles. Our live, interactive bubble chart and heat map help you spot top-performing coins, track market sentiment, and analyze trends in real-time.',
  'url': 'https://blockchainbubbles.com/',
  'mainEntity': {
    '@type': 'WebSite',
    'name': 'Blockchain Bubbles',
    'url': 'https://blockchainbubbles.com/',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://blockchainbubbles.com/?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
  'breadcrumb': {
    '@type': 'BreadcrumbList',
    'itemListElement': [{
      '@type': 'ListItem',
      'position': 1,
      'name': 'Home',
      'item': 'https://blockchainbubbles.com/',
    }],
  },
  'publisher': {
    '@type': 'Organization',
    'name': 'Blockchain Bubbles',
    'logo': {
      '@type': 'ImageObject',
      'url': 'https://blockchainbubbles.com/favicon-512x512.png',
    },
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.coingecko.com" />
        <link rel="dns-prefetch" href="https://coin-images.coingecko.com" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-192x192.png" type="image/png" sizes="192x192" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-gray-900 text-gray-100 antialiased min-h-screen`}>
        <StoreProvider>
          <Navbar />
          {children}
          <Footer />
        </StoreProvider>

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K8WNJB2GNV"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-K8WNJB2GNV', { page_path: window.location.pathname, transport_type: 'beacon' });
        `}</Script>
      </body>
    </html>
  )
}
