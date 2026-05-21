export const metadata = {
  metadataBase: new URL('https://www.blockchainbubbles.com'),

  title: {
    absolute: 'Krypto Bubbles: was die bunten Kreise wirklich zeigen',
  },

  description: 'Krypto Bubble Chart in fünf Sekunden lesen, ohne Spreadsheet-Chaos und ohne Anmeldung. Was er zeigt, was er nicht zeigt, und wann TradingView besser ist.',

  keywords: [
    'krypto bubbles',
    'krypto bubble',
    'krypto bubble chart',
    'krypto heatmap',
    'kryptowährungen visualisierung',
    'krypto markt chart',
    'bitcoin bubble chart',
    'altcoin bubble chart deutsch',
    'krypto blasen chart',
    'live krypto chart',
  ],

  alternates: {
    canonical: 'https://www.blockchainbubbles.com/de',
    languages: {
      'en': 'https://www.blockchainbubbles.com',
      'de': 'https://www.blockchainbubbles.com/de',
    },
  },

  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://www.blockchainbubbles.com/de',
    siteName: 'Blockchain Bubbles',
    title: 'Krypto Bubbles: was die bunten Kreise wirklich zeigen',
    description: 'Krypto Bubble Chart in fünf Sekunden lesen, ohne Spreadsheet-Chaos und ohne Anmeldung. Was er zeigt, was er nicht zeigt, und wann TradingView besser ist.',
    images: [{
      url: 'https://www.blockchainbubbles.com/img/social-preview.png',
      width: 1200,
      height: 630,
      alt: 'Blockchain Bubbles - Krypto Markt Visualisierung',
    }],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Krypto Bubbles: was die bunten Kreise wirklich zeigen',
    description: 'Krypto Bubble Chart in fünf Sekunden lesen, ohne Spreadsheet-Chaos und ohne Anmeldung.',
    images: ['https://www.blockchainbubbles.com/img/social-preview.png'],
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
}

export default function DeLayout({ children }) {
  return children
}
